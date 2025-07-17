import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Activity } from 'lucide-react';
import type { SensorReading, DataType, SensorStatus } from '../../types';
import { formatTableDate, formatSensorStatus, formatSensorValue } from '../../utils/sensorDataFormatters';

interface SensorTableProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: SensorReading[];
  columns: ColumnDef<SensorReading>[];
  isLoading?: boolean;
  hasDataTypeFilter?: boolean;
  dataType?: DataType;
  onDataTypeChange?: (dataType: DataType) => void;
  color?: string;
}

// Status indicator component
export const StatusIndicator: React.FC<{ status: SensorStatus }> = ({ status }) => {
  const statusFormat = formatSensorStatus(status);
  
  return (
    <Badge 
      variant={status === 'GOOD' ? 'default' : 'destructive'}
      className={`text-xs ${statusFormat.bgColor} ${statusFormat.color} hover:opacity-80`}
    >
      <Activity className="w-3 h-3 mr-1" />
      {statusFormat.text}
    </Badge>
  );
};

// Timestamp formatter component
export const TimestampCell: React.FC<{ timestamp: string; time: string }> = ({ timestamp, time }) => {
  const formatted = formatTableDate(timestamp || time);

  return (
    <div className="flex flex-col space-y-1 min-w-[120px]">
      <div className="text-sm font-medium">{formatted.date}</div>
      <div className="text-xs text-muted-foreground flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        {formatted.time}
      </div>
    </div>
  );
};

// Value formatter component
export const ValueCell: React.FC<{ 
  value: number; 
  unit?: string; 
  precision?: number;
  className?: string;
}> = ({ value, unit = '', precision = 2, className = '' }) => {
  const formattedValue = formatSensorValue(value, { 
    precision, 
    unit, 
    showUnit: !!unit 
  });

  return (
    <div className={`text-sm font-mono ${className}`}>
      {formattedValue}
    </div>
  );
};

export const SensorTable: React.FC<SensorTableProps> = ({
  title,
  icon: Icon,
  data,
  columns,
  isLoading = false,
  hasDataTypeFilter = false,
  dataType,
  onDataTypeChange,
  color = 'blue'
}) => {
  // Define color classes to avoid Tailwind purging
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  };

  const currentColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className={`p-2 rounded-lg ${currentColor.bg}`}>
              <Icon className={`h-5 w-5 ${currentColor.text}`} />
            </div>
            {title}
          </CardTitle>
          
          {hasDataTypeFilter && onDataTypeChange && (
            <Select value={dataType} onValueChange={onDataTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih tipe data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">Raw</SelectItem>
                <SelectItem value="voltage">Voltage</SelectItem>
                <SelectItem value="calibrated">Calibrated</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          pagination={{
            pageIndex: 0,
            pageSize: 10,
            pageCount: Math.ceil(data.length / 10),
            onPageChange: () => {} // Will be handled by parent component
          }}
        />
      </CardContent>
    </Card>
  );
};