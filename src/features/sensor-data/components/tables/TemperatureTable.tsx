import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { SensorTable, StatusIndicator, TimestampCell, ValueCell } from './SensorTable';
import { Thermometer } from 'lucide-react';
import type { SensorReading } from '../../types';

interface TemperatureTableProps {
  data: SensorReading[];
  isLoading?: boolean;
}

export const TemperatureTable: React.FC<TemperatureTableProps> = ({
  data,
  isLoading = false
}) => {
  // Temperature table columns (no data type filter needed)
  const columns: ColumnDef<SensorReading>[] = [
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
      accessorKey: 'temperature.value',
      header: 'Suhu',
      cell: ({ row }) => (
        <ValueCell 
          value={row.original.temperature.value} 
          unit="°C"
          precision={1}
          className="text-red-600 font-semibold"
        />
      ),
    },
    {
      accessorKey: 'temperature.status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusIndicator status={row.original.temperature.status} />
      ),
    }
  ];

  return (
    <SensorTable
      title="Temperature Sensor"
      icon={Thermometer}
      data={data}
      columns={columns}
      isLoading={isLoading}
      hasDataTypeFilter={false}
      color="red"
    />
  );
};