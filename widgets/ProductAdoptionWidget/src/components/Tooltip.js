/**
 * Tooltip component for displaying tour steps
 */

import { createElement, getElementPosition, addClass, removeClass } from '../utils/dom';
import { CSS_CLASSES, PLACEMENT_MAPPINGS } from '../utils/constants';

export default class Tooltip {
  constructor(config) {
    this.config = config;
    this.element = null;
    this.targetElement = null;
    this.callbacks = null;
    this.isVisible = false;
  }

  /**
   * Create tooltip element
   */
  createElement() {
    if (this.element) return;

    this.element = createElement('div', {
      className: `${CSS_CLASSES.TOOLTIP} ${CSS_CLASSES.TOOLTIP}-${this.config.theme}`,
      style: {
        position: 'absolute',
        zIndex: this.config.zIndex + 1,
        opacity: '0',
        transition: `opacity ${this.config.animationDuration}ms ease-in-out`
      }
    });

    document.body.appendChild(this.element);
  }

  /**
   * Show tooltip
   * @param {Element} target - Target element
   * @param {Object} stepData - Step data
   * @param {Object} callbacks - Event callbacks
   */
  show(target, stepData, callbacks) {
    this.targetElement = target;
    this.callbacks = callbacks;
    
    // Create element if needed
    this.createElement();

    // Build content
    this.element.innerHTML = this.buildContent(stepData);

    // Set up event listeners
    this.setupEventListeners();

    // Position tooltip
    this.position(target, stepData.placement);

    // Show with animation
    if (this.config.animation) {
      requestAnimationFrame(() => {
        this.element.style.opacity = '1';
        addClass(this.element, 'paw-tooltip-active', true);
      });
    } else {
      this.element.style.opacity = '1';
      addClass(this.element, 'paw-tooltip-active');
    }

    this.isVisible = true;
  }

  /**
   * Hide tooltip
   */
  hide() {
    if (!this.element || !this.isVisible) return;

    // Hide with animation
    this.element.style.opacity = '0';
    removeClass(this.element, 'paw-tooltip-active');

    setTimeout(() => {
      if (this.element) {
        this.element.innerHTML = '';
        this.removeEventListeners();
      }
    }, this.config.animationDuration);

    this.isVisible = false;
  }

  /**
   * Build tooltip content
   * @param {Object} stepData - Step data
   * @returns {string} HTML content
   */
  buildContent(stepData) {
    const showProgress = this.config.showProgressBar && stepData.totalSteps > 1;
    const showStepNumber = this.config.showStepNumbers && stepData.totalSteps > 1;

    return `
      <div class="paw-tooltip-header">
        ${showStepNumber ? `
          <div class="paw-tooltip-step-number">
            Step ${stepData.stepIndex + 1} of ${stepData.totalSteps}
          </div>
        ` : ''}
        <button class="paw-tooltip-close ${CSS_CLASSES.CLOSE_BUTTON}" data-action="close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      ${stepData.title ? `
        <div class="paw-tooltip-title">${stepData.title}</div>
      ` : ''}
      
      ${stepData.content ? `
        <div class="paw-tooltip-content">${stepData.content}</div>
      ` : ''}
      
      ${showProgress ? `
        <div class="paw-tooltip-progress">
          <div class="${CSS_CLASSES.PROGRESS_BAR}">
            <div class="paw-progress-fill" style="width: ${stepData.progress}%"></div>
          </div>
        </div>
      ` : ''}
      
      <div class="paw-tooltip-footer">
        <div class="paw-tooltip-buttons">
          ${!stepData.isFirst ? `
            <button class="${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_SECONDARY}" data-action="prev">
              ${stepData.buttons.prev}
            </button>
          ` : ''}
          
          ${!stepData.isLast ? `
            <button class="${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_SECONDARY}" data-action="skip">
              ${stepData.buttons.skip}
            </button>
          ` : ''}
          
          <button class="${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_PRIMARY}" data-action="${stepData.isLast ? 'done' : 'next'}">
            ${stepData.isLast ? stepData.buttons.done : stepData.buttons.next}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Position tooltip relative to target
   * @param {Element} target - Target element
   * @param {string} placement - Placement position
   */
  position(target, placement = 'bottom') {
    const tooltipRect = this.element.getBoundingClientRect();
    const padding = 10;
    
    let top, left;

    if (!target) {
      // Center in viewport if no target
      top = (window.innerHeight - tooltipRect.height) / 2;
      left = (window.innerWidth - tooltipRect.width) / 2;
    } else {
      const targetPos = getElementPosition(target);
      const placementConfig = PLACEMENT_MAPPINGS[placement] || PLACEMENT_MAPPINGS.bottom;

      // Calculate position based on placement
      switch (placementConfig.main) {
        case 'top':
          top = targetPos.viewportTop - tooltipRect.height - padding;
          break;
        case 'bottom':
          top = targetPos.viewportTop + targetPos.height + padding;
          break;
        case 'left':
          left = targetPos.viewportLeft - tooltipRect.width - padding;
          break;
        case 'right':
          left = targetPos.viewportLeft + targetPos.width + padding;
          break;
      }

      // Calculate cross-axis position
      if (placementConfig.main === 'top' || placementConfig.main === 'bottom') {
        switch (placementConfig.cross) {
          case 'start':
            left = targetPos.viewportLeft;
            break;
          case 'end':
            left = targetPos.viewportLeft + targetPos.width - tooltipRect.width;
            break;
          default: // center
            left = targetPos.viewportLeft + (targetPos.width - tooltipRect.width) / 2;
        }
      } else {
        switch (placementConfig.cross) {
          case 'start':
            top = targetPos.viewportTop;
            break;
          case 'end':
            top = targetPos.viewportTop + targetPos.height - tooltipRect.height;
            break;
          default: // center
            top = targetPos.viewportTop + (targetPos.height - tooltipRect.height) / 2;
        }
      }

      // Ensure tooltip stays within viewport
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    }

    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    if (!this.element) return;

    this.handleClick = (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;

      const action = button.dataset.action;
      
      switch (action) {
        case 'next':
        case 'done':
          if (this.callbacks.onNext) this.callbacks.onNext();
          break;
        case 'prev':
          if (this.callbacks.onPrev) this.callbacks.onPrev();
          break;
        case 'skip':
          if (this.callbacks.onSkip) this.callbacks.onSkip();
          break;
        case 'close':
          if (this.callbacks.onClose) this.callbacks.onClose();
          break;
      }
    };

    this.element.addEventListener('click', this.handleClick);

    // Reposition on window resize
    this.handleResize = () => {
      if (this.targetElement && this.isVisible) {
        this.position(this.targetElement);
      }
    };

    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    if (this.element && this.handleClick) {
      this.element.removeEventListener('click', this.handleClick);
    }
    
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  /**
   * Destroy tooltip
   */
  destroy() {
    this.hide();
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
    this.targetElement = null;
    this.callbacks = null;
  }
}