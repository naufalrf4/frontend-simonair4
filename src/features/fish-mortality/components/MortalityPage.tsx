import React, { useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Plus, AlertTriangle } from 'lucide-react'
import { DeviceSelector } from '@/features/sensor-data/components/DeviceSelector'
import type { Device } from '@/features/sensor-data/types'
import { Separator } from '@/components/ui/separator'
import type { MortalityRecord } from '../types'
import { useMortalityListQuery } from '../hooks/useMortalityListQuery'
import { UpsertMortalityModal } from './UpsertMortalityModal'
import { MortalityService } from '../services/mortalityService'
import { toast } from 'sonner'

export const MortalityPage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const deviceId = selectedDevice?.device_id || ''
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [cause, setCause] = useState('')

  useEffect(() => { setPageIndex(0) }, [deviceId])

  const { data, isLoading, refetch } = useMortalityListQuery({
    deviceId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    cause: cause || undefined,
    limit: pageSize,
    offset: pageIndex * pageSize,
    sortBy: 'event_date',
    sortOrder: 'DESC',
  })

  const [upsert, setUpsert] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: MortalityRecord | null }>({ open: false, mode: 'create', item: null })

  const handleDelete = async (item: MortalityRecord) => {
    if (!confirm('Delete this mortality record?')) return
    try {
      await MortalityService.remove(item.id)
      toast.success('Mortality record deleted')
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete record')
    }
  }

  const columns = useMemo<ColumnDef<MortalityRecord>[]>(() => [
    {
      header: 'Event Date',
      accessorKey: 'eventDate',
      cell: ({ row }) => <span className="text-sm">{row.original.eventDate}</span>,
    },
    { header: 'Dead', accessorKey: 'deadCount' },
    { header: 'Cause', accessorKey: 'cause', cell: ({ row }) => <span className="capitalize">{row.original.cause || '-'}</span> },
    { header: 'Description', accessorKey: 'description', meta: { hideOnMobile: true }, cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description || '-'}</span> },
    { header: 'Reported By', accessorKey: 'reportedByName', meta: { hideOnMobile: true }, cell: ({ row }) => <span className="text-sm">{row.original.reportedByName || '-'}</span> },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setUpsert({ open: true, mode: 'edit', item: row.original })}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>Delete</Button>
        </div>
      ),
    },
  ], [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Fish Mortality</h1>
            <p className="text-sm text-muted-foreground">Log and review fish death events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setUpsert({ open: true, mode: 'create' })} disabled={!deviceId}>
            <Plus className="h-4 w-4 mr-2" />
            Log Mortality
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>Device</Label>
              <DeviceSelector selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />Start</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPageIndex(0) }} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />End</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPageIndex(0) }} />
            </div>
            <div className="space-y-2">
              <Label>Cause</Label>
              <Input placeholder="penyakit / kualitas air" value={cause} onChange={(e) => { setCause(e.target.value); setPageIndex(0) }} />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="w-full md:w-auto" onClick={() => { setStartDate(''); setEndDate(''); setCause(''); setPageIndex(0) }}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Mortality Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            pagination={{
              pageIndex,
              pageSize,
              pageCount: data ? Math.max(1, Math.ceil((data.total || 0) / pageSize)) : 1,
              onPageChange: setPageIndex,
            }}
          />
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {(data?.items || []).map((it) => (
          <Card key={it.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{it.eventDate}</div>
                <div className="text-xs text-muted-foreground truncate">{it.cause || '-'}</div>
                <div className="text-xs mt-1">{it.description || '-'}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm font-semibold">{it.deadCount}</div>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setUpsert({ open: true, mode: 'edit', item: it })}>Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(it)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <UpsertMortalityModal
        open={upsert.open}
        mode={upsert.mode}
        deviceId={deviceId}
        item={upsert.item || undefined}
        onClose={() => setUpsert({ open: false, mode: 'create' })}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

