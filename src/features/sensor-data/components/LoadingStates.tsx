import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading state components for sensor data feature
 * Provides consistent loading skeletons and animations
 */

// Table loading skeleton
export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {/* Table header skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex space-x-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};

// Sensor table card loading skeleton
export const SensorTableCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </CardHeader>
      
      <CardContent>
        <TableLoadingSkeleton rows={3} />
        
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-4 pt-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Device selector loading skeleton
export const DeviceSelectorSkeleton: React.FC = () => {
  return (
    <div className="min-w-[280px]">
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

// Date range filter loading skeleton
export const DateRangeFilterSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-10 w-10" />
    </div>
  );
};

// Page header loading skeleton
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <DeviceSelectorSkeleton />
          <DateRangeFilterSkeleton />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

// Full page loading skeleton
export const SensorDataPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>       <SensorTableCardSkeleton />
        <SensorTableCardSkeleton />
        <SensorTableCardSkeleton />
        <SensorTableCardSkeleton />
      
      
      {/* Footer skeleton */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  );
};

// Inline loading spinner
export const InlineLoader: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}> = ({ size = 'md', text = 'Memuat...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Pulse animation for loading states
export const PulseLoader: React.FC<{ 
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Shimmer effect for loading cards
export const ShimmerCard: React.FC<{ 
  height?: string;
  className?: string;
}> = ({ height = 'h-32', className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded-lg ${height} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

// Loading overlay for components
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}> = ({ isLoading, children, text = 'Memuat data...' }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        </div>
      )}
    </div>
  );
};