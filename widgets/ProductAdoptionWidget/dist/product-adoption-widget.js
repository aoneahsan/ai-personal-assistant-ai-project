(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ProductAdoptionWidget"] = factory();
	else
		root["ProductAdoptionWidget"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/analytics/Analytics.js":
/*!************************************!*\
  !*** ./src/analytics/Analytics.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Analytics)
/* harmony export */ });
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants */ "./src/utils/constants.js");
/**
 * Analytics module for tracking widget events
 */


class Analytics {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.sessionId = this.generateSessionId();
    this.events = [];
  }

  /**
   * Initialize analytics
   */
  initialize() {
    if (!this.config.enabled) return;

    // Subscribe to widget events
    if (this.config.trackEvents) {
      this.subscribeToEvents();
    }

    // Send initialization event
    this.track('widget_initialized', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to widget events
   */
  subscribeToEvents() {
    // Track tour events
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_0__.WIDGET_EVENTS.TOUR_START, data => {
      this.track('tour_started', {
        tourId: data.tourId,
        totalSteps: data.totalSteps
      });
    });
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_0__.WIDGET_EVENTS.TOUR_COMPLETE, data => {
      this.track('tour_completed', {
        tourId: data.tourId,
        totalSteps: data.totalSteps,
        duration: Date.now() - data.startedAt
      });
    });
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_0__.WIDGET_EVENTS.TOUR_SKIP, data => {
      this.track('tour_skipped', {
        tourId: data.tourId,
        skippedAt: data.skippedAt,
        totalSteps: data.totalSteps
      });
    });

    // Track step events
    if (this.config.trackProgress) {
      this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_0__.WIDGET_EVENTS.STEP_CHANGE, data => {
        this.track('step_viewed', {
          tourId: data.tourId,
          stepIndex: data.stepIndex,
          stepTitle: data.step.title
        });
      });
      this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_0__.WIDGET_EVENTS.STEP_COMPLETE, data => {
        this.track('step_completed', {
          tourId: data.tourId,
          stepIndex: data.stepIndex
        });
      });
    }

    // Track errors
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_0__.WIDGET_EVENTS.ERROR, data => {
      this.track('widget_error', {
        error: data.error.message,
        context: data.context
      });
    });
  }

  /**
   * Track an event
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   */
  track(eventName) {
    let eventData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!this.config.enabled) return;
    const event = {
      name: eventName,
      data: {
        ...eventData,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    // Store event
    this.events.push(event);

    // Send to custom tracker if provided
    if (this.config.customTracker && typeof this.config.customTracker === 'function') {
      try {
        this.config.customTracker(event);
      } catch (error) {
        console.error('[Analytics] Custom tracker error:', error);
      }
    }

    // Send to analytics services
    this.sendToAnalytics(event);
  }

  /**
   * Send event to analytics services
   * @param {Object} event - Event object
   */
  sendToAnalytics(event) {
    // Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', event.name, {
        event_category: 'ProductAdoptionWidget',
        event_label: event.data.tourId || 'general',
        value: event.data.stepIndex || 0,
        custom_data: event.data
      });
    }

    // Google Analytics (Universal Analytics)
    if (typeof window.ga === 'function') {
      window.ga('send', 'event', {
        eventCategory: 'ProductAdoptionWidget',
        eventAction: event.name,
        eventLabel: event.data.tourId || 'general',
        eventValue: event.data.stepIndex || 0
      });
    }

    // Segment
    if (typeof window.analytics === 'object' && window.analytics.track) {
      window.analytics.track(event.name, event.data);
    }

    // Mixpanel
    if (typeof window.mixpanel === 'object' && window.mixpanel.track) {
      window.mixpanel.track(event.name, event.data);
    }

    // Amplitude
    if (typeof window.amplitude === 'object' && window.amplitude.track) {
      window.amplitude.track(event.name, event.data);
    }

    // PostHog
    if (typeof window.posthog === 'object' && window.posthog.capture) {
      window.posthog.capture(event.name, event.data);
    }

    // Custom endpoint
    if (this.config.endpoint) {
      this.sendToEndpoint(event);
    }
  }

  /**
   * Send event to custom endpoint
   * @param {Object} event - Event object
   */
  async sendToEndpoint(event) {
    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }

  /**
   * Get all tracked events
   * @returns {Array} Events array
   */
  getEvents() {
    return this.events;
  }

  /**
   * Clear tracked events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `paw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy analytics
   */
  destroy() {
    // Send any remaining events
    if (this.events.length > 0 && this.config.endpoint) {
      this.sendToEndpoint({
        name: 'session_end',
        data: {
          sessionId: this.sessionId,
          totalEvents: this.events.length,
          events: this.events
        }
      });
    }
    this.clearEvents();
  }
}

/***/ }),

/***/ "./src/components/Backdrop.js":
/*!************************************!*\
  !*** ./src/components/Backdrop.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Backdrop)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/constants */ "./src/utils/constants.js");
/**
 * Backdrop component for highlighting elements
 */



class Backdrop {
  constructor(config) {
    this.config = config;
    this.element = null;
    this.isVisible = false;
    this.onClick = null;
  }

  /**
   * Create backdrop element
   */
  createElement() {
    if (this.element) return;
    this.element = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: _utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BACKDROP,
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: this.config.backdropColor,
        zIndex: this.config.zIndex,
        opacity: '0',
        transition: `opacity ${this.config.animationDuration}ms ease-in-out`,
        pointerEvents: this.config.closeOnBackdropClick ? 'auto' : 'none'
      }
    });
    document.body.appendChild(this.element);
  }

  /**
   * Show backdrop
   * @param {Element} excludeElement - Element to exclude from backdrop
   */
  show() {
    let excludeElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    // Create element if needed
    this.createElement();

    // Add click handler if enabled
    if (this.config.closeOnBackdropClick) {
      this.onClick = event => {
        if (event.target === this.element) {
          // Emit close event through tour engine
          const closeEvent = new CustomEvent('backdrop:click');
          document.dispatchEvent(closeEvent);
        }
      };
      this.element.addEventListener('click', this.onClick);
    }

    // Show with animation
    if (this.config.animation) {
      requestAnimationFrame(() => {
        this.element.style.opacity = '1';
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addClass)(this.element, 'paw-backdrop-active', true);
      });
    } else {
      this.element.style.opacity = '1';
      (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addClass)(this.element, 'paw-backdrop-active');
    }
    this.isVisible = true;
  }

  /**
   * Hide backdrop
   */
  hide() {
    if (!this.element || !this.isVisible) return;

    // Remove click handler
    if (this.onClick) {
      this.element.removeEventListener('click', this.onClick);
      this.onClick = null;
    }

    // Hide with animation
    this.element.style.opacity = '0';
    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.removeClass)(this.element, 'paw-backdrop-active');
    this.isVisible = false;
  }

  /**
   * Update backdrop color
   * @param {string} color - New color
   */
  updateColor(color) {
    if (this.element) {
      this.element.style.backgroundColor = color;
    }
  }

  /**
   * Destroy backdrop
   */
  destroy() {
    this.hide();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

/***/ }),

/***/ "./src/components/Highlighter.js":
/*!***************************************!*\
  !*** ./src/components/Highlighter.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Highlighter)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/constants */ "./src/utils/constants.js");
/**
 * Highlighter component for emphasizing target elements
 */



class Highlighter {
  constructor(config) {
    this.config = config;
    this.element = null;
    this.targetElement = null;
    this.isVisible = false;
  }

  /**
   * Create highlighter element
   */
  createElement() {
    if (this.element) return;
    this.element = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: _utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.HIGHLIGHT,
      style: {
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: this.config.zIndex + 1,
        border: '2px solid #0066ff',
        borderRadius: '4px',
        opacity: '0',
        transition: `all ${this.config.animationDuration}ms ease-in-out`,
        boxShadow: '0 0 0 4px rgba(0, 102, 255, 0.2)'
      }
    });
    document.body.appendChild(this.element);
  }

  /**
   * Highlight an element
   * @param {Element} target - Target element
   */
  highlight(target) {
    if (!target) return;
    this.targetElement = target;

    // Create element if needed
    this.createElement();

    // Position highlighter
    this.position();

    // Show with animation
    if (this.config.animation) {
      requestAnimationFrame(() => {
        this.element.style.opacity = '1';
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addClass)(this.element, 'paw-highlight-active', true);
      });
    } else {
      this.element.style.opacity = '1';
      (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addClass)(this.element, 'paw-highlight-active');
    }

    // Set up resize observer
    this.setupResizeObserver();
    this.isVisible = true;
  }

  /**
   * Position highlighter around target
   */
  position() {
    if (!this.targetElement || !this.element) return;
    const pos = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getElementPosition)(this.targetElement);
    const padding = 4;
    this.element.style.top = `${pos.top - padding}px`;
    this.element.style.left = `${pos.left - padding}px`;
    this.element.style.width = `${pos.width + padding * 2}px`;
    this.element.style.height = `${pos.height + padding * 2}px`;
  }

  /**
   * Set up resize observer
   */
  setupResizeObserver() {
    if (!window.ResizeObserver || !this.targetElement) return;
    this.resizeObserver = new ResizeObserver(() => {
      if (this.isVisible) {
        this.position();
      }
    });
    this.resizeObserver.observe(this.targetElement);

    // Also listen to window resize
    this.handleResize = () => {
      if (this.isVisible) {
        this.position();
      }
    };
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleResize);
  }

  /**
   * Clean up resize observer
   */
  cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('scroll', this.handleResize);
      this.handleResize = null;
    }
  }

  /**
   * Hide highlighter
   */
  hide() {
    if (!this.element || !this.isVisible) return;

    // Hide with animation
    this.element.style.opacity = '0';
    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.removeClass)(this.element, 'paw-highlight-active');

    // Clean up observers
    this.cleanupResizeObserver();
    this.isVisible = false;
    this.targetElement = null;
  }

  /**
   * Update highlight style
   * @param {Object} styles - Style object
   */
  updateStyle(styles) {
    if (this.element) {
      Object.assign(this.element.style, styles);
    }
  }

  /**
   * Destroy highlighter
   */
  destroy() {
    this.hide();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

/***/ }),

/***/ "./src/components/Tooltip.js":
/*!***********************************!*\
  !*** ./src/components/Tooltip.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Tooltip)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/constants */ "./src/utils/constants.js");
/**
 * Tooltip component for displaying tour steps
 */



class Tooltip {
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
    this.element = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: `${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.TOOLTIP} ${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.TOOLTIP}-${this.config.theme}`,
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
        (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addClass)(this.element, 'paw-tooltip-active', true);
      });
    } else {
      this.element.style.opacity = '1';
      (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.addClass)(this.element, 'paw-tooltip-active');
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
    (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.removeClass)(this.element, 'paw-tooltip-active');
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
        <button class="paw-tooltip-close ${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.CLOSE_BUTTON}" data-action="close">
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
          <div class="${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.PROGRESS_BAR}">
            <div class="paw-progress-fill" style="width: ${stepData.progress}%"></div>
          </div>
        </div>
      ` : ''}
      
      <div class="paw-tooltip-footer">
        <div class="paw-tooltip-buttons">
          ${!stepData.isFirst ? `
            <button class="${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BUTTON} ${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BUTTON_SECONDARY}" data-action="prev">
              ${stepData.buttons.prev}
            </button>
          ` : ''}
          
          ${!stepData.isLast ? `
            <button class="${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BUTTON} ${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BUTTON_SECONDARY}" data-action="skip">
              ${stepData.buttons.skip}
            </button>
          ` : ''}
          
          <button class="${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BUTTON} ${_utils_constants__WEBPACK_IMPORTED_MODULE_1__.CSS_CLASSES.BUTTON_PRIMARY}" data-action="${stepData.isLast ? 'done' : 'next'}">
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
  position(target) {
    let placement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'bottom';
    const tooltipRect = this.element.getBoundingClientRect();
    const padding = 10;
    let top, left;
    if (!target) {
      // Center in viewport if no target
      top = (window.innerHeight - tooltipRect.height) / 2;
      left = (window.innerWidth - tooltipRect.width) / 2;
    } else {
      const targetPos = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.getElementPosition)(target);
      const placementConfig = _utils_constants__WEBPACK_IMPORTED_MODULE_1__.PLACEMENT_MAPPINGS[placement] || _utils_constants__WEBPACK_IMPORTED_MODULE_1__.PLACEMENT_MAPPINGS.bottom;

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
          default:
            // center
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
          default:
            // center
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
    this.handleClick = event => {
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

/***/ }),

/***/ "./src/core/TourEngine.js":
/*!********************************!*\
  !*** ./src/core/TourEngine.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TourEngine)
/* harmony export */ });
/* harmony import */ var _components_Tooltip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/Tooltip */ "./src/components/Tooltip.js");
/* harmony import */ var _components_Backdrop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Backdrop */ "./src/components/Backdrop.js");
/* harmony import */ var _components_Highlighter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Highlighter */ "./src/components/Highlighter.js");
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/constants */ "./src/utils/constants.js");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/validation */ "./src/utils/validation.js");
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");
/**
 * Tour execution engine
 */







class TourEngine {
  constructor(config, eventBus, storage) {
    this.config = config;
    this.eventBus = eventBus;
    this.storage = storage;
    this.tours = [];
    this.activeTour = null;
    this.currentStep = 0;
    this.tooltip = new _components_Tooltip__WEBPACK_IMPORTED_MODULE_0__["default"](config);
    this.backdrop = new _components_Backdrop__WEBPACK_IMPORTED_MODULE_1__["default"](config);
    this.highlighter = new _components_Highlighter__WEBPACK_IMPORTED_MODULE_2__["default"](config);
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
        ..._utils_constants__WEBPACK_IMPORTED_MODULE_3__.TOUR_STEP_DEFAULTS,
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
  startTour(tourId) {
    let startStep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
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
      this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_3__.WIDGET_EVENTS.TOUR_START, {
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
    const validation = (0,_utils_validation__WEBPACK_IMPORTED_MODULE_4__.validateTourStep)(step, stepIndex);
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
        targetElement = await (0,_utils_dom__WEBPACK_IMPORTED_MODULE_5__.waitForElement)(step.target, 5000);
        if (!targetElement) {
          console.warn(`[TourEngine] Target element not found: ${step.target}`);
          // Continue without target
        }
      }

      // Scroll to element if needed
      if (targetElement && step.scrollTo) {
        await (0,_utils_dom__WEBPACK_IMPORTED_MODULE_5__.scrollToElement)(targetElement, step.scrollOffset);
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
        progress: (stepIndex + 1) / this.activeTour.steps.length * 100
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
      this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_3__.WIDGET_EVENTS.STEP_CHANGE, {
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
    this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_3__.WIDGET_EVENTS.TOUR_SKIP, {
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
    this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_3__.WIDGET_EVENTS.TOUR_COMPLETE, {
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
      progress: (this.currentStep + 1) / this.activeTour.steps.length * 100
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

/***/ }),

/***/ "./src/core/WidgetCore.js":
/*!********************************!*\
  !*** ./src/core/WidgetCore.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WidgetCore)
/* harmony export */ });
/* harmony import */ var _TourEngine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TourEngine */ "./src/core/TourEngine.js");
/* harmony import */ var _utils_EventBus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/EventBus */ "./src/utils/EventBus.js");
/* harmony import */ var _utils_StorageManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/StorageManager */ "./src/utils/StorageManager.js");
/* harmony import */ var _analytics_Analytics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../analytics/Analytics */ "./src/analytics/Analytics.js");
/* harmony import */ var _styles_StyleManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../styles/StyleManager */ "./src/styles/StyleManager.js");
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/constants */ "./src/utils/constants.js");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Core widget implementation
 */







class WidgetCore {
  constructor(config) {
    /**
     * Handle keyboard events
     */
    _defineProperty(this, "handleKeyDown", event => {
      if (event.key === 'Escape' && this.tourEngine.isActive()) {
        this.tourEngine.endTour();
      }
    });
    this.config = config;
    this.instanceId = config.instanceId;
    this.container = null;
    this.tourEngine = null;
    this.eventBus = new _utils_EventBus__WEBPACK_IMPORTED_MODULE_1__["default"]();
    this.storage = new _utils_StorageManager__WEBPACK_IMPORTED_MODULE_2__["default"](config.storage);
    this.analytics = new _analytics_Analytics__WEBPACK_IMPORTED_MODULE_3__["default"](config.analytics, this.eventBus);
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
      (0,_styles_StyleManager__WEBPACK_IMPORTED_MODULE_4__.injectStyles)(this.config);

      // Create container
      this.container = (0,_styles_StyleManager__WEBPACK_IMPORTED_MODULE_4__.createWidgetContainer)(this.instanceId, this.config);

      // Initialize tour engine
      this.tourEngine = new _TourEngine__WEBPACK_IMPORTED_MODULE_0__["default"](this.config, this.eventBus, this.storage);

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
      this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.INIT, {
        instanceId: this.instanceId
      });
      this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.READY, {
        instanceId: this.instanceId
      });

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
      this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.ERROR, {
        error,
        instanceId: this.instanceId
      });
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
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.TOUR_COMPLETE, data => {
      if (this.config.callbacks.onComplete) {
        this.config.callbacks.onComplete(data);
      }
    });
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.TOUR_SKIP, data => {
      if (this.config.callbacks.onSkip) {
        this.config.callbacks.onSkip(data);
      }
    });
    this.eventBus.on(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.STEP_CHANGE, data => {
      if (this.config.callbacks.onStep) {
        this.config.callbacks.onStep(data);
      }
    });
  }
  /**
   * Start a tour
   * @param {string} tourId - Tour ID
   * @param {number} startStep - Starting step index
   */
  startTour(tourId) {
    let startStep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    if (!this.initialized || this.destroyed) {
      console.warn('[ProductAdoptionWidget] Widget not initialized');
      return false;
    }
    try {
      const started = this.tourEngine.startTour(tourId, startStep);
      if (started && this.config.callbacks.onStart) {
        this.config.callbacks.onStart({
          tourId,
          startStep
        });
      }
      return started;
    } catch (error) {
      console.error('[ProductAdoptionWidget] Error starting tour:', error);
      this.eventBus.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__.WIDGET_EVENTS.ERROR, {
        error,
        tourId
      });
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

/***/ }),

/***/ "./src/styles/StyleManager.js":
/*!************************************!*\
  !*** ./src/styles/StyleManager.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createWidgetContainer: () => (/* binding */ createWidgetContainer),
/* harmony export */   injectStyles: () => (/* binding */ injectStyles),
/* harmony export */   removeWidgetContainer: () => (/* binding */ removeWidgetContainer),
/* harmony export */   updateTheme: () => (/* binding */ updateTheme)
/* harmony export */ });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");
/* harmony import */ var _defaultStyles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./defaultStyles */ "./src/styles/defaultStyles.js");
/**
 * Style manager for injecting widget styles
 */



let stylesInjected = false;

/**
 * Inject widget styles into the page
 * @param {Object} config - Widget configuration
 */
function injectStyles(config) {
  if (stylesInjected) return;
  const styleId = 'product-adoption-widget-styles';

  // Check if styles already exist
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }

  // Get default styles
  let styles = (0,_defaultStyles__WEBPACK_IMPORTED_MODULE_1__.getDefaultStyles)(config);

  // Add custom styles if provided
  if (config.customStyles) {
    styles += '\n' + config.customStyles;
  }

  // Create style element
  const styleElement = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.createElement)('style', {
    id: styleId,
    type: 'text/css'
  }, styles);

  // Inject into head
  document.head.appendChild(styleElement);
  stylesInjected = true;
}

/**
 * Create widget container
 * @param {string} instanceId - Instance ID
 * @param {Object} config - Widget configuration
 * @returns {Element} Container element
 */
function createWidgetContainer(instanceId, config) {
  const containerId = `paw-container-${instanceId}`;

  // Check if container already exists
  let container = document.getElementById(containerId);
  if (container) {
    return container;
  }

  // Create container
  container = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    id: containerId,
    className: 'paw-widget-container',
    style: {
      position: 'fixed',
      zIndex: config.zIndex,
      pointerEvents: 'none'
    }
  });

  // Add to specified container or body
  const parentSelector = config.containerSelector || 'body';
  const parent = document.querySelector(parentSelector) || document.body;
  parent.appendChild(container);
  return container;
}

/**
 * Remove widget container
 * @param {string} instanceId - Instance ID
 */
function removeWidgetContainer(instanceId) {
  const containerId = `paw-container-${instanceId}`;
  const container = document.getElementById(containerId);
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Update theme dynamically
 * @param {string} theme - Theme name
 */
function updateTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-paw-theme', theme);
}

/***/ }),

/***/ "./src/styles/defaultStyles.js":
/*!*************************************!*\
  !*** ./src/styles/defaultStyles.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDefaultStyles: () => (/* binding */ getDefaultStyles)
/* harmony export */ });
/**
 * Default widget styles
 */

function getDefaultStyles(config) {
  const theme = config.theme || 'light';
  const primaryColor = '#0066ff';
  const animationDuration = config.animationDuration || 300;
  return `
    /* Widget Container */
    .paw-widget-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Tooltip Styles */
    .paw-tooltip {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      max-width: 400px;
      min-width: 300px;
      pointer-events: auto;
    }

    .paw-tooltip-dark {
      background: #1a1a1a;
      color: #ffffff;
    }

    .paw-tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 0;
    }

    .paw-tooltip-step-number {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .paw-tooltip-dark .paw-tooltip-step-number {
      color: #999;
    }

    .paw-tooltip-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #666;
      transition: color ${animationDuration}ms ease;
    }

    .paw-tooltip-close:hover {
      color: #333;
    }

    .paw-tooltip-dark .paw-tooltip-close {
      color: #999;
    }

    .paw-tooltip-dark .paw-tooltip-close:hover {
      color: #fff;
    }

    .paw-tooltip-title {
      font-size: 18px;
      font-weight: 600;
      padding: 12px 20px 8px;
      color: #111;
    }

    .paw-tooltip-dark .paw-tooltip-title {
      color: #fff;
    }

    .paw-tooltip-content {
      padding: 0 20px 16px;
      color: #555;
    }

    .paw-tooltip-dark .paw-tooltip-content {
      color: #ccc;
    }

    .paw-tooltip-progress {
      padding: 0 20px 16px;
    }

    .paw-progress-bar {
      height: 4px;
      background: #e5e5e5;
      border-radius: 2px;
      overflow: hidden;
    }

    .paw-tooltip-dark .paw-progress-bar {
      background: #333;
    }

    .paw-progress-fill {
      height: 100%;
      background: ${primaryColor};
      transition: width ${animationDuration}ms ease;
    }

    .paw-tooltip-footer {
      padding: 16px 20px;
      border-top: 1px solid #e5e5e5;
    }

    .paw-tooltip-dark .paw-tooltip-footer {
      border-top-color: #333;
    }

    .paw-tooltip-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    /* Button Styles */
    .paw-button {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all ${animationDuration}ms ease;
      outline: none;
    }

    .paw-button:focus-visible {
      box-shadow: 0 0 0 2px ${primaryColor}40;
    }

    .paw-button-primary {
      background: ${primaryColor};
      color: white;
    }

    .paw-button-primary:hover {
      background: #0052cc;
    }

    .paw-button-secondary {
      background: transparent;
      color: #666;
      border: 1px solid #e5e5e5;
    }

    .paw-button-secondary:hover {
      background: #f5f5f5;
      border-color: #d5d5d5;
    }

    .paw-tooltip-dark .paw-button-secondary {
      color: #ccc;
      border-color: #444;
    }

    .paw-tooltip-dark .paw-button-secondary:hover {
      background: #2a2a2a;
      border-color: #555;
    }

    /* Backdrop Styles */
    .paw-backdrop {
      backdrop-filter: blur(2px);
    }

    /* Highlight Styles */
    .paw-highlight {
      pointer-events: none;
    }

    .paw-highlight-active {
      animation: paw-pulse 2s infinite;
    }

    @keyframes paw-pulse {
      0% {
        box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.2);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(0, 102, 255, 0.1);
      }
      100% {
        box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.2);
      }
    }

    /* Animations */
    .paw-tooltip-active {
      animation: paw-fadein ${animationDuration}ms ease;
    }

    @keyframes paw-fadein {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .paw-tooltip {
        max-width: calc(100vw - 32px);
        min-width: calc(100vw - 32px);
      }
    }

    /* Accessibility */
    .paw-button:focus-visible,
    .paw-tooltip-close:focus-visible {
      outline: 2px solid ${primaryColor};
      outline-offset: 2px;
    }

    /* Print styles */
    @media print {
      .paw-widget-container,
      .paw-backdrop,
      .paw-highlight,
      .paw-tooltip {
        display: none !important;
      }
    }
  `;
}

/***/ }),

/***/ "./src/utils/EventBus.js":
/*!*******************************!*\
  !*** ./src/utils/EventBus.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EventBus)
/* harmony export */ });
/**
 * Simple event bus for internal communication
 */

class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    if (!this.events.has(event)) return;
    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.events.has(event)) return;
    const handlers = this.events.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

/***/ }),

/***/ "./src/utils/StorageManager.js":
/*!*************************************!*\
  !*** ./src/utils/StorageManager.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StorageManager)
/* harmony export */ });
/**
 * Storage manager for persisting widget state
 */

class StorageManager {
  constructor(config) {
    this.config = config;
    this.storageKey = config.key || 'product-adoption-widget';
    this.storageType = config.type || 'localStorage';
    this.enabled = config.enabled !== false;
  }

  /**
   * Get storage instance
   */
  getStorage() {
    if (!this.enabled) return null;
    switch (this.storageType) {
      case 'localStorage':
        return typeof localStorage !== 'undefined' ? localStorage : null;
      case 'sessionStorage':
        return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
      case 'cookie':
        return null;
      // Cookie storage handled separately
      default:
        return null;
    }
  }

  /**
   * Get value from storage
   * @param {string} key - Storage key
   * @returns {*} Stored value
   */
  get(key) {
    if (!this.enabled) return null;
    try {
      if (this.storageType === 'cookie') {
        return this.getCookie(`${this.storageKey}_${key}`);
      }
      const storage = this.getStorage();
      if (!storage) return null;
      const data = storage.getItem(this.storageKey);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed[key] || null;
    } catch (error) {
      console.error('[StorageManager] Error reading from storage:', error);
      return null;
    }
  }

  /**
   * Set value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  set(key, value) {
    if (!this.enabled) return;
    try {
      if (this.storageType === 'cookie') {
        this.setCookie(`${this.storageKey}_${key}`, value);
        return;
      }
      const storage = this.getStorage();
      if (!storage) return;
      const data = storage.getItem(this.storageKey);
      const parsed = data ? JSON.parse(data) : {};
      parsed[key] = value;
      storage.setItem(this.storageKey, JSON.stringify(parsed));
    } catch (error) {
      console.error('[StorageManager] Error writing to storage:', error);
    }
  }

  /**
   * Remove value from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    if (!this.enabled) return;
    try {
      if (this.storageType === 'cookie') {
        this.deleteCookie(`${this.storageKey}_${key}`);
        return;
      }
      const storage = this.getStorage();
      if (!storage) return;
      const data = storage.getItem(this.storageKey);
      if (!data) return;
      const parsed = JSON.parse(data);
      delete parsed[key];
      if (Object.keys(parsed).length === 0) {
        storage.removeItem(this.storageKey);
      } else {
        storage.setItem(this.storageKey, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('[StorageManager] Error removing from storage:', error);
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    if (!this.enabled) return;
    try {
      if (this.storageType === 'cookie') {
        // Clear all widget cookies
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.startsWith(this.storageKey)) {
            this.deleteCookie(name);
          }
        });
        return;
      }
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('[StorageManager] Error clearing storage:', error);
    }
  }

  /**
   * Get cookie value
   * @param {string} name - Cookie name
   * @returns {*} Cookie value
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      try {
        return JSON.parse(decodeURIComponent(cookieValue));
      } catch {
        return cookieValue;
      }
    }
    return null;
  }

  /**
   * Set cookie value
   * @param {string} name - Cookie name
   * @param {*} value - Cookie value
   * @param {number} days - Days until expiration
   */
  setCookie(name, value) {
    let days = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const cookieValue = typeof value === 'object' ? JSON.stringify(value) : value;
    document.cookie = `${name}=${encodeURIComponent(cookieValue)};${expires};path=/;SameSite=Lax`;
  }

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

/***/ }),

/***/ "./src/utils/constants.js":
/*!********************************!*\
  !*** ./src/utils/constants.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSS_CLASSES: () => (/* binding */ CSS_CLASSES),
/* harmony export */   PLACEMENT_MAPPINGS: () => (/* binding */ PLACEMENT_MAPPINGS),
/* harmony export */   STORAGE_KEYS: () => (/* binding */ STORAGE_KEYS),
/* harmony export */   TOUR_STEP_DEFAULTS: () => (/* binding */ TOUR_STEP_DEFAULTS),
/* harmony export */   WIDGET_DEFAULTS: () => (/* binding */ WIDGET_DEFAULTS),
/* harmony export */   WIDGET_EVENTS: () => (/* binding */ WIDGET_EVENTS)
/* harmony export */ });
/**
 * Widget constants and default configurations
 */

const WIDGET_DEFAULTS = {
  // API Configuration
  apiEndpoint: null,
  apiKey: null,
  // Tour Configuration
  tours: [],
  autoStart: false,
  startDelay: 0,
  // UI Configuration
  theme: 'light',
  position: 'bottom-right',
  zIndex: 999999,
  // Behavior Configuration
  backdrop: true,
  backdropColor: 'rgba(0, 0, 0, 0.7)',
  animation: true,
  animationDuration: 300,
  closeOnBackdropClick: true,
  closeOnEscape: true,
  showStepNumbers: true,
  showProgressBar: true,
  // Analytics Configuration
  analytics: {
    enabled: true,
    trackEvents: true,
    trackProgress: true,
    customTracker: null
  },
  // Storage Configuration
  storage: {
    enabled: true,
    key: 'product-adoption-widget',
    type: 'localStorage' // 'localStorage' | 'sessionStorage' | 'cookie'
  },
  // Advanced Configuration
  debug: false,
  containerSelector: 'body',
  customStyles: null,
  callbacks: {
    onInit: null,
    onStart: null,
    onStep: null,
    onComplete: null,
    onSkip: null,
    onError: null
  }
};
const TOUR_STEP_DEFAULTS = {
  title: '',
  content: '',
  target: null,
  placement: 'bottom',
  backdrop: true,
  buttons: {
    next: 'Next',
    prev: 'Previous',
    skip: 'Skip',
    done: 'Done'
  },
  allowInteraction: false,
  scrollTo: true,
  scrollOffset: 100
};
const WIDGET_EVENTS = {
  INIT: 'widget:init',
  READY: 'widget:ready',
  TOUR_START: 'tour:start',
  TOUR_COMPLETE: 'tour:complete',
  TOUR_SKIP: 'tour:skip',
  STEP_CHANGE: 'step:change',
  STEP_COMPLETE: 'step:complete',
  ERROR: 'widget:error'
};
const STORAGE_KEYS = {
  COMPLETED_TOURS: 'completedTours',
  CURRENT_PROGRESS: 'currentProgress',
  USER_PREFERENCES: 'userPreferences'
};
const CSS_CLASSES = {
  WIDGET_CONTAINER: 'paw-container',
  WIDGET_ACTIVE: 'paw-active',
  TOOLTIP: 'paw-tooltip',
  BACKDROP: 'paw-backdrop',
  HIGHLIGHT: 'paw-highlight',
  BUTTON: 'paw-button',
  BUTTON_PRIMARY: 'paw-button-primary',
  BUTTON_SECONDARY: 'paw-button-secondary',
  PROGRESS_BAR: 'paw-progress-bar',
  CLOSE_BUTTON: 'paw-close'
};
const PLACEMENT_MAPPINGS = {
  'top': {
    main: 'top',
    cross: 'center'
  },
  'top-start': {
    main: 'top',
    cross: 'start'
  },
  'top-end': {
    main: 'top',
    cross: 'end'
  },
  'bottom': {
    main: 'bottom',
    cross: 'center'
  },
  'bottom-start': {
    main: 'bottom',
    cross: 'start'
  },
  'bottom-end': {
    main: 'bottom',
    cross: 'end'
  },
  'left': {
    main: 'left',
    cross: 'center'
  },
  'left-start': {
    main: 'left',
    cross: 'start'
  },
  'left-end': {
    main: 'left',
    cross: 'end'
  },
  'right': {
    main: 'right',
    cross: 'center'
  },
  'right-start': {
    main: 'right',
    cross: 'start'
  },
  'right-end': {
    main: 'right',
    cross: 'end'
  }
};

/***/ }),

/***/ "./src/utils/dom.js":
/*!**************************!*\
  !*** ./src/utils/dom.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addClass: () => (/* binding */ addClass),
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   getComputedStyles: () => (/* binding */ getComputedStyles),
/* harmony export */   getEffectiveZIndex: () => (/* binding */ getEffectiveZIndex),
/* harmony export */   getElementPosition: () => (/* binding */ getElementPosition),
/* harmony export */   isElementInViewport: () => (/* binding */ isElementInViewport),
/* harmony export */   removeClass: () => (/* binding */ removeClass),
/* harmony export */   scrollToElement: () => (/* binding */ scrollToElement),
/* harmony export */   waitForElement: () => (/* binding */ waitForElement)
/* harmony export */ });
/**
 * DOM utility functions
 */

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Element|null>} Element or null
 */
function waitForElement(selector) {
  let timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
  return new Promise(resolve => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Scroll element into view
 * @param {Element} element - Target element
 * @param {number} offset - Scroll offset
 * @returns {Promise} Scroll complete
 */
function scrollToElement(element) {
  let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return new Promise(resolve => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - offset;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });

    // Wait for scroll to complete
    setTimeout(resolve, 500);
  });
}

/**
 * Get element position relative to viewport
 * @param {Element} element - Target element
 * @returns {Object} Position object
 */
function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    bottom: rect.bottom + scrollTop,
    right: rect.right + scrollLeft,
    width: rect.width,
    height: rect.height,
    viewportTop: rect.top,
    viewportLeft: rect.left
  };
}

/**
 * Check if element is visible in viewport
 * @param {Element} element - Target element
 * @returns {boolean} Is visible
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

/**
 * Create DOM element with attributes
 * @param {string} tag - HTML tag
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} children - Child elements or text
 * @returns {Element} Created element
 */
function createElement(tag) {
  let attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(_ref => {
    let [key, value] = _ref;
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  if (children) {
    if (typeof children === 'string') {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Element) {
          element.appendChild(child);
        } else if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        }
      });
    } else if (children instanceof Element) {
      element.appendChild(children);
    }
  }
  return element;
}

/**
 * Add CSS class with optional animation
 * @param {Element} element - Target element
 * @param {string} className - CSS class name
 * @param {boolean} animate - Use animation
 */
function addClass(element, className) {
  let animate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (animate) {
    requestAnimationFrame(() => {
      element.classList.add(className);
    });
  } else {
    element.classList.add(className);
  }
}

/**
 * Remove CSS class
 * @param {Element} element - Target element
 * @param {string} className - CSS class name
 */
function removeClass(element, className) {
  element.classList.remove(className);
}

/**
 * Get computed styles for element
 * @param {Element} element - Target element
 * @returns {CSSStyleDeclaration} Computed styles
 */
function getComputedStyles(element) {
  return window.getComputedStyle(element);
}

/**
 * Get element z-index including parents
 * @param {Element} element - Target element
 * @returns {number} Effective z-index
 */
function getEffectiveZIndex(element) {
  let zIndex = 0;
  let el = element;
  while (el && el !== document.body) {
    const styles = getComputedStyles(el);
    const z = parseInt(styles.zIndex, 10);
    if (!isNaN(z) && z > zIndex) {
      zIndex = z;
    }
    el = el.parentElement;
  }
  return zIndex;
}

/***/ }),

/***/ "./src/utils/validation.js":
/*!*********************************!*\
  !*** ./src/utils/validation.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   validateConfig: () => (/* binding */ validateConfig),
/* harmony export */   validateTourStep: () => (/* binding */ validateTourStep)
/* harmony export */ });
/**
 * Configuration validation utilities
 */

function validateConfig(config) {
  var _config$storage;
  const errors = [];

  // Validate required fields
  if (config.tours && !Array.isArray(config.tours)) {
    errors.push('tours must be an array');
  }
  if (config.apiKey !== undefined && typeof config.apiKey !== 'string') {
    errors.push('apiKey must be a string');
  }
  if (config.apiEndpoint !== undefined && config.apiEndpoint !== null && typeof config.apiEndpoint !== 'string') {
    errors.push('apiEndpoint must be a string or null');
  }

  // Validate tour structure
  if (config.tours && Array.isArray(config.tours)) {
    config.tours.forEach((tour, index) => {
      if (!tour.id) {
        errors.push(`Tour at index ${index} must have an id`);
      }
      if (!tour.steps || !Array.isArray(tour.steps)) {
        errors.push(`Tour ${tour.id || index} must have a steps array`);
      }
      if (tour.steps && tour.steps.length === 0) {
        errors.push(`Tour ${tour.id || index} must have at least one step`);
      }
    });
  }

  // Validate theme
  if (config.theme && !['light', 'dark', 'auto'].includes(config.theme)) {
    errors.push('theme must be one of: light, dark, auto');
  }

  // Validate position
  const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  if (config.position && !validPositions.includes(config.position)) {
    errors.push(`position must be one of: ${validPositions.join(', ')}`);
  }

  // Validate storage type
  if ((_config$storage = config.storage) !== null && _config$storage !== void 0 && _config$storage.type && !['localStorage', 'sessionStorage', 'cookie'].includes(config.storage.type)) {
    errors.push('storage.type must be one of: localStorage, sessionStorage, cookie');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function validateTourStep(step, index) {
  const errors = [];
  if (!step.content && !step.title) {
    errors.push(`Step ${index} must have either content or title`);
  }
  if (step.target && typeof step.target !== 'string') {
    errors.push(`Step ${index} target must be a CSS selector string`);
  }
  const validPlacements = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'];
  if (step.placement && !validPlacements.includes(step.placement)) {
    errors.push(`Step ${index} placement must be one of: ${validPlacements.join(', ')}`);
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _core_WidgetCore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/WidgetCore */ "./src/core/WidgetCore.js");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/validation */ "./src/utils/validation.js");
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/constants */ "./src/utils/constants.js");
/**
 * Product Adoption Widget
 * Main entry point for the embeddable product tour widget
 */




class ProductAdoptionWidget {
  constructor() {
    this.instances = new Map();
    this.globalId = 0;

    // Make widget globally available
    if (typeof window !== 'undefined') {
      window.ProductAdoptionWidget = this;
    }
  }

  /**
   * Initialize a new widget instance
   * @param {Object} config - Widget configuration
   * @returns {Object} Widget instance
   */
  init() {
    let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    try {
      // Validate configuration
      const validationResult = (0,_utils_validation__WEBPACK_IMPORTED_MODULE_1__.validateConfig)(config);
      if (!validationResult.valid) {
        throw new Error(`Invalid configuration: ${validationResult.errors.join(', ')}`);
      }

      // Merge with defaults
      const finalConfig = {
        ..._utils_constants__WEBPACK_IMPORTED_MODULE_2__.WIDGET_DEFAULTS,
        ...config,
        instanceId: `paw-${++this.globalId}`
      };

      // Create widget instance
      const widget = new _core_WidgetCore__WEBPACK_IMPORTED_MODULE_0__["default"](finalConfig);
      this.instances.set(finalConfig.instanceId, widget);

      // Auto-initialize if DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => widget.initialize());
      } else {
        widget.initialize();
      }
      return widget;
    } catch (error) {
      console.error('[ProductAdoptionWidget] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Get a widget instance by ID
   * @param {string} instanceId - Instance ID
   * @returns {Object|null} Widget instance or null
   */
  getInstance(instanceId) {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Destroy a widget instance
   * @param {string} instanceId - Instance ID
   */
  destroy(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.destroy();
      this.instances.delete(instanceId);
    }
  }

  /**
   * Destroy all widget instances
   */
  destroyAll() {
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
  }

  /**
   * Get version information
   * @returns {string} Widget version
   */
  getVersion() {
    return '1.0.0';
  }
}

// Create and export singleton instance
const widgetInstance = new ProductAdoptionWidget();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (widgetInstance);
})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=product-adoption-widget.js.map