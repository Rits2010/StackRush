import { ApiError, ValidationError } from '../types/api';

// ===============================
// ERROR HANDLING UTILITIES
// ===============================

export class ApiException extends Error {
  public code: string;
  public details?: any[];
  public timestamp: string;
  public path: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.details = error.details;
    this.timestamp = error.timestamp;
    this.path = error.path;
  }
}

export class ValidationException extends ApiException {
  public validationErrors: ValidationError[];

  constructor(error: ApiError) {
    super(error);
    this.name = 'ValidationException';
    this.validationErrors = error.details || [];
  }

  getFieldErrors(): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    this.validationErrors.forEach((error: ValidationError) => {
      fieldErrors[error.field] = error.message;
    });
    return fieldErrors;
  }

  getFieldError(fieldName: string): string | undefined {
    const error = this.validationErrors.find(err => err.field === fieldName);
    return error?.message;
  }
}

// Error type guards
export const isApiError = (error: any): error is ApiException => {
  return error instanceof ApiException;
};

export const isValidationError = (error: any): error is ValidationException => {
  return error instanceof ValidationException;
};

// Error codes as constants
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  MISSING_TOKEN: 'MISSING_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CHALLENGE_NOT_FOUND: 'CHALLENGE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Conflict errors
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  USERNAME_EXISTS: 'USERNAME_EXISTS',
  CHALLENGE_EXISTS: 'CHALLENGE_EXISTS',
  
  // Rate limiting
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Password errors
  INCORRECT_CURRENT_PASSWORD: 'INCORRECT_CURRENT_PASSWORD',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  
  // Privacy errors
  PROFILE_PRIVATE: 'PROFILE_PRIVATE',
  STATS_PRIVATE: 'STATS_PRIVATE',
} as const;

// HTTP status code mappings
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Helper function to create user-friendly error messages
export const getErrorMessage = (error: any): string => {
  // First check if it's our custom API error with preserved structure
  if (error.code || error.response?.data?.error) {
    const errorCode = error.code || error.response?.data?.error?.code;
    const errorMessage = error.message || error.response?.data?.error?.message;
    
    switch (errorCode) {
      case ERROR_CODES.INVALID_CREDENTIALS:
        return 'Invalid email/username or password. Please check your credentials and try again.';
      case ERROR_CODES.EMAIL_EXISTS:
        return 'An account with this email address already exists. Please use a different email or try logging in.';
      case ERROR_CODES.USERNAME_EXISTS:
        return 'This username is already taken. Please choose a different username.';
      case ERROR_CODES.TOO_MANY_REQUESTS:
        return 'Too many requests. Please wait a moment before trying again.';
      case ERROR_CODES.NOT_FOUND:
        return 'The requested resource was not found.';
      case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
        return 'You do not have permission to perform this action.';
      case ERROR_CODES.VALIDATION_ERROR:
        // Handle validation errors with details
        if (error.details && Array.isArray(error.details)) {
          const errors = error.details.map((e: any) => e.message).join(', ');
          return `Validation failed: ${errors}`;
        }
        return 'Please check your input and try again.';
      case ERROR_CODES.INTERNAL_ERROR:
        return 'An internal server error occurred. Please try again later.';
      default:
        return errorMessage || 'An unexpected error occurred.';
    }
  }
  
  // Check if it's our ApiException class
  if (isApiError(error)) {
    switch (error.code) {
      case ERROR_CODES.INVALID_CREDENTIALS:
        return 'Invalid email/username or password. Please check your credentials and try again.';
      case ERROR_CODES.EMAIL_EXISTS:
        return 'An account with this email address already exists. Please use a different email or try logging in.';
      case ERROR_CODES.USERNAME_EXISTS:
        return 'This username is already taken. Please choose a different username.';
      case ERROR_CODES.TOO_MANY_REQUESTS:
        return 'Too many requests. Please wait a moment before trying again.';
      case ERROR_CODES.NOT_FOUND:
        return 'The requested resource was not found.';
      case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
        return 'You do not have permission to perform this action.';
      case ERROR_CODES.VALIDATION_ERROR:
        if (isValidationError(error)) {
          const errors = error.validationErrors.map(e => e.message).join(', ');
          return `Validation failed: ${errors}`;
        }
        return 'Please check your input and try again.';
      case ERROR_CODES.INTERNAL_ERROR:
        return 'An internal server error occurred. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Helper function to handle and format validation errors for forms
export const formatValidationErrors = (error: any): Record<string, string> => {
  // Handle our custom error structure first
  if (error.details && Array.isArray(error.details)) {
    const fieldErrors: Record<string, string> = {};
    error.details.forEach((validationError: any) => {
      if (validationError.field && validationError.message) {
        fieldErrors[validationError.field] = validationError.message;
      }
    });
    return fieldErrors;
  }
  
  // Handle ValidationException class
  if (isValidationError(error)) {
    return error.getFieldErrors();
  }
  
  return {};
};

// Helper function to check if error is a specific type
export const isErrorCode = (error: any, code: string): boolean => {
  return isApiError(error) && error.code === code;
};

// Retry configuration for failed requests
export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    // Retry on network errors and 5xx server errors
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED' ||
      (isApiError(error) && error.code === ERROR_CODES.INTERNAL_ERROR)
    );
  },
};

// Helper function to implement exponential backoff
export const calculateRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
};

// Toast notification types for error display
export type ToastType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorToastConfig {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Helper to create error toast configurations
export const createErrorToast = (error: any): ErrorToastConfig => {
  const message = getErrorMessage(error);
  
  if (isApiError(error)) {
    switch (error.code) {
      case ERROR_CODES.VALIDATION_ERROR:
        return {
          type: 'warning',
          title: 'Validation Error',
          message,
          duration: 5000,
        };
      case ERROR_CODES.TOO_MANY_REQUESTS:
        return {
          type: 'warning',
          title: 'Rate Limited',
          message,
          duration: 3000,
        };
      case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
        return {
          type: 'error',
          title: 'Access Denied',
          message,
          duration: 4000,
        };
      default:
        return {
          type: 'error',
          title: 'Error',
          message,
          duration: 4000,
        };
    }
  }
  
  return {
    type: 'error',
    title: 'Error',
    message,
    duration: 4000,
  };
};

// Error boundary helper
export const handleGlobalError = (error: any, errorInfo?: any) => {
  console.error('Global error:', error, errorInfo);
  
  // Log error to monitoring service (implement as needed)
  // logErrorToService(error, errorInfo);
  
  return createErrorToast(error);
};

export default {
  ApiException,
  ValidationException,
  isApiError,
  isValidationError,
  ERROR_CODES,
  HTTP_STATUS,
  getErrorMessage,
  formatValidationErrors,
  isErrorCode,
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  createErrorToast,
  handleGlobalError,
};