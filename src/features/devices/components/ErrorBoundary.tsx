import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for devices feature
 */
export class DeviceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DeviceErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Terjadi Kesalahan</CardTitle>
            <CardDescription>
              Terjadi kesalahan tidak terduga saat memuat antarmuka perangkat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">Detail kesalahan:</p>
              <p className="font-mono text-xs break-all">
                {this.state.error?.message || 'Kesalahan tidak dikenal'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={this.handleRetry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Muat Ulang Halaman
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Jika masalah ini terus berlanjut, silakan hubungi dukungan.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const DeviceErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">Kesalahan Perangkat</CardTitle>
        <CardDescription>
          Terjadi kesalahan saat mengelola perangkat Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">Detail kesalahan:</p>
          <p className="font-mono text-xs break-all">
            {error.message || 'Kesalahan tidak dikenal'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={resetError}
            className="flex-1"
            variant="default"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            Muat Ulang Halaman
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          Jika masalah ini terus berlanjut, silakan hubungi dukungan.
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * Lightweight error boundary for specific components
 */
interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName: string;
  onError?: (error: Error) => void;
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName,
  onError,
}) => {
  return (
    <DeviceErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`Error in ${componentName}:`, error, errorInfo);
        if (onError) {
          onError(error);
        }
      }}
      fallback={
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Kesalahan pada {componentName}</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Komponen ini mengalami kesalahan dan tidak dapat ditampilkan.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Muat Ulang Halaman
          </Button>
        </div>
      }
    >
      {children}
    </DeviceErrorBoundary>
  );
};