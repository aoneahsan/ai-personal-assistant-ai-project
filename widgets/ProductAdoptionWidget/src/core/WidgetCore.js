/**
 * Core widget implementation
 */

import TourEngine from './TourEngine';
import EventBus from '../utils/EventBus';
import StorageManager from '../utils/StorageManager';
import Analytics from '../analytics/Analytics';
import { createWidgetContainer, injectStyles } from '../styles/StyleManager';
import { WIDGET_EVENTS } from '../utils/constants';

export default class WidgetCore {
  constructor(config) {
    this.config = config;
    this.instanceId = config.instanceId;
    this.container = null;
    this.tourEngine = null;
    this.eventBus = new EventBus();
    this.storage = new StorageManager(config.storage);
    this.analytics = new Analytics(config.analytics, this.eventBus);
    this.initialized = false;
    this.destroyed = false;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.destroy = this.destroy.bind(this);
    this.startTour = this.startTour.bind(this);
  }

  /**
   * Initialize the widget
   */
  async initialize() {
    if (this.initialized || this.destroyed) return;

    try {
      // Inject styles
      injectStyles(this.config);

      // Create container
      this.container = createWidgetContainer(this.instanceId, this.config);
      
      // Initialize tour engine
      this.tourEngine = new TourEngine(this.config, this.eventBus, this.storage);

      // Load tours from API if configured
      if (this.config.apiEndpoint && this.config.apiKey) {
        await this.loadToursFromAPI();
      } else if (this.config.tours && this.config.tours.length > 0) {
        this.tourEngine.setTours(this.config.tours);
      }

      // Set up event listeners
      this.setupEventListeners();

      // Initialize analytics
      this.analytics.initialize();

      // Mark as initialized
      this.initialized = true;

      // Emit events
      this.eventBus.emit(WIDGET_EVENTS.INIT, { instanceId: this.instanceId });
      this.eventBus.emit(WIDGET_EVENTS.READY, { instanceId: this.instanceId });

      // Execute init callback
      if (this.config.callbacks.onInit) {
        this.config.callbacks.onInit(this);
      }

      // Auto-start if configured
      if (this.config.autoStart) {
        setTimeout(() => {
          const firstTour = this.tourEngine.getFirstAvailableTour();
          if (firstTour) {
            this.startTour(firstTour.id);
          }
        }, this.config.startDelay);
      }

      if (this.config.debug) {
        console.log('[ProductAdoptionWidget] Initialized:', this.instanceId);
      }
    } catch (error) {
      console.error('[ProductAdoptionWidget] Initialization error:', error);
      this.eventBus.emit(WIDGET_EVENTS.ERROR, { error, instanceId: this.instanceId });
      
      if (this.config.callbacks.onError) {
        this.config.callbacks.onError(error);
      }
      
      throw error;
    }
  }

  /**
   * Load tours from API
   */
  async loadToursFromAPI() {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.tours && Array.isArray(data.tours)) {
        this.tourEngine.setTours(data.tours);
      }
    } catch (error) {
      console.error('[ProductAdoptionWidget] API error:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Handle keyboard events
    if (this.config.closeOnEscape) {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    // Handle tour events
    this.eventBus.on(WIDGET_EVENTS.TOUR_COMPLETE, (data) => {
      if (this.config.callbacks.onComplete) {
        this.config.callbacks.onComplete(data);
      }
    });

    this.eventBus.on(WIDGET_EVENTS.TOUR_SKIP, (data) => {
      if (this.config.callbacks.onSkip) {
        this.config.callbacks.onSkip(data);
      }
    });

    this.eventBus.on(WIDGET_EVENTS.STEP_CHANGE, (data) => {
      if (this.config.callbacks.onStep) {
        this.config.callbacks.onStep(data);
      }
    });
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown = (event) => {
    if (event.key === 'Escape' && this.tourEngine.isActive()) {
      this.tourEngine.endTour();
    }
  }

  /**
   * Start a tour
   * @param {string} tourId - Tour ID
   * @param {number} startStep - Starting step index
   */
  startTour(tourId, startStep = 0) {
    if (!this.initialized || this.destroyed) {
      console.warn('[ProductAdoptionWidget] Widget not initialized');
      return false;
    }

    try {
      const started = this.tourEngine.startTour(tourId, startStep);
      
      if (started && this.config.callbacks.onStart) {
        this.config.callbacks.onStart({ tourId, startStep });
      }
      
      return started;
    } catch (error) {
      console.error('[ProductAdoptionWidget] Error starting tour:', error);
      this.eventBus.emit(WIDGET_EVENTS.ERROR, { error, tourId });
      return false;
    }
  }

  /**
   * End the current tour
   */
  endTour() {
    if (this.tourEngine) {
      this.tourEngine.endTour();
    }
  }

  /**
   * Go to next step
   */
  nextStep() {
    if (this.tourEngine) {
      this.tourEngine.nextStep();
    }
  }

  /**
   * Go to previous step
   */
  prevStep() {
    if (this.tourEngine) {
      this.tourEngine.prevStep();
    }
  }

  /**
   * Go to specific step
   * @param {number} stepIndex - Step index
   */
  goToStep(stepIndex) {
    if (this.tourEngine) {
      this.tourEngine.goToStep(stepIndex);
    }
  }

  /**
   * Get current tour progress
   * @returns {Object} Progress information
   */
  getProgress() {
    if (!this.tourEngine) return null;
    return this.tourEngine.getProgress();
  }

  /**
   * Get available tours
   * @returns {Array} Available tours
   */
  getTours() {
    if (!this.tourEngine) return [];
    return this.tourEngine.getTours();
  }

  /**
   * Reset widget state
   */
  reset() {
    this.storage.clear();
    if (this.tourEngine) {
      this.tourEngine.reset();
    }
  }

  /**
   * Destroy the widget
   */
  destroy() {
    if (this.destroyed) return;

    try {
      // End active tour
      if (this.tourEngine && this.tourEngine.isActive()) {
        this.tourEngine.endTour();
      }

      // Remove event listeners
      if (this.config.closeOnEscape) {
        document.removeEventListener('keydown', this.handleKeyDown);
      }

      // Destroy components
      if (this.tourEngine) {
        this.tourEngine.destroy();
      }

      // Remove container
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      // Clear storage if needed
      if (this.config.storage.clearOnDestroy) {
        this.storage.clear();
      }

      // Clean up
      this.eventBus.removeAllListeners();
      this.analytics.destroy();
      
      this.destroyed = true;
      this.initialized = false;

      if (this.config.debug) {
        console.log('[ProductAdoptionWidget] Destroyed:', this.instanceId);
      }
    } catch (error) {
      console.error('[ProductAdoptionWidget] Destroy error:', error);
    }
  }

  /**
   * Subscribe to widget events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    this.eventBus.on(event, handler);
  }

  /**
   * Unsubscribe from widget events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    this.eventBus.off(event, handler);
  }
}