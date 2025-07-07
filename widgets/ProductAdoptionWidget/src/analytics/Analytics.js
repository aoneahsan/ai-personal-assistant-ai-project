/**
 * Analytics module for tracking widget events
 */

import { WIDGET_EVENTS } from '../utils/constants';

export default class Analytics {
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
    this.eventBus.on(WIDGET_EVENTS.TOUR_START, (data) => {
      this.track('tour_started', {
        tourId: data.tourId,
        totalSteps: data.totalSteps
      });
    });

    this.eventBus.on(WIDGET_EVENTS.TOUR_COMPLETE, (data) => {
      this.track('tour_completed', {
        tourId: data.tourId,
        totalSteps: data.totalSteps,
        duration: Date.now() - data.startedAt
      });
    });

    this.eventBus.on(WIDGET_EVENTS.TOUR_SKIP, (data) => {
      this.track('tour_skipped', {
        tourId: data.tourId,
        skippedAt: data.skippedAt,
        totalSteps: data.totalSteps
      });
    });

    // Track step events
    if (this.config.trackProgress) {
      this.eventBus.on(WIDGET_EVENTS.STEP_CHANGE, (data) => {
        this.track('step_viewed', {
          tourId: data.tourId,
          stepIndex: data.stepIndex,
          stepTitle: data.step.title
        });
      });

      this.eventBus.on(WIDGET_EVENTS.STEP_COMPLETE, (data) => {
        this.track('step_completed', {
          tourId: data.tourId,
          stepIndex: data.stepIndex
        });
      });
    }

    // Track errors
    this.eventBus.on(WIDGET_EVENTS.ERROR, (data) => {
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
  track(eventName, eventData = {}) {
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