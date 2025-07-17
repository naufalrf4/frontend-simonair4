import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { 
  handleComponentError, 
  formatErrorForDisplay, 
  reportError,
  type EnhancedSensorDataError 
} from '../utils/errorHandling';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: Record<string, any>;
}

/**
 * Error fallback component for sensor data feature
 */
const SensorDataErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  context
}) => {
  const [isReporting, setIsReporting] = React.useState(false);
  
  // Convert error to enhanced error
  const enhancedError = React.useMemo(() => 
    handleComponentError(error, { componentStack: '' }, context),
    [error, context]
  );
  
  const formattedError = formatErrorForDisplay(enhancedError);
  
  // Handle error actions
  const handleAction = async (action: string) => {
    switch (action) {
      case 'retry':
        resetErrorBoundary();
        break;
        
      case 'reload':
        window.location.reload();
        break;
        
      case 'home':
        window.location.href = '/dashboard';
        break;
        
      case 'report':
        setIsReporting(true);
        try {
          reportError(enhancedError);
          toast.success('Laporan kesalahan telah dikirim');
        } catch (err) {
          toast.error('Gagal mengirim laporan kesalahan');
        } finally {
          setIsReporting(false);
        }
        break;
        
      default:
        console.warn('Unknown error action:', action);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {formattedError.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formattedError.message}
            </AlertDescription>
          </Alert>
          
          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                Detail Teknis (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                <div><strong>Error:</strong> {error.message}</div>
                <div><strong>Type:</strong> {enhancedError.type}</div>
                <div><strong>Code:</strong> {enhancedError.code}</div>
                <div><strong>Timestamp:</strong> {enhancedError.timestamp.toISOString()}</div>
                {enhancedError.context && (
                  <div><strong>Context:</strong> {JSON.stringify(enhancedError.context, null, 2)}</div>
                )}
              </div>
            </details>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {formattedError.actions.map((action) => (
              <Button
                key={action.action}
                variant={action.primary ? 'default' : 'outline'}
                onClick={() => handleAction(action.action)}
                className="flex-1"
                disabled={isReporting && action.action === 'report'}
              >
                {action.action === 'retry' && <RefreshCw className="h-4 w-4 mr-2" />}
                {action.action === 'home' && <Home className="h-4 w-4 mr-2" />}
                {action.action === 'report' && <Bug className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
          
          {/* Additional help */}
          <div className="text-center text-sm text-gray-600">
            <p>Jika masalah berlanjut, silakan hubungi administrator sistem</p>
            <p className="mt-1">atau coba muat ulang halaman</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SensorDataErrorBoundaryProps {
  children: React.ReactNode;
  context?: Record<string, any>;
  onError?: (error: EnhancedSensorDataError) => void;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

/**
 * Error boundary wrapper for sensor data components
 */
export const SensorDataErrorBoundary: React.FC<SensorDataErrorBoundaryProps> = ({
  children,
  context,
  // onError,
  fallback: CustomFallback
}) => {
  // const handleError = (error: Error, errorInfo: { componentStack: string }) => {
  //   const enhancedError = handleComponentError(error, errorInfo, context);
    
  //   // Report error automatically for high severity errors
  //   if (enhancedError.severity === 'high' || enhancedError.severity === 'critical') {
  //     reportError(enhancedError);
  //   }
    
  //   // Call custom error handler if provided
  //   if (onError) {
  //     onError(enhancedError);
  //   }
    
  //   // Show toast notification
  //   toast.error(enhancedError.userMessage, {
  //     duration: 5000,
  //     action: {
  //       label: 'Detail',
  //       onClick: () => console.error('Error details:', enhancedError)
  //     }
  //   });
  // };
  
  const handleReset = () => {
    // Clear any cached data or reset state
    console.log('Resetting sensor data error boundary...');
    
    // You can add custom reset logic here
    // For example: clear React Query cache, reset global state, etc.
  };
  
  const FallbackComponent = CustomFallback || SensorDataErrorFallback;
  
  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <FallbackComponent {...props} context={context} />
      )}
      // onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

/**
 * Hook for handling errors in sensor data components
 */
export const useSensorDataErrorHandler = () => {
  const handleError = React.useCallback((error: any, context?: Record<string, any>) => {
    const enhancedError = handleComponentError(
      error instanceof Error ? error : new Error(String(error)),
      { componentStack: '' },
      context
    );
    
    // Show user-friendly error message
    const errorToast = formatErrorForDisplay(enhancedError);
    toast.error(errorToast.message, {
      duration: enhancedError.severity === 'low' ? 3000 : 5000
    });
    
    // Report if necessary
    if (enhancedError.severity === 'high' || enhancedError.severity === 'critical') {
      reportError(enhancedError);
    }
    
    return enhancedError;
  }, []);
  
  const handleAsyncError = React.useCallback(async (
    operation: () => Promise<any>,
    context?: Record<string, any>
  ) => {
    try {
      return await operation();
    } catch (error) {
      throw handleError(error, context);
    }
  }, [handleError]);
  
  return {
    handleError,
    handleAsyncError
  };
};