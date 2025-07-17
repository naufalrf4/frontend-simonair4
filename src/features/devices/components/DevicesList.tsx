import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Plus, Wifi, WifiOff } from 'lucide-react';
import { DeviceCard } from './DeviceCard';
import { useDebounce } from '@/hooks/useDebounce';
import type { Device, PaginationState } from '../types';
import { DEVICE_MESSAGES } from '../constants/messages';

export interface DevicesListProps {
  devices: Device[];
  pagination: PaginationState;
  loading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onAddDevice: () => void;
  onDeviceClick?: (device: Device) => void;
  onEditDevice?: (device: Device) => void;
  onDeleteDevice?: (device: Device) => void;
  onViewDetails?: (device: Device) => void;
  className?: string;
}

export const DevicesList: React.FC<DevicesListProps> = ({
  devices,
  pagination,
  loading,
  searchValue,
  onSearchChange,
  onPageChange,
  onAddDevice,
  onDeviceClick,
  onEditDevice,
  onDeleteDevice,
  onViewDetails,
  className,
}) => {
  // Debounce search input to avoid excessive API calls
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;
    
    // Always show first page
    if (totalPages > 0) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if there's a gap
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if there's a gap
    if (page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => {
    const hasSearch = debouncedSearchValue.trim().length > 0;
    
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {hasSearch ? (
            <Search className="w-12 h-12 text-gray-400" />
          ) : (
            <Wifi className="w-12 h-12 text-gray-400" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {hasSearch ? DEVICE_MESSAGES.EMPTY_SEARCH_TITLE : DEVICE_MESSAGES.EMPTY_STATE_TITLE}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {hasSearch 
            ? DEVICE_MESSAGES.EMPTY_SEARCH_DESCRIPTION
            : DEVICE_MESSAGES.EMPTY_STATE_DESCRIPTION
          }
        </p>
        
        {!hasSearch && (
          <Button onClick={onAddDevice} className="inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            {DEVICE_MESSAGES.ADD_DEVICE}
          </Button>
        )}
      </div>
    );
  };

  // Stats component
  const DeviceStats = () => {
    const onlineCount = devices.filter(device => device.online).length;
    const offlineCount = devices.length - onlineCount;
    
    return (
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-600" />
          <span>{onlineCount} {DEVICE_MESSAGES.STATUS_ONLINE.toLowerCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-600" />
          <span>{offlineCount} {DEVICE_MESSAGES.STATUS_OFFLINE.toLowerCase()}</span>
        </div>
        <div>
          Total: {pagination.total} perangkat
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={DEVICE_MESSAGES.SEARCH_PLACEHOLDER}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button onClick={onAddDevice} className="inline-flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          {DEVICE_MESSAGES.ADD_DEVICE}
        </Button>
      </div>

      {/* Device stats */}
      {!loading && devices.length > 0 && (
        <div className="mb-6">
          <DeviceStats />
        </div>
      )}

      {/* Loading state */}
      {loading && <LoadingSkeleton />}

      {/* Empty state */}
      {!loading && devices.length === 0 && <EmptyState />}

      {/* Devices grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {devices.map((device) => (
          <DeviceCard
            key={device.device_id}
            device={device}
            onClick={onDeviceClick}
            onEdit={onEditDevice}
            onDelete={onDeleteDevice}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                  className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {generatePaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};