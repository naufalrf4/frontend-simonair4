import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { ManualMeasurement } from '../types';
import { Button } from '@/components/ui/button';

interface ManualMeasurementsTableProps {
  data: ManualMeasurement[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  isLoading?: boolean;
  onPageChange: (pageIndex: number) => void;
  onEdit: (measurement: ManualMeasurement) => void;
  onCompare: (measurement: ManualMeasurement) => void;
}

export function ManualMeasurementsTable({
  data,
  pageIndex,
  pageSize,
  pageCount,
  isLoading,
  onPageChange,
  onEdit,
  onCompare,
}: ManualMeasurementsTableProps) {
  const columns = useMemo<ColumnDef<ManualMeasurement>[]>(
    () => [
      {
        accessorKey: 'measurement_timestamp',
        header: 'Timestamp',
        cell: ({ row }) => {
          const ts = row.original.measurement_timestamp;
          const d = ts ? new Date(ts) : null;
          return (
            <div className="min-w-[160px]">
              <div className="font-medium">{d ? d.toLocaleString() : '-'}</div>
              <div className="text-xs text-muted-foreground">{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : ''}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'temperature',
        header: 'Temp (°C)',
        cell: ({ row }) => (row.original.temperature ?? '-') as any,
      },
      {
        accessorKey: 'ph',
        header: 'pH',
        cell: ({ row }) => (row.original.ph ?? '-') as any,
      },
      {
        accessorKey: 'tds',
        header: 'TDS',
        cell: ({ row }) => (row.original.tds ?? '-') as any,
      },
      {
        accessorKey: 'do_level',
        header: 'DO',
        cell: ({ row }) => (row.original.do_level ?? '-') as any,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => (
          <div className="max-w-[240px] truncate" title={row.original.notes ?? ''}>
            {row.original.notes ?? '-'}
          </div>
        ),
      },
      {
        id: 'comparison',
        header: 'Compare',
        cell: ({ row }) => {
          const comp = row.original.comparison;
          if (!comp) return <span className="text-muted-foreground">-</span>;
          const label = comp.accuracy_assessment || (comp.sensor_data_available ? 'AVAILABLE' : 'UNAVAILABLE');
          const color =
            label === 'EXCELLENT'
              ? 'bg-green-100 text-green-700'
              : label === 'GOOD'
              ? 'bg-green-50 text-green-700'
              : label === 'FAIR'
              ? 'bg-yellow-50 text-yellow-700'
              : label === 'POOR' || label === 'VERY_POOR'
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-50 text-gray-700';
          return <span className={`inline-flex px-2 py-1 rounded text-xs ${color}`}>{label}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onCompare(row.original)}>
              Compare
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onCompare],
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[880px]">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          pagination={{ pageIndex, pageSize, pageCount, onPageChange }}
        />
      </div>
    </div>
  );
}
