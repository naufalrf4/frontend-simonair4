import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, Wifi, WifiOff, Monitor, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { SensorDataService, sensorDataKeys } from '../services/sensorDataService';
import type { Device } from '../types';

interface DeviceSelectorProps {
  devices?: Device[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device | null) => void;
  error?: void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * DeviceSelector component with clean dropdown UI
 * Implements device search, filtering, loading states, and error handling
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
export function DeviceSelector({
  selectedDevice,
  onDeviceSelect,
  placeholder = "Pilih perangkat...",
  className,
  disabled = false
}: DeviceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch devices using TanStack Query
  const {
    data: devices = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: sensorDataKeys.devices(),
    queryFn: () => SensorDataService.getDevices(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry for validation errors, only network errors
      if (error?.type === 'validation' || error?.type === 'data') {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Filter devices based on search query
  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) {
      return devices;
    }

    const query = searchQuery.toLowerCase().trim();
    return devices.filter(device => 
      device.name.toLowerCase().includes(query) ||
      device.device_id.toLowerCase().includes(query)
    );
  }, [devices, searchQuery]);

  // Handle device selection
  const handleDeviceSelect = (device: Device) => {
    onDeviceSelect(device);
    setOpen(false);
    setSearchQuery(''); // Clear search when selecting
  };

  // Handle clear selection
  const handleClearSelection = () => {
    onDeviceSelect(null);
    setOpen(false);
  };

  // Get status icon for device
  const getStatusIcon = (device: Device) => {
    if (device.status === 'online') {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  // Get display text for selected device
  const getSelectedDeviceText = () => {
    if (!selectedDevice) {
      return placeholder;
    }
    return `${selectedDevice.name} (${selectedDevice.device_id})`;
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left font-normal",
              !selectedDevice && "text-muted-foreground"
            )}
            disabled={disabled || isLoading}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Monitor className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {getSelectedDeviceText()}
              </span>
            </div>
            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="flex flex-col">
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
              <Input
                placeholder="Cari perangkat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 px-0 py-1 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Device List */}
            <div className="max-h-[300px] overflow-y-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Memuat perangkat...</span>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 mb-3">
                    {error.message || 'Gagal memuat daftar perangkat'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="text-xs"
                  >
                    Coba Lagi
                  </Button>
                </div>
              )}

              {/* Empty State - No Devices */}
              {!isLoading && !error && devices.length === 0 && (
                <div className="p-4 text-center">
                  <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Tidak ada perangkat tersedia
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tambahkan perangkat terlebih dahulu
                  </p>
                </div>
              )}

              {/* Empty State - No Search Results */}
              {!isLoading && !error && devices.length > 0 && filteredDevices.length === 0 && searchQuery && (
                <div className="p-4 text-center">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Tidak ada hasil untuk "{searchQuery}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coba kata kunci lain
                  </p>
                </div>
              )}

              {/* Device Options */}
              {!isLoading && !error && filteredDevices.length > 0 && (
                <div className="p-1">
                  {/* Clear Selection Option */}
                  {selectedDevice && (
                    <>
                      <button
                        onClick={handleClearSelection}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="h-4 w-4" /> {/* Spacer for alignment */}
                          <span className="text-muted-foreground italic">
                            Hapus pilihan
                          </span>
                        </div>
                      </button>
                      <div className="h-px bg-border my-1" />
                    </>
                  )}

                  {/* Device List */}
                  {filteredDevices.map((device) => {
                    const isSelected = selectedDevice?.device_id === device.device_id;
                    
                    return (
                      <button
                        key={device.device_id}
                        onClick={() => handleDeviceSelect(device)}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getStatusIcon(device)}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {device.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {device.device_id}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
