import React, { useMemo, useState, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Plus, Droplets } from 'lucide-react'
import { DeviceSelector } from '@/features/sensor-data/components/DeviceSelector'
import type { Device } from '@/features/sensor-data/types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useWaterChangesListQuery } from '../hooks/useWaterChangesListQuery'
import type { WaterChangeRecord } from '../types'
import { UpsertWaterChangeModal } from './UpsertWaterChangeModal'
import { WaterChangesService } from '../services/waterChangesService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

function formatWIB(iso?: string | null, locale: string = 'en-US'): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  const dayName = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'Asia/Jakarta' }).format(d)
  const dayNum = new Intl.DateTimeFormat(locale, { day: '2-digit', timeZone: 'Asia/Jakarta' }).format(d)
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'Asia/Jakarta' }).format(d)
  const year = new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d)
  const hm = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(d)
  return `${dayName}, ${dayNum} ${monthName} ${year} ${hm} WIB`
}

export const WaterChangesPage: React.FC = () => {
  const { t, i18n } = useTranslation('farming')
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US'
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const deviceId = selectedDevice?.device_id || ''
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    setPageIndex(0)
  }, [deviceId])

  const toWIBOffsetISO = (dtLocal?: string): string | undefined => {
    if (!dtLocal) return undefined
    const base = dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal
    return `${base}+07:00`
  }

  const { data, isLoading, refetch } = useWaterChangesListQuery({
    deviceId,
    page: pageIndex + 1,
    limit: pageSize,
    startDate: toWIBOffsetISO(startDate),
    endDate: toWIBOffsetISO(endDate),
  })

  const [upsertState, setUpsertState] = useState<{ open: boolean; mode: 'create' | 'edit'; item?: WaterChangeRecord | null }>({ open: false, mode: 'create', item: null })

  const handleDelete = async (item: WaterChangeRecord) => {
    if (!confirm(t('waterChanges.confirm.delete'))) return
    try {
      await WaterChangesService.remove(item.id)
      toast.success(t('waterChanges.toasts.deleted'))
      refetch()
    } catch (e: any) {
      toast.error(e?.message || t('waterChanges.toasts.deleteFailed'))
    }
  }

  const columns = useMemo<ColumnDef<WaterChangeRecord>[]>(() => [
    {
      header: t('waterChanges.table.changedAt'),
      accessorKey: 'changedAt',
      cell: ({ row }) => <span className="text-sm">{formatWIB(row.original.changedAt, locale)}</span>,
    },
    {
      header: t('waterChanges.table.device'),
      accessorKey: 'deviceId',
      meta: { hideOnMobile: true },
    },
    {
      header: t('waterChanges.table.type'),
      accessorKey: 'changeType',
      cell: ({ row }) => <Badge variant="secondary" className="capitalize">{t(`waterChanges.modal.options.${row.original.changeType}`)}</Badge>,
    },
    {
      header: t('waterChanges.table.reason'),
      accessorKey: 'reason',
      cell: ({ row }) => <span className="capitalize">{t(`waterChanges.modal.options.${row.original.reason}`)}</span>,
    },
    {
      header: t('waterChanges.table.notes'),
      accessorKey: 'notes',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.notes || '-'}</span>,
      meta: { hideOnMobile: true },
    },
    {
      header: t('common.table.actions'),
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setUpsertState({ open: true, mode: 'edit', item: row.original })}>
            {t('common.buttons.edit')}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>
            {t('common.buttons.delete')}
          </Button>
        </div>
      ),
    },
  ], [handleDelete, locale, t])

  return (
    <div className="space-y-4">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{t('waterChanges.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('waterChanges.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setUpsertState({ open: true, mode: 'create' })} disabled={!deviceId}>
              <Plus className="h-4 w-4 mr-2" />
              {t('waterChanges.buttons.log')}
            </Button>
          </div>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('waterChanges.cards.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>{t('common.filters.device')}</Label>
              <DeviceSelector selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{t('common.filters.start')}</Label>
              <Input type="datetime-local" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPageIndex(0) }} />
              <p className="text-xs text-muted-foreground">{t('common.filters.timezone')}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{t('common.filters.end')}</Label>
              <Input type="datetime-local" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPageIndex(0) }} />
              <p className="text-xs text-muted-foreground">{t('common.filters.timezone')}</p>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="w-full md:w-auto" onClick={() => { setStartDate(''); setEndDate(''); setPageIndex(0) }}>
                {t('waterChanges.buttons.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('waterChanges.cards.table')}</CardTitle>
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
                <div className="text-sm font-semibold truncate">{it.deviceId}</div>
                <div className="text-xs text-muted-foreground truncate">{it.changeType} • {it.reason.replace('_', ' ')}</div>
                <div className="text-xs mt-1">{formatWIB(it.changedAt, locale)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="capitalize">{it.changeType}</Badge>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setUpsertState({ open: true, mode: 'edit', item: it })}>
                {t('common.buttons.edit')}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(it)}>
                {t('common.buttons.delete')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <UpsertWaterChangeModal
        open={upsertState.open}
        mode={upsertState.mode}
        deviceId={deviceId}
        item={upsertState.item || undefined}
        onClose={() => setUpsertState({ open: false, mode: 'create' })}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
