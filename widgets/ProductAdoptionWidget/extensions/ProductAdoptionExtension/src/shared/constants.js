// Shared constants for ProductAdoption Extension

export const API_ENDPOINTS = {
  BASE_URL: 'https://api.productadoption.com/v1',
  AUTH: '/auth',
  TOURS: '/tours',
  ANALYTICS: '/analytics',
  USERS: '/users'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  CURRENT_USER: 'currentUser',
  SETTINGS: 'settings',
  TOURS: 'tours',
  RECENT_TOURS: 'recentTours',
  ACTIVE_TOUR: 'activeTour',
  DRAFT_TOUR: 'draftTour'
};

export const MESSAGE_TYPES = {
  // Authentication
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_STATUS_CHANGED: 'AUTH_STATUS_CHANGED',
  
  // Tour Creation
  START_TOUR_CREATION: 'START_TOUR_CREATION',
  STOP_TOUR_CREATION: 'STOP_TOUR_CREATION',
  TOGGLE_TOUR_CREATOR: 'TOGGLE_TOUR_CREATOR',
  
  // Tour Management
  SAVE_TOUR: 'SAVE_TOUR',
  SAVE_TOUR_API: 'SAVE_TOUR_API',
  DELETE_TOUR: 'DELETE_TOUR',
  LOAD_TOUR: 'LOAD_TOUR',
  GET_TOURS: 'GET_TOURS',
  PREVIEW_TOUR: 'PREVIEW_TOUR',
  CANCEL_TOUR: 'CANCEL_TOUR',
  
  // Element Selection
  GET_SELECTED_ELEMENT: 'GET_SELECTED_ELEMENT',
  ADD_ELEMENT_TO_TOUR: 'ADD_ELEMENT_TO_TOUR',
  
  // Settings
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  
  // Active Tour
  PREVIEW_ACTIVE_TOUR: 'PREVIEW_ACTIVE_TOUR',
  SAVE_ACTIVE_TOUR: 'SAVE_ACTIVE_TOUR',
  CANCEL_ACTIVE_TOUR: 'CANCEL_ACTIVE_TOUR'
};

export const TOUR_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export const DEFAULT_SETTINGS = {
  apiUrl: API_ENDPOINTS.BASE_URL,
  autoSave: true,
  theme: THEMES.LIGHT,
  shortcuts: {
    toggleCreator: 'Ctrl+Shift+T',
    saveStep: 'Ctrl+S',
    preview: 'Ctrl+P'
  },
  tourDefaults: {
    position: TOUR_POSITIONS.BOTTOM,
    backdrop: true,
    animation: true,
    closeOnClickOutside: false
  }
};

export const Z_INDEXES = {
  OVERLAY: 999998,
  HIGHLIGHT: 999999,
  TOOLBAR: 1000000,
  TOOLTIP: 1000001,
  NOTIFICATION: 1000002
};