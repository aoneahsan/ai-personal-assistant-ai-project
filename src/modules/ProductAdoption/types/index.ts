// Export all type definitions
export * from './analytics.types';
export * from './tour.types';
export * from './widget.types';

// Common types used across the module
export interface ProductAdoptionConfig {
  apiKey: string;
  userId?: string;
  environment: 'development' | 'staging' | 'production';
  debug?: boolean;
  customStyles?: Record<string, unknown>;
  baseUrl?: string;
}

export interface ElementSelector {
  selector: string;
  type: 'css' | 'xpath' | 'id' | 'class';
  fallback?: string;
}

export interface UserContext {
  id: string;
  email?: string;
  name?: string;
  properties?: Record<string, unknown>;
  segments?: string[];
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: ResponseMetadata;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  pagination?: PaginationData;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface BatchOperation<T> {
  items: T[];
  operation: 'create' | 'update' | 'delete';
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
