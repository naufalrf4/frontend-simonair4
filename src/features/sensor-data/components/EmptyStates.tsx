import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  AlertCircle, 
  Search, 
  Calendar, 
  Wifi, 
  RefreshCw,
  Plus,
  Settings
} from 'lucide-react';

/**
 * Empty state components for sensor data feature
 * Provides user-friendly empty states with actionable suggestions
 */

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
}

// Base empty state component
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actions = [],
  className = ''
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 p-3 bg-muted rounded-full">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  className="min-w-[120px]"
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// No device selected state
export const NoDeviceSelectedState: React.FC<{
  onSelectDevice?: () => void;
}> = ({ onSelectDevice }) => {
  return (
    <EmptyState
      icon={Database}
      title="Pilih Perangkat"
      description="Pilih perangkat dari dropdown di atas untuk melihat data sensor historis"
      actions={onSelectDevice ? [{
        label: 'Pilih Perangkat',
        onClick: onSelectDevice,
        icon: Database
      }] : []}
    />
  );
};

// No data available state
export const NoDataAvailableState: React.FC<{
  deviceName?: string;
  onChangeDateRange?: () => void;
  onRefresh?: () => void;
}> = ({ deviceName, onChangeDateRange, onRefresh }) => {
  const actions = [];
  
  if (onChangeDateRange) {
    actions.push({
      label: 'Ubah Rentang Tanggal',
      onClick: onChangeDateRange,
      variant: 'default' as const,
      icon: Calendar
    });
  }
  
  if (onRefresh) {
    actions.push({
      label: 'Muat Ulang',
      onClick: onRefresh,
      variant: 'outline' as const,
      icon: RefreshCw
    });
  }
  
  return (
    <EmptyState
      icon={AlertCircle}
      title="Tidak Ada Data"
      description={
        deviceName 
          ? `Tidak ada data sensor untuk perangkat "${deviceName}" pada rentang tanggal yang dipilih`
          : 'Tidak ada data sensor untuk rentang tanggal yang dipilih'
      }
      actions={actions}
    />
  );
};

// No devices found state
export const NoDevicesFoundState: React.FC<{
  onRefresh?: () => void;
  onAddDevice?: () => void;
}> = ({ onRefresh, onAddDevice }) => {
  const actions = [];
  
  if (onAddDevice) {
    actions.push({
      label: 'Tambah Perangkat',
      onClick: onAddDevice,
      variant: 'default' as const,
      icon: Plus
    });
  }
  
  if (onRefresh) {
    actions.push({
      label: 'Muat Ulang',
      onClick: onRefresh,
      variant: 'outline' as const,
      icon: RefreshCw
    });
  }
  
  return (
    <EmptyState
      icon={Database}
      title="Tidak Ada Perangkat"
      description="Tidak ada perangkat yang tersedia. Pastikan perangkat IoT Anda sudah terdaftar dan aktif"
      actions={actions}
    />
  );
};

// Search no results state
export const SearchNoResultsState: React.FC<{
  searchQuery?: string;
  onClearSearch?: () => void;
}> = ({ searchQuery, onClearSearch }) => {
  return (
    <EmptyState
      icon={Search}
      title="Tidak Ada Hasil"
      description={
        searchQuery 
          ? `Tidak ditemukan hasil untuk pencarian "${searchQuery}"`
          : 'Tidak ditemukan hasil untuk pencarian Anda'
      }
      actions={onClearSearch ? [{
        label: 'Hapus Pencarian',
        onClick: onClearSearch,
        variant: 'outline',
        icon: RefreshCw
      }] : []}
    />
  );
};

// Device offline state
export const DeviceOfflineState: React.FC<{
  deviceName?: string;
  onRefresh?: () => void;
  onCheckConnection?: () => void;
}> = ({ deviceName, onRefresh, onCheckConnection }) => {
  const actions = [];
  
  if (onCheckConnection) {
    actions.push({
      label: 'Periksa Koneksi',
      onClick: onCheckConnection,
      variant: 'default' as const,
      icon: Settings
    });
  }
  
  if (onRefresh) {
    actions.push({
      label: 'Coba Lagi',
      onClick: onRefresh,
      variant: 'outline' as const,
      icon: RefreshCw
    });
  }
  
  return (
    <EmptyState
      icon={Wifi}
      title="Perangkat Offline"
      description={
        deviceName 
          ? `Perangkat "${deviceName}" sedang offline. Data mungkin tidak terbaru`
          : 'Perangkat sedang offline. Data mungkin tidak terbaru'
      }
      actions={actions}
    />
  );
};

// Loading failed state
export const LoadingFailedState: React.FC<{
  error?: string;
  onRetry?: () => void;
  onReportError?: () => void;
}> = ({ error, onRetry, onReportError }) => {
  const actions = [];
  
  if (onRetry) {
    actions.push({
      label: 'Coba Lagi',
      onClick: onRetry,
      variant: 'default' as const,
      icon: RefreshCw
    });
  }
  
  if (onReportError) {
    actions.push({
      label: 'Laporkan Masalah',
      onClick: onReportError,
      variant: 'outline' as const,
      icon: AlertCircle
    });
  }
  
  return (
    <EmptyState
      icon={AlertCircle}
      title="Gagal Memuat Data"
      description={error || 'Terjadi kesalahan saat memuat data. Silakan coba lagi'}
      actions={actions}
    />
  );
};

// Maintenance mode state
export const MaintenanceModeState: React.FC<{
  message?: string;
  estimatedTime?: string;
}> = ({ message, estimatedTime }) => {
  return (
    <EmptyState
      icon={Settings}
      title="Sedang Maintenance"
      description={
        message || 
        `Sistem sedang dalam pemeliharaan. ${estimatedTime ? `Diperkirakan selesai dalam ${estimatedTime}` : 'Silakan coba lagi nanti'}`
      }
    />
  );
};

// Permission denied state
export const PermissionDeniedState: React.FC<{
  onLogin?: () => void;
  onContactAdmin?: () => void;
}> = ({ onLogin, onContactAdmin }) => {
  const actions = [];
  
  if (onLogin) {
    actions.push({
      label: 'Login Ulang',
      onClick: onLogin,
      variant: 'default' as const
    });
  }
  
  if (onContactAdmin) {
    actions.push({
      label: 'Hubungi Admin',
      onClick: onContactAdmin,
      variant: 'outline' as const
    });
  }
  
  return (
    <EmptyState
      icon={AlertCircle}
      title="Akses Ditolak"
      description="Anda tidak memiliki izin untuk mengakses data ini. Silakan hubungi administrator"
      actions={actions}
    />
  );
};

// Generic empty table state
export const EmptyTableState: React.FC<{
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}> = ({ 
  title = 'Tidak Ada Data',
  description = 'Belum ada data untuk ditampilkan',
  onAction,
  actionLabel = 'Muat Ulang'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 p-2 bg-muted rounded-full">
        <Database className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <h4 className="text-sm font-medium text-foreground mb-1">
        {title}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-4">
        {description}
      </p>
      
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          <RefreshCw className="h-3 w-3 mr-1" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};