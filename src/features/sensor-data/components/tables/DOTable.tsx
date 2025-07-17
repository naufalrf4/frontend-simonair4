import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { SensorTable, StatusIndicator, TimestampCell, ValueCell } from './SensorTable';
import { Wind } from 'lucide-react';
import type { SensorReading, DataType } from '../../types';

interface DOTableProps {
  data: SensorReading[];
  isLoading?: boolean;
  dataType?: DataType;
  onDataTypeChange?: (dataType: DataType) => void;
}

export const DOTable: React.FC<DOTableProps> = ({
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
      accessorKey: 'do_level.status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusIndicator status={row.original.do_level.status} />
      ),
    }
  ];

  // Data type specific columns
  const getDataTypeColumns = (): ColumnDef<SensorReading>[] => {
    switch (dataType) {
      case 'raw':
        return [
          {
            accessorKey: 'do_level.raw',
            header: 'Raw Value',
            cell: ({ row }) => (
              <ValueCell 
                value={row.original.do_level.raw} 
                precision={0}
                className="text-cyan-600"
              />
            ),
          }
        ];
      
      case 'voltage':
        return [
          {
            accessorKey: 'do_level.voltage',
            header: 'Voltage',
            cell: ({ row }) => (
              <ValueCell 
                value={row.original.do_level.voltage} 
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
            accessorKey: 'do_level.calibrated',
            header: 'DO Level',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <ValueCell 
                  value={row.original.do_level.calibrated} 
                  unit="mg/L"
                  precision={2}
                  className="text-cyan-600 font-semibold"
                />
                {!row.original.do_level.calibrated_ok && (
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
      title="DO Level Sensor"
      icon={Wind}
      data={data}
      columns={columns}
      isLoading={isLoading}
      hasDataTypeFilter={true}
      dataType={dataType}
      onDataTypeChange={onDataTypeChange}
      color="cyan"
    />
  );
};