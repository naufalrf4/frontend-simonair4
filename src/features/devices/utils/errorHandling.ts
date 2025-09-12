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
    // Align with docs/api/devices.md error envelope
    const apiErr = (error.response?.data as any)?.error;
    const message = apiErr?.message || (error.response?.data as any)?.message || error.message;
    const codeFromBody = typeof apiErr?.code === 'number' ? apiErr.code : undefined;

    switch (status) {
      case 400:
        return new DeviceError(
          message || 'Invalid request. Please check your input and try again.',
          DeviceErrorType.VALIDATION_ERROR,
          codeFromBody ?? status,
          error
        );

      case 401:
        return new DeviceError(
          'You are not authorized to perform this action. Please log in again.',
          DeviceErrorType.AUTHORIZATION_ERROR,
          codeFromBody ?? status,
          error
        );

      case 403:
        return new DeviceError(
          'You do not have permission to access this device.',
          DeviceErrorType.AUTHORIZATION_ERROR,
          codeFromBody ?? status,
          error
        );

      case 404:
        return new DeviceError(
          'Device not found. It may have been deleted or you may not have access to it.',
          DeviceErrorType.NOT_FOUND_ERROR,
          codeFromBody ?? status,
          error
        );

      case 409:
        return new DeviceError(
          'Device ID already exists. Please choose a different device ID.',
          DeviceErrorType.CONFLICT_ERROR,
          codeFromBody ?? status,
          error
        );

      case 422:
        return new DeviceError(
          message || 'Invalid data provided. Please check your input.',
          DeviceErrorType.VALIDATION_ERROR,
          codeFromBody ?? status,
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
          codeFromBody ?? status,
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
 * Enhanced retry configuration for different error types
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  jitterFactor: 0.1, // Add randomness to prevent thundering herd
  retryableErrors: [
    DeviceErrorType.NETWORK_ERROR,
    DeviceErrorType.TIMEOUT_ERROR,
    DeviceErrorType.SERVER_ERROR,
  ],
  // Specific retry counts for different error types
  retryCountByType: {
    [DeviceErrorType.NETWORK_ERROR]: 3,
    [DeviceErrorType.TIMEOUT_ERROR]: 2,
    [DeviceErrorType.SERVER_ERROR]: 3,
  } as Partial<Record<DeviceErrorType, number>>,
};

/**
 * Calculate retry delay with exponential backoff and jitter
 */
export function calculateRetryDelay(attempt: number, errorType?: DeviceErrorType): number {
  const baseDelay = RETRY_CONFIG.baseDelay;
  const backoffFactor = RETRY_CONFIG.backoffFactor;
  const jitterFactor = RETRY_CONFIG.jitterFactor;
  
  // Calculate exponential backoff
  let delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  
  // Add jitter to prevent thundering herd problem
  const jitter = delay * jitterFactor * (Math.random() * 2 - 1); // Random between -jitterFactor and +jitterFactor
  delay += jitter;
  
  // Apply error-type specific adjustments
  if (errorType === DeviceErrorType.TIMEOUT_ERROR) {
    // Longer delays for timeout errors
    delay *= 1.5;
  } else if (errorType === DeviceErrorType.NETWORK_ERROR) {
    // Shorter delays for network errors (they might recover quickly)
    delay *= 0.8;
  }
  
  return Math.min(Math.max(delay, baseDelay * 0.5), RETRY_CONFIG.maxDelay);
}

/**
 * Check if error is retryable and get max retry count
 */
export function isRetryableError(error: DeviceError): boolean {
  return error.retryable || RETRY_CONFIG.retryableErrors.includes(error.type);
}

/**
 * Get maximum retry count for specific error type
 */
export function getMaxRetryCount(errorType: DeviceErrorType): number {
  return RETRY_CONFIG.retryCountByType[errorType] || RETRY_CONFIG.maxRetries;
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced error context for better debugging and monitoring
 */
export interface ErrorContext {
  operation: string;
  attempt: number;
  maxAttempts: number;
  timestamp: string;
  userAgent?: string;
  url?: string;
  method?: string;
  requestId?: string;
}

/**
 * Create error context for logging and monitoring
 */
export function createErrorContext(
  operation: string,
  attempt: number,
  maxAttempts: number,
  additionalContext?: Partial<ErrorContext>
): ErrorContext {
  return {
    operation,
    attempt,
    maxAttempts,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...additionalContext,
  };
}

/**
 * Log error with context for monitoring
 */
export function logErrorWithContext(error: DeviceError, context: ErrorContext): void {
  const logData = {
    error: {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      retryable: error.retryable,
    },
    context,
    stack: error.stack,
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Device Error:', logData);
  }
  
  // In production, you might want to send this to a monitoring service
  // Example: sendToMonitoringService(logData);
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new DeviceError(
          'Service temporarily unavailable. Please try again later.',
          DeviceErrorType.SERVER_ERROR,
          503,
          undefined,
          true
        );
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  getState(): string {
    return this.state;
  }
  
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

// Global circuit breaker instance for device operations
export const deviceCircuitBreaker = new CircuitBreaker(5, 60000);
