import { Tour, TourStep, WidgetConfig, ValidationResult, ValidationError } from '../types';

export const validateTour = (tour: Partial<Tour>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!tour.name || tour.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Tour name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Validate steps
  if (!tour.steps || tour.steps.length === 0) {
    errors.push({
      field: 'steps',
      message: 'At least one step is required',
      code: 'REQUIRED_FIELD',
    });
  } else {
    tour.steps.forEach((step, index) => {
      const stepErrors = validateTourStep(step, index);
      errors.push(...stepErrors);
    });
  }

  // Validate trigger
  if (!tour.trigger || !tour.trigger.type) {
    errors.push({
      field: 'trigger.type',
      message: 'Trigger type is required',
      code: 'REQUIRED_FIELD',
    });
  }

  // Validate targeting
  if (!tour.targeting) {
    errors.push({
      field: 'targeting',
      message: 'Targeting configuration is required',
      code: 'REQUIRED_FIELD',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTourStep = (
  step: TourStep,
  index: number
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const fieldPrefix = `steps[${index}]`;

  if (!step.title || step.title.trim() === '') {
    errors.push({
      field: `${fieldPrefix}.title`,
      message: `Step ${index + 1} title is required`,
      code: 'REQUIRED_FIELD',
    });
  }

  if (!step.content || step.content.trim() === '') {
    errors.push({
      field: `${fieldPrefix}.content`,
      message: `Step ${index + 1} content is required`,
      code: 'REQUIRED_FIELD',
    });
  }

  // Validate target selector if provided
  if (step.target && !isValidSelector(step.target)) {
    errors.push({
      field: `${fieldPrefix}.target`,
      message: `Step ${index + 1} has an invalid CSS selector`,
      code: 'INVALID_FORMAT',
    });
  }

  // Validate placement
  const validPlacements = ['top', 'bottom', 'left', 'right', 'center'];
  if (!validPlacements.includes(step.placement)) {
    errors.push({
      field: `${fieldPrefix}.placement`,
      message: `Step ${index + 1} has an invalid placement value`,
      code: 'INVALID_VALUE',
    });
  }

  return errors;
};

export const validateWidget = (widget: Partial<WidgetConfig>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!widget.type) {
    errors.push({
      field: 'type',
      message: 'Widget type is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!widget.content || !widget.content.message) {
    errors.push({
      field: 'content.message',
      message: 'Widget message is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!widget.position) {
    errors.push({
      field: 'position',
      message: 'Widget position is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!widget.trigger || !widget.trigger.type) {
    errors.push({
      field: 'trigger.type',
      message: 'Widget trigger type is required',
      code: 'REQUIRED_FIELD',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isValidSelector = (selector: string): boolean => {
  try {
    // Try to use the selector - if it throws, it's invalid
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDateRange = (
  start?: Date,
  end?: Date
): { isValid: boolean; message?: string } => {
  if (!start || !end) {
    return { isValid: true };
  }

  if (start > end) {
    return {
      isValid: false,
      message: 'Start date must be before end date',
    };
  }

  return { isValid: true };
};