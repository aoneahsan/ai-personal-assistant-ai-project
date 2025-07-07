/**
 * Tour execution engine
 */

import Tooltip from '../components/Tooltip';
import Backdrop from '../components/Backdrop';
import Highlighter from '../components/Highlighter';
import { WIDGET_EVENTS, TOUR_STEP_DEFAULTS } from '../utils/constants';
import { validateTourStep } from '../utils/validation';
import { scrollToElement, waitForElement } from '../utils/dom';

export default class TourEngine {
  constructor(config, eventBus, storage) {
    this.config = config;
    this.eventBus = eventBus;
    this.storage = storage;
    
    this.tours = [];
    this.activeTour = null;
    this.currentStep = 0;
    
    this.tooltip = new Tooltip(config);
    this.backdrop = new Backdrop(config);
    this.highlighter = new Highlighter(config);
    
    this.isActive = this.isActive.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
    this.endTour = this.endTour.bind(this);
  }

  /**
   * Set available tours
   * @param {Array} tours - Tours array
   */
  setTours(tours) {
    this.tours = tours.map(tour => ({
      ...tour,
      steps: tour.steps.map(step => ({
        ...TOUR_STEP_DEFAULTS,
        ...step
      }))
    }));
  }

  /**
   * Get all tours
   * @returns {Array} Tours
   */
  getTours() {
    return this.tours;
  }

  /**
   * Get tour by ID
   * @param {string} tourId - Tour ID
   * @returns {Object|null} Tour or null
   */
  getTour(tourId) {
    return this.tours.find(tour => tour.id === tourId) || null;
  }

  /**
   * Get first available tour
   * @returns {Object|null} Tour or null
   */
  getFirstAvailableTour() {
    const completedTours = this.storage.get('completedTours') || [];
    return this.tours.find(tour => {
      if (tour.showOnce && completedTours.includes(tour.id)) {
        return false;
      }
      if (tour.condition && typeof tour.condition === 'function') {
        return tour.condition();
      }
      return true;
    }) || null;
  }

  /**
   * Check if tour is active
   * @returns {boolean} Is active
   */
  isActive() {
    return this.activeTour !== null;
  }

  /**
   * Start a tour
   * @param {string} tourId - Tour ID
   * @param {number} startStep - Starting step
   * @returns {boolean} Success
   */
  startTour(tourId, startStep = 0) {
    if (this.isActive()) {
      this.endTour();
    }

    const tour = this.getTour(tourId);
    if (!tour) {
      console.error(`[TourEngine] Tour not found: ${tourId}`);
      return false;
    }

    try {
      this.activeTour = tour;
      this.currentStep = startStep;

      // Save progress
      this.storage.set('currentProgress', {
        tourId: tour.id,
        step: startStep,
        startedAt: Date.now()
      });

      // Emit start event
      this.eventBus.emit(WIDGET_EVENTS.TOUR_START, {
        tourId: tour.id,
        totalSteps: tour.steps.length
      });

      // Show first step
      this.showStep(startStep);

      return true;
    } catch (error) {
      console.error('[TourEngine] Error starting tour:', error);
      this.endTour();
      return false;
    }
  }

  /**
   * Show a specific step
   * @param {number} stepIndex - Step index
   */
  async showStep(stepIndex) {
    if (!this.activeTour || stepIndex < 0 || stepIndex >= this.activeTour.steps.length) {
      return;
    }

    const step = this.activeTour.steps[stepIndex];
    
    // Validate step
    const validation = validateTourStep(step, stepIndex);
    if (!validation.valid) {
      console.error('[TourEngine] Invalid step:', validation.errors);
      return;
    }

    try {
      // Hide current elements
      this.tooltip.hide();
      this.backdrop.hide();
      this.highlighter.hide();

      // Wait for target element if specified
      let targetElement = null;
      if (step.target) {
        targetElement = await waitForElement(step.target, 5000);
        if (!targetElement) {
          console.warn(`[TourEngine] Target element not found: ${step.target}`);
          // Continue without target
        }
      }

      // Scroll to element if needed
      if (targetElement && step.scrollTo) {
        await scrollToElement(targetElement, step.scrollOffset);
      }

      // Show backdrop if enabled
      if (step.backdrop && this.config.backdrop) {
        this.backdrop.show(targetElement);
      }

      // Highlight target element
      if (targetElement) {
        this.highlighter.highlight(targetElement);
      }

      // Prepare step data
      const stepData = {
        ...step,
        stepIndex,
        totalSteps: this.activeTour.steps.length,
        isFirst: stepIndex === 0,
        isLast: stepIndex === this.activeTour.steps.length - 1,
        progress: ((stepIndex + 1) / this.activeTour.steps.length) * 100
      };

      // Show tooltip
      this.tooltip.show(targetElement, stepData, {
        onNext: this.nextStep,
        onPrev: this.prevStep,
        onSkip: () => this.skipTour(),
        onClose: this.endTour
      });

      // Update current step
      this.currentStep = stepIndex;

      // Save progress
      this.storage.set('currentProgress', {
        tourId: this.activeTour.id,
        step: stepIndex,
        updatedAt: Date.now()
      });

      // Emit step change event
      this.eventBus.emit(WIDGET_EVENTS.STEP_CHANGE, {
        tourId: this.activeTour.id,
        stepIndex,
        step: stepData
      });

    } catch (error) {
      console.error('[TourEngine] Error showing step:', error);
      this.endTour();
    }
  }

  /**
   * Go to next step
   */
  nextStep() {
    if (!this.activeTour) return;

    const nextIndex = this.currentStep + 1;
    
    if (nextIndex >= this.activeTour.steps.length) {
      this.completeTour();
    } else {
      this.showStep(nextIndex);
    }
  }

  /**
   * Go to previous step
   */
  prevStep() {
    if (!this.activeTour) return;

    const prevIndex = this.currentStep - 1;
    
    if (prevIndex >= 0) {
      this.showStep(prevIndex);
    }
  }

  /**
   * Go to specific step
   * @param {number} stepIndex - Step index
   */
  goToStep(stepIndex) {
    if (!this.activeTour) return;
    
    if (stepIndex >= 0 && stepIndex < this.activeTour.steps.length) {
      this.showStep(stepIndex);
    }
  }

  /**
   * Skip the current tour
   */
  skipTour() {
    if (!this.activeTour) return;

    const tourId = this.activeTour.id;
    
    // Emit skip event
    this.eventBus.emit(WIDGET_EVENTS.TOUR_SKIP, {
      tourId,
      skippedAt: this.currentStep,
      totalSteps: this.activeTour.steps.length
    });

    this.endTour();
  }

  /**
   * Complete the current tour
   */
  completeTour() {
    if (!this.activeTour) return;

    const tourId = this.activeTour.id;
    
    // Mark tour as completed
    const completedTours = this.storage.get('completedTours') || [];
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId);
      this.storage.set('completedTours', completedTours);
    }

    // Emit complete event
    this.eventBus.emit(WIDGET_EVENTS.TOUR_COMPLETE, {
      tourId,
      totalSteps: this.activeTour.steps.length,
      completedAt: Date.now()
    });

    this.endTour();
  }

  /**
   * End the current tour
   */
  endTour() {
    if (!this.activeTour) return;

    // Hide all elements
    this.tooltip.hide();
    this.backdrop.hide();
    this.highlighter.hide();

    // Clear progress
    this.storage.remove('currentProgress');

    // Reset state
    this.activeTour = null;
    this.currentStep = 0;
  }

  /**
   * Get current progress
   * @returns {Object} Progress information
   */
  getProgress() {
    if (!this.activeTour) {
      return {
        active: false,
        tourId: null,
        currentStep: 0,
        totalSteps: 0,
        progress: 0
      };
    }

    return {
      active: true,
      tourId: this.activeTour.id,
      currentStep: this.currentStep,
      totalSteps: this.activeTour.steps.length,
      progress: ((this.currentStep + 1) / this.activeTour.steps.length) * 100
    };
  }

  /**
   * Reset tour engine
   */
  reset() {
    this.endTour();
    this.tours = [];
  }

  /**
   * Destroy tour engine
   */
  destroy() {
    this.endTour();
    this.tooltip.destroy();
    this.backdrop.destroy();
    this.highlighter.destroy();
  }
}