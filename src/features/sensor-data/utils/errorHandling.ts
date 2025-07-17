import type { SensorDataError } from '../types';

/**
 * Comprehensive error handling utilities for sensor data feature
 * Provides Indonesian error messages, retry logic, and error categorization
 */

// Error message mappings in Indonesian
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Koneksi bermasalah. Periksa koneksi internet Anda.',
  TIMEOUT_ERROR: 'Permintaan timeout. Silakan coba lagi.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses untuk melihat data ini.',
  
  // Data errors
  DEVICE_NOT_FOUND: 'Perangkat tidak ditemukan atau tidak aktif.',
  NO_DATA_AVAILABLE: 'Tidak ada data sensor untuk periode yang dipilih.',
  INVALID_RESPONSE_FORMAT: 'Format data dari server tidak valid.',
  INCOMPLETE_RESPONSE: 'Data dari server tidak lengkap.',
  
  // Validation errors
  INVALID_DEVICE_ID: 'ID perangkat tidak valid.',
  INVALID_DATE_RANGE: 'Rentang tanggal tidak valid.',
  DATE_RANGE_TOO_LARGE: 'Rentang tanggal terlalu besar. Maksimal 1 tahun.',
  INVALID_PAGE: 'Nomor halaman tidak valid.',
  INVALID_LIMIT: 'Jumlah data per halaman tidak valid.',
  INVALID_DATE_FORMAT: 'Format tanggal tidak sesuai.',
  
  // Real-time errors
  REALTIME_CONNECTION_FAILED: 'Gagal terhubung untuk pembaruan real-time.',
  REALTIME_DISCONNECTED: 'Koneksi real-time terputus. Mencoba menyambung kembali...',
  POLLING_FAILED: 'Gagal memperbarui data secara otomatis.',
  
  // Export errors
  EXPORT_NO_DATA: 'Tidak ada data untuk diekspor.',
  EXPORT_FAILED: 'Gagal mengekspor data ke Excel.',
  EXPORT_FILE_TOO_LARGE: 'File terlalu besar untuk diekspor. Kurangi rentang tanggal.',
  
  // Generic errors
  UNKNOWN_ERROR: 'Terjadi kesalahan tidak terduga.',
  OPERATION_CANCELLED: 'Operasi dibatalkan.',
  PERMISSION_DENIED: 'Akses ditolak.',
} as const;

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Enhanced error interface
export interface EnhancedSensorDataError extends SensorDataError {
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
  technicalMessage?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

/**
 * Create enhanced error from basic error
 */
export const createEnhancedError = (
  error: SensorDataError | Error | any,
  context?: Record<string, any>
): EnhancedSensorDataError => {
  let baseError: SensorDataError;
  
  // Convert different error types to SensorDataError
  if (error && typeof error === 'object' && 'type' in error) {
    baseError = error as SensorDataError;
  } else if (error instanceof Error) {
    baseError = {
      type: 'data',
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  } else {
    baseError = {
      type: 'data',
      message: String(error) || 'Unknown error',
      code: 'UNKNOWN_ERROR'
    };
  }

  // Determine severity and retryability
  const { severity, retryable } = categorizeError(baseError);
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(baseError);

  return {
    ...baseError,
    severity,
    retryable,
    userMessage,
    technicalMessage: baseError.message,
    timestamp: new Date(),
    context
  };
};

/**
 * Categorize error by severity and retryability
 */
const categorizeError = (error: SensorDataError): { 
  severity: ErrorSeverity; 
  retryable: boolean; 
} => {
  switch (error.type) {
    case 'network':
      switch (error.code) {
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
          return { severity: 'high', retryable: false };
        case 'SERVER_ERROR':
          return { severity: 'medium', retryable: true };
        case 'TIMEOUT_ERROR':
          return { severity: 'low', retryable: true };
        default:
          return { severity: 'medium', retryable: true };
      }
      
    case 'validation':
      return { severity: 'low', retryable: false };
      
    case 'data':
      switch (error.code) {
        case 'DEVICE_NOT_FOUND':
          return { severity: 'medium', retryable: false };
        case 'NO_DATA_AVAILABLE':
          return { severity: 'low', retryable: false };
        case 'INVALID_RESPONSE_FORMAT':
        case 'INCOMPLETE_RESPONSE':
          return { severity: 'high', retryable: true };
        default:
          return { severity: 'medium', retryable: false };
      }
      
    case 'realtime':
      return { severity: 'low', retryable: true };
      
    default:
      return { severity: 'medium', retryable: false };
  }
};

/**
 * Get user-friendly error message in Indonesian
 */
const getUserFriendlyMessage = (error: SensorDataError): string => {
  const code = error.code as keyof typeof ERROR_MESSAGES;
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Retry configuration for different error types
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
};

/**
 * Get retry configuration based on error type
 */
export const getRetryConfig = (error: EnhancedSensorDataError): RetryConfig => {
  if (!error.retryable) {
    return { ...DEFAULT_RETRY_CONFIG, maxAttempts: 0 };
  }

  switch (error.type) {
    case 'network':
      if (error.code === 'TIMEOUT_ERROR') {
        return {
          maxAttempts: 5,
          baseDelay: 2000,
          maxDelay: 60000,
          backoffMultiplier: 1.5
        };
      }
      return DEFAULT_RETRY_CONFIG;
      
    case 'realtime':
      return {
        maxAttempts: 10,
        baseDelay: 5000,
        maxDelay: 300000, // 5 minutes
        backoffMultiplier: 1.2
      };
      
    default:
      return DEFAULT_RETRY_CONFIG;
  }
};

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (
  attempt: number, 
  config: RetryConfig
): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  error: EnhancedSensorDataError,
  onRetry?: (attempt: number, delay: number) => void
): Promise<T> => {
  const config = getRetryConfig(error);
  
  if (config.maxAttempts === 0) {
    throw error;
  }

  let lastError = error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = createEnhancedError(err, { 
        retryAttempt: attempt,
        originalError: error 
      });
      
      if (attempt === config.maxAttempts) {
        break;
      }
      
      const delay = calculateRetryDelay(attempt, config);
      
      if (onRetry) {
        onRetry(attempt, delay);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Error boundary helper for React components
 */
export const handleComponentError = (
  error: Error,
  errorInfo: { componentStack: string },
  context?: Record<string, any>
): EnhancedSensorDataError => {
  const enhancedError = createEnhancedError(error, {
    componentStack: errorInfo.componentStack,
    ...context
  });
  
  // Log error for debugging
  console.error('Component Error:', {
    error: enhancedError,
    stack: error.stack,
    componentStack: errorInfo.componentStack
  });
  
  return enhancedError;
};

/**
 * Network error detector
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // Check for common network error indicators
  return (
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('fetch') ||
    !navigator.onLine ||
    (error.response === undefined && error.request !== undefined)
  );
};

/**
 * Get error action suggestions
 */
export const getErrorActions = (error: EnhancedSensorDataError): Array<{
  label: string;
  action: string;
  primary?: boolean;
}> => {
  const actions = [];
  
  if (error.retryable) {
    actions.push({
      label: 'Coba Lagi',
      action: 'retry',
      primary: true
    });
  }
  
  switch (error.type) {
    case 'network':
      if (error.code === 'UNAUTHORIZED') {
        actions.push({
          label: 'Login Ulang',
          action: 'login',
          primary: true
        });
      } else {
        actions.push({
          label: 'Periksa Koneksi',
          action: 'check-connection'
        });
      }
      break;
      
    case 'data':
      if (error.code === 'DEVICE_NOT_FOUND') {
        actions.push({
          label: 'Pilih Perangkat Lain',
          action: 'select-device'
        });
      } else if (error.code === 'NO_DATA_AVAILABLE') {
        actions.push({
          label: 'Ubah Rentang Tanggal',
          action: 'change-date-range'
        });
      }
      break;
      
    case 'validation':
      actions.push({
        label: 'Perbaiki Input',
        action: 'fix-input',
        primary: true
      });
      break;
  }
  
  actions.push({
    label: 'Muat Ulang Halaman',
    action: 'reload'
  });
  
  return actions;
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error: EnhancedSensorDataError): {
  title: string;
  message: string;
  severity: ErrorSeverity;
  actions: Array<{ label: string; action: string; primary?: boolean }>;
} => {
  const severityTitles = {
    low: 'Peringatan',
    medium: 'Kesalahan',
    high: 'Kesalahan Serius',
    critical: 'Kesalahan Kritis'
  };
  
  return {
    title: severityTitles[error.severity],
    message: error.userMessage,
    severity: error.severity,
    actions: getErrorActions(error)
  };
};

/**
 * Error reporting helper (can be integrated with external services)
 */
export const reportError = (
  error: EnhancedSensorDataError,
  userId?: string,
  sessionId?: string
): void => {
  // Only report medium and high severity errors
  if (error.severity === 'low') {
    return;
  }
  
  const errorReport = {
    error: {
      type: error.type,
      code: error.code,
      message: error.message,
      severity: error.severity
    },
    context: error.context,
    timestamp: error.timestamp,
    userId,
    sessionId,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Log to console for development
  console.error('Error Report:', errorReport);
  
  // Here you can integrate with error reporting services like:
  // - Sentry: Sentry.captureException(error, { extra: errorReport });
  // - LogRocket: LogRocket.captureException(error);
  // - Custom API: sendErrorReport(errorReport);
};

/**
 * Create error toast notification
 */
export const createErrorToast = (error: EnhancedSensorDataError): {
  title: string;
  description: string;
  variant: 'destructive' | 'default';
  duration?: number;
} => {
  const formatted = formatErrorForDisplay(error);
  
  return {
    title: formatted.title,
    description: formatted.message,
    variant: error.severity === 'low' ? 'default' : 'destructive',
    duration: error.severity === 'low' ? 3000 : 5000
  };
};