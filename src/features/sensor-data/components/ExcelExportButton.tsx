import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  exportToExcel,
  exportSensorTypeToExcel,
  type ExcelExportConfig,
} from '../utils/excelExport';
import type { SensorReading, Device, SensorType } from '../types';

interface ExcelExportButtonProps {
  data: SensorReading[];
  device: Device | null;
  dateRange?: { from: Date; to: Date };
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  data,
  device,
  dateRange,
  className = '',
  variant = 'default',
  size = 'default',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExcelExportConfig>({
    includeRawData: true,
    includeVoltageData: true,
    includeCalibratedData: true,
    dateRange,
  });
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Check if data is available
  const hasData = data && data.length > 0;
  const deviceName = device?.name || device?.device_id || 'Tidak ada perangkat';

  /**
   * Handle export with loading state and error handling
   */
  const handleExport = async (exportFunction: () => Promise<void>, successMessage: string) => {
    if (!hasData) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    setIsExporting(true);
    try {
      await exportFunction();
      toast.success(successMessage);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor data ke Excel');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export all sensor data
   */
  const handleExportAll = () => {
    handleExport(
      () => exportToExcel(data, device, { ...exportConfig, dateRange }),
      'Data sensor berhasil diekspor ke Excel',
    );
  };

  /**
   * Export specific sensor type
   */
  const handleExportSensorType = (sensorType: SensorType) => {
    const sensorNames = {
      ph: 'pH',
      tds: 'TDS',
      do_level: 'DO Level',
      temperature: 'Temperature',
    };

    handleExport(
      () => exportSensorTypeToExcel(data, sensorType, device, { ...exportConfig, dateRange }),
      `Data sensor ${sensorNames[sensorType]} berhasil diekspor ke Excel`,
    );
  };

  /**
   * Update export configuration
   */
  const updateConfig = (key: keyof ExcelExportConfig, value: boolean) => {
    setExportConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Export with custom configuration
   */
  const handleExportWithConfig = () => {
    setIsConfigDialogOpen(false);
    handleExportAll();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Main export button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={!hasData || isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Mengekspor...' : 'Ekspor Excel'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Perangkat: {deviceName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleExportAll} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Semua Data Sensor
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleExportSensorType('ph')} disabled={isExporting}>
            <div className="h-3 w-3 mr-2 rounded bg-blue-500" />
            Data pH Sensor
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleExportSensorType('tds')} disabled={isExporting}>
            <div className="h-3 w-3 mr-2 rounded bg-purple-500" />
            Data TDS Sensor
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleExportSensorType('do_level')}
            disabled={isExporting}
          >
            <div className="h-3 w-3 mr-2 rounded bg-cyan-500" />
            Data DO Level Sensor
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleExportSensorType('temperature')}
            disabled={isExporting}
          >
            <div className="h-3 w-3 mr-2 rounded bg-red-500" />
            Data Temperature Sensor
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Configuration button */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size={size} disabled={!hasData || isExporting}>
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfigurasi Ekspor Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Pilih data yang ingin disertakan dalam ekspor:
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRaw"
                checked={exportConfig.includeRawData}
                onCheckedChange={(checked) => updateConfig('includeRawData', checked as boolean)}
              />
              <Label htmlFor="includeRaw" className="text-sm">
                Sertakan data Raw Value
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeVoltage"
                checked={exportConfig.includeVoltageData}
                onCheckedChange={(checked) =>
                  updateConfig('includeVoltageData', checked as boolean)
                }
              />
              <Label htmlFor="includeVoltage" className="text-sm"></Label> Sertakan data Voltage
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCalibrated"
                  checked={exportConfig.includeCalibratedData}
                  onCheckedChange={(checked) =>
                    updateConfig('includeCalibratedData', checked as boolean)
                  }
                />
                <Label htmlFor="includeCalibrated" className="text-sm">
                  Sertakan data Calibrated
                </Label>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Data Temperature selalu disertakan karena hanya memiliki satu nilai.
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleExportWithConfig} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Ekspor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
