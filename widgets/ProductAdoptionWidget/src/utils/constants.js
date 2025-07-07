/**
 * Widget constants and default configurations
 */

export const WIDGET_DEFAULTS = {
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

export const TOUR_STEP_DEFAULTS = {
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

export const WIDGET_EVENTS = {
  INIT: 'widget:init',
  READY: 'widget:ready',
  TOUR_START: 'tour:start',
  TOUR_COMPLETE: 'tour:complete',
  TOUR_SKIP: 'tour:skip',
  STEP_CHANGE: 'step:change',
  STEP_COMPLETE: 'step:complete',
  ERROR: 'widget:error'
};

export const STORAGE_KEYS = {
  COMPLETED_TOURS: 'completedTours',
  CURRENT_PROGRESS: 'currentProgress',
  USER_PREFERENCES: 'userPreferences'
};

export const CSS_CLASSES = {
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

export const PLACEMENT_MAPPINGS = {
  'top': { main: 'top', cross: 'center' },
  'top-start': { main: 'top', cross: 'start' },
  'top-end': { main: 'top', cross: 'end' },
  'bottom': { main: 'bottom', cross: 'center' },
  'bottom-start': { main: 'bottom', cross: 'start' },
  'bottom-end': { main: 'bottom', cross: 'end' },
  'left': { main: 'left', cross: 'center' },
  'left-start': { main: 'left', cross: 'start' },
  'left-end': { main: 'left', cross: 'end' },
  'right': { main: 'right', cross: 'center' },
  'right-start': { main: 'right', cross: 'start' },
  'right-end': { main: 'right', cross: 'end' }
};