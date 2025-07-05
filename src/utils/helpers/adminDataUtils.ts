import { FilterMatchMode } from 'primereact/api';

// Generic filter type for admin tables
export interface AdminTableFilters {
  global: { value: string; matchMode: FilterMatchMode };
  [key: string]: {
    value: string | number | boolean | null;
    matchMode: FilterMatchMode;
  };
}

// Create default filters for admin tables
export const createDefaultFilters = (
  additionalFields: string[] = []
): AdminTableFilters => {
  const baseFilters: AdminTableFilters = {
    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
  };

  additionalFields.forEach((field) => {
    baseFilters[field] = { value: null, matchMode: FilterMatchMode.EQUALS };
  });

  return baseFilters;
};

// Format date for display in admin tables
export const formatAdminDate = (date: Date | string | undefined): string => {
  if (!date) return 'Never';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format time ago for display
export const formatTimeAgo = (date: Date | string | undefined): string => {
  if (!date) return 'Never';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;

  return `${Math.floor(diffDays / 365)}y ago`;
};

// Common admin table configurations
export const adminTableDefaults = {
  paginator: true,
  rows: 10,
  rowsPerPageOptions: [5, 10, 25, 50],
  sortMode: 'multiple' as const,
  removableSort: true,
  showGridlines: true,
  stripedRows: true,
  responsiveLayout: 'scroll' as const,
};

// Common admin dialog configurations
export const adminDialogDefaults = {
  modal: true,
  draggable: false,
  resizable: false,
  breakpoints: { '960px': '75vw', '640px': '90vw' },
  style: { width: '50vw' },
};

// Admin action button styles
export const adminButtonStyles = {
  edit: 'p-button-rounded p-button-text p-button-success',
  delete: 'p-button-rounded p-button-text p-button-danger',
  view: 'p-button-rounded p-button-text p-button-info',
  ban: 'p-button-rounded p-button-text p-button-warning',
  activate: 'p-button-rounded p-button-text p-button-success',
  deactivate: 'p-button-rounded p-button-text p-button-secondary',
};

// Generate common admin filters
export const generateAdminFilters = (
  searchValue: string,
  filters: AdminTableFilters
) => {
  const newFilters = { ...filters };
  newFilters.global.value = searchValue;
  return newFilters;
};

// Common admin search header configuration
export const getAdminSearchHeaderConfig = (
  title: string,
  searchValue: string,
  placeholder: string = 'Search...'
) => ({
  title,
  searchValue,
  placeholder,
  wrapperClassName:
    'flex flex-wrap gap-2 align-items-center justify-content-between',
  titleClassName: 'm-0',
  searchClassName: 'p-input-icon-left',
  inputClassName: 'p-inputtext p-component p-inputtext-sm',
  iconClassName: 'pi pi-search',
});

// Validation helpers for admin forms
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (
  value: string | number | boolean | null | undefined
): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'boolean') return true; // boolean values are always considered valid
  return false;
};

export const validateMinLength = (
  value: string,
  minLength: number
): boolean => {
  return typeof value === 'string' && value.length >= minLength;
};

// Common admin error handling
export const handleAdminError = (
  error: Error | string | unknown,
  defaultMessage: string
): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return defaultMessage;
};
