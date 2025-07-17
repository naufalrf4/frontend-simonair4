import { AxiosError } from 'axios';

/**
 * Error types for device operations
 */
export enum DeviceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Device-specific error class
 */
export class DeviceError extends Error {
  public readonly type: DeviceErrorType;
  public readonly statusCode?: number;
  public readonly originalError?: Error;
  public readonly retryable: boolean;

  constructor(
    message: string,
    type: DeviceErrorType,
    statusCode?: number,
    originalError?: Error,
    retryable = false
  ) {
    super(message);
    this.name = 'DeviceError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.retryable = retryable;
  }
}

/**
 * Parse API error and return user-friendly message
 */
export function parseApiError(error: unknown): DeviceError {
  if (error instanceof DeviceError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        return new DeviceError(
          message || 'Invalid request. Please check your input and try again.',
          DeviceErrorType.VALIDATION_ERROR,
          status,
          error
        );

      case 401:
        return new DeviceError(
          'You are not authorized to perform this action. Please log in again.',
          DeviceErrorType.AUTHORIZATION_ERROR,
          status,
          error
        );

      case 403:
        return new DeviceError(
          'You do not have permission to access this device.',
          DeviceErrorType.AUTHORIZATION_ERROR,
          status,
          error
        );

      case 404:
        return new DeviceError(
          'Device not found. It may have been deleted or you may not have access to it.',
          DeviceErrorType.NOT_FOUND_ERROR,
          status,
          error
        );

      case 409:
        return new DeviceError(
          'Device ID already exists. Please choose a different device ID.',
          DeviceErrorType.CONFLICT_ERROR,
          status,
          error
        );

      case 422:
        return new DeviceError(
          message || 'Invalid data provided. Please check your input.',
          DeviceErrorType.VALIDATION_ERROR,
          status,
          error
        );

      case 429:
        return new DeviceError(
          'Too many requests. Please wait a moment and try again.',
          DeviceErrorType.NETWORK_ERROR,
          status,
          error,
          true // Retryable
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return new DeviceError(
          'Server error occurred. Please try again in a few moments.',
          DeviceErrorType.SERVER_ERROR,
          status,
          error,
          true // Retryable
        );

      default:
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          return new DeviceError(
            'Request timed out. Please check your connection and try again.',
            DeviceErrorType.TIMEOUT_ERROR,
            undefined,
            error,
            true // Retryable
          );
        }

        if (error.code === 'ERR_NETWORK' || !error.response) {
          return new DeviceError(
            'Network error. Please check your internet connection and try again.',
            DeviceErrorType.NETWORK_ERROR,
            undefined,
            error,
            true // Retryable
          );
        }

        return new DeviceError(
          message || 'An unexpected error occurred. Please try again.',
          DeviceErrorType.UNKNOWN_ERROR,
          status,
          error,
          true // Retryable for unknown errors
        );
    }
  }

  if (error instanceof Error) {
    return new DeviceError(
      error.message || 'An unexpected error occurred.',
      DeviceErrorType.UNKNOWN_ERROR,
      undefined,
      error
    );
  }

  return new DeviceError(
    'An unexpected error occurred.',
    DeviceErrorType.UNKNOWN_ERROR
  );
}

/**
 * Get operation-specific error message (now uses localized messages)
 * @deprecated Use getLocalizedErrorMessage from constants/messages.ts instead
 */
export function getOperationErrorMessage(
  operation: 'CREATE_DEVICE' | 'UPDATE_DEVICE' | 'DELETE_DEVICE' | 'FETCH_DEVICES' | 'FETCH_DEVICE',
  error: DeviceError
): string {
  // Import here to avoid circular dependency
  try {
    const { getLocalizedErrorMessage } = require('../constants/messages');
    return getLocalizedErrorMessage(operation, error.type);
  } catch (err) {
    // Fallback if import fails
    return error.message || 'Terjadi kesalahan tidak dikenal.';
  }
}

/**
 * Retry configuration for different error types
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableErrors: [
    DeviceErrorType.NETWORK_ERROR,
    DeviceErrorType.TIMEOUT_ERROR,
    DeviceErrorType.SERVER_ERROR,
  ],
};

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: DeviceError): boolean {
  return error.retryable || RETRY_CONFIG.retryableErrors.includes(error.type);
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}