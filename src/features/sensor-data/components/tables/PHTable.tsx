import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { SensorTable, StatusIndicator, TimestampCell, ValueCell } from './SensorTable';
import { TestTube } from 'lucide-react';
import type { SensorReading, DataType } from '../../types';
// import { formatPHValue, formatVoltageValue, formatRawValue, formatCalibrationStatus } from '../../utils/sensorDataFormatters';

interface PHTableProps {
  data: SensorReading[];
  isLoading?: boolean;
  dataType?: DataType;
  onDataTypeChange?: (dataType: DataType) => void;
}

export const PHTable: React.FC<PHTableProps> = ({
  data,
  isLoading = false,
  dataType = 'calibrated',
  onDataTypeChange
}) => {
  // Base columns that are always shown
  const baseColumns: ColumnDef<SensorReading>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Waktu',
      cell: ({ row }) => (
        <TimestampCell 
          timestamp={row.original.timestamp} 
          time={row.original.time} 
        />
      ),
    },
    {
      accessorKey: 'ph.status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusIndicator status={row.original.ph.status} />
      ),
    }
  ];

  // Data type specific columns
  const getDataTypeColumns = (): ColumnDef<SensorReading>[] => {
    switch (dataType) {
      case 'raw':
        return [
          {
            accessorKey: 'ph.raw',
            header: 'Raw Value',
            cell: ({ row }) => (
              <ValueCell 
                value={row.original.ph.raw} 
                precision={0}
                className="text-blue-600"
              />
            ),
          }
        ];
      
      case 'voltage':
        return [
          {
            accessorKey: 'ph.voltage',
            header: 'Voltage',
            cell: ({ row }) => (
              <ValueCell 
                value={row.original.ph.voltage} 
                unit="V"
                precision={3}
                className="text-orange-600"
              />
            ),
          }
        ];
      
      case 'calibrated':
      default:
        return [
          {
            accessorKey: 'ph.calibrated',
            header: 'pH Level',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <ValueCell 
                  value={row.original.ph.calibrated} 
                  unit="pH"
                  precision={2}
                  className="text-green-600 font-semibold"
                />
                {!row.original.ph.calibrated_ok && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Belum dikalibrasi
                  </span>
                )}
              </div>
            ),
          }
        ];
    }
  };

  // Combine base columns with data type specific columns
  const columns: ColumnDef<SensorReading>[] = [
    ...baseColumns.slice(0, 1), // Timestamp column
    ...getDataTypeColumns(),    // Data type specific column
    ...baseColumns.slice(1),    // Status column
  ];

  return (
    <SensorTable
      title="pH Sensor"
      icon={TestTube}
      data={data}
      columns={columns}
      isLoading={isLoading}
      hasDataTypeFilter={true}
      dataType={dataType}
      onDataTypeChange={onDataTypeChange}
      color="blue"
    />
  );
};