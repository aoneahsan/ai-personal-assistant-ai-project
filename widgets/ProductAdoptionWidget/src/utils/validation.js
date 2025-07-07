/**
 * Configuration validation utilities
 */

export function validateConfig(config) {
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
  if (config.storage?.type && !['localStorage', 'sessionStorage', 'cookie'].includes(config.storage.type)) {
    errors.push('storage.type must be one of: localStorage, sessionStorage, cookie');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateTourStep(step, index) {
  const errors = [];
  
  if (!step.content && !step.title) {
    errors.push(`Step ${index} must have either content or title`);
  }
  
  if (step.target && typeof step.target !== 'string') {
    errors.push(`Step ${index} target must be a CSS selector string`);
  }
  
  const validPlacements = [
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end'
  ];
  
  if (step.placement && !validPlacements.includes(step.placement)) {
    errors.push(`Step ${index} placement must be one of: ${validPlacements.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}