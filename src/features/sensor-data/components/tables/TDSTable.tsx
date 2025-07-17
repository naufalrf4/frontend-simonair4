import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { SensorTable, StatusIndicator, TimestampCell, ValueCell } from './SensorTable';
import { Droplets } from 'lucide-react';
import type { SensorReading, DataType } from '../../types';

interface TDSTableProps {
  data: SensorReading[];
  isLoading?: boolean;
  dataType?: DataType;
  onDataTypeChange?: (dataType: DataType) => void;
}

export const TDSTable: React.FC<TDSTableProps> = ({
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
      accessorKey: 'tds.status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusIndicator status={row.original.tds.status} />
      ),
    }
  ];

  // Data type specific columns
  const getDataTypeColumns = (): ColumnDef<SensorReading>[] => {
    switch (dataType) {
      case 'raw':
        return [
          {
            accessorKey: 'tds.raw',
            header: 'Raw Value',
            cell: ({ row }) => (
              <ValueCell 
                value={row.original.tds.raw} 
                precision={0}
                className="text-purple-600"
              />
            ),
          }
        ];
      
      case 'voltage':
        return [
          {
            accessorKey: 'tds.voltage',
            header: 'Voltage',
            cell: ({ row }) => (
              <ValueCell 
                value={row.original.tds.voltage} 
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
            accessorKey: 'tds.calibrated',
            header: 'TDS Level',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <ValueCell 
                  value={row.original.tds.calibrated} 
                  unit="ppm"
                  precision={1}
                  className="text-purple-600 font-semibold"
                />
                {!row.original.tds.calibrated_ok && (
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
      title="TDS Sensor"
      icon={Droplets}
      data={data}
      columns={columns}
      isLoading={isLoading}
      hasDataTypeFilter={true}
      dataType={dataType}
      onDataTypeChange={onDataTypeChange}
      color="purple"
    />
  );
};