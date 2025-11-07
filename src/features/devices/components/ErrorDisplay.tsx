import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Shield, 
  AlertCircle,
  Clock,
  Server
} from 'lucide-react';
import { DeviceError, DeviceErrorType } from '../utils/errorHandling';
import { useTranslation } from 'react-i18next';

interface ErrorDisplayProps {
  error: DeviceError | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Get appropriate icon for error type
 */
function getErrorIcon(errorType: DeviceErrorType) {
  switch (errorType) {
    case DeviceErrorType.NETWORK_ERROR:
      return WifiOff;
    case DeviceErrorType.TIMEOUT_ERROR:
      return Clock;
    case DeviceErrorType.AUTHORIZATION_ERROR:
      return Shield;
    case DeviceErrorType.SERVER_ERROR:
      return Server;
    case DeviceErrorType.VALIDATION_ERROR:
      return AlertCircle;
    default:
      return AlertTriangle;
  }
}

/**
 * Get error color scheme based on error type
 */
function getErrorColors(errorType: DeviceErrorType) {
  switch (errorType) {
    case DeviceErrorType.NETWORK_ERROR:
    case DeviceErrorType.TIMEOUT_ERROR:
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        button: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
      };
    case DeviceErrorType.AUTHORIZATION_ERROR:
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-600',
        button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
      };
    case DeviceErrorType.SERVER_ERROR:
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        button: 'bg-red-100 hover:bg-red-200 text-red-800',
      };
    default:
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        button: 'bg-red-100 hover:bg-red-200 text-red-800',
      };
  }
}

/**
 * Main error display component
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  compact = false,
}) => {
  if (!error) return null;

  const { t } = useTranslation('devices');
  const deviceError = error instanceof DeviceError ? error : null;
  const errorType = deviceError?.type || DeviceErrorType.UNKNOWN_ERROR;
  const ErrorIcon = getErrorIcon(errorType);
  const colors = getErrorColors(errorType);

  if (compact) {
    return (
      <Alert className={`${colors.bg} ${colors.border} ${className}`}>
        <ErrorIcon className={`h-4 w-4 ${colors.icon}`} />
        <AlertDescription className={colors.text}>
          {error.message}
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className={`ml-2 h-6 px-2 ${colors.button}`}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {t('errors.actions.retry')}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={`${colors.bg} ${colors.border} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${colors.bg}`}>
            <ErrorIcon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div>
            <CardTitle className={`text-lg ${colors.text}`}>
              {t(`errors.titles.${errorType}`, {
                defaultValue: t('errors.titles.UNKNOWN_ERROR'),
              })}
            </CardTitle>
            <CardDescription className={colors.text}>
              {error.message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-2">
          {onRetry && deviceError?.retryable && (
            <Button
              onClick={onRetry}
              size="sm"
              className={colors.button}
              variant="ghost"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('errors.actions.retry')}
            </Button>
          )}
          
          {errorType === DeviceErrorType.NETWORK_ERROR && (
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="ghost"
              className={colors.button}
            >
              <Wifi className="w-4 h-4 mr-2" />
              {t('errors.actions.checkConnection')}
            </Button>
          )}
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              size="sm"
              variant="ghost"
              className={colors.button}
            >
              {t('errors.actions.dismiss')}
            </Button>
          )}
        </div>
        
        {deviceError && (
          <div className="mt-3 text-xs text-gray-500">
            <p>
              {t('errors.meta.code')}: {errorType}
            </p>
            {deviceError.statusCode && (
              <p>
                {t('errors.meta.status')}: {deviceError.statusCode}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Inline error component for forms and small spaces
 */
interface InlineErrorProps {
  error: DeviceError | Error | null;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`flex items-center space-x-2 text-red-600 text-sm ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};

/**
 * Loading error state component
 */
interface LoadingErrorProps {
  error: DeviceError | Error | null;
  onRetry?: () => void;
  loading?: boolean;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({ error, onRetry, loading }) => {
  if (!error) return null;

  const { t } = useTranslation('devices');
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('errors.generic.loadFailed', { defaultValue: t('errors.operations.list.default') })}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {error.message}
        </p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t('loading.generic')}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('errors.actions.retry')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
