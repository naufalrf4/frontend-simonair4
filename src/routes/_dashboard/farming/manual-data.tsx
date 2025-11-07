import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { DeviceSelector } from '@/features/sensor-data/components/DeviceSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Plus } from 'lucide-react'
import { ManualMeasurementsTable } from '@/features/manual-measurements/components/ManualMeasurementsTable'
import { ManualMeasurementFormModal } from '@/features/manual-measurements/components/ManualMeasurementFormModal'
import { ManualMeasurementCompareModal } from '@/features/manual-measurements/components/ManualMeasurementCompareModal'
import { useManualMeasurementsListQuery, useCreateManualMeasurementMutation, useUpdateManualMeasurementMutation, useCompareManualMeasurementMutation } from '@/features/manual-measurements/hooks/useManualMeasurements'
import type { ManualMeasurement } from '@/features/manual-measurements/types'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_dashboard/farming/manual-data')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation('farming')
  const [selectedDevice, setSelectedDevice] = useState<{ device_id: string; name: string } | null>(null)
  const deviceId = selectedDevice?.device_id || ''
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  // Filters: keep only device, start date, end date
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [includeComparison] = useState(false)

  // Reset pagination when device changes
  useEffect(() => {
    setPageIndex(0)
  }, [deviceId])

  const params = useMemo(() => {
    return {
      deviceId: selectedDevice?.device_id || '',
      page: pageIndex + 1,
      limit: pageSize,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: 'measurement_timestamp' as const,
      sortOrder: 'DESC' as const,
      // search removed from UI to match other pages
      search: undefined,
      includeComparison,
    };
  }, [selectedDevice, pageIndex, pageSize, startDate, endDate, includeComparison]);

  const { data, isLoading } = useManualMeasurementsListQuery(params as any)

  const createMutation = useCreateManualMeasurementMutation()
  const updateMutation = useUpdateManualMeasurementMutation()
  const compareMutation = useCompareManualMeasurementMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editItem, setEditItem] = useState<ManualMeasurement | null>(null)

  const [compareOpen, setCompareOpen] = useState(false)
  const [compareItem, setCompareItem] = useState<ManualMeasurement | null>(null)
  const [initialCompare, setInitialCompare] = useState<any>(null)

  const handleAdd = () => {
    setFormMode('create')
    setEditItem(null)
    setFormOpen(true)
  }

  const handleEdit = (m: ManualMeasurement) => {
    setFormMode('edit')
    setEditItem(m)
    setFormOpen(true)
  }

  const handleCompare = async (m: ManualMeasurement) => {
    setCompareItem(m)
    setInitialCompare(null)
    setCompareOpen(true)
  }

  const runCompare = async (timeWindow: number) => {
    if (!compareItem) {
      throw new Error('No measurement selected')
    }
    const id = (compareItem as any)?.id || (compareItem as any)?.manual_measurement_id || (compareItem as any)?.uuid
    if (!id) {
      throw new Error('Manual measurement is missing an ID')
    }
    const res = await compareMutation.mutateAsync({ id, body: { manual_measurement_id: id, time_window: timeWindow, include_accuracy: true } })
    return res
  }

  const handleSubmitForm = async ({ deviceId, data }: { deviceId: string; data: any }) => {
    if (formMode === 'create') {
      const created = await createMutation.mutateAsync({ deviceId, data })
      if (data.compare_with_sensor) {
        try {
          const res = await compareMutation.mutateAsync({ id: created.id, body: { manual_measurement_id: created.id, time_window: 5, include_accuracy: true } })
          setInitialCompare(res)
        } catch (e) {
          setInitialCompare(null)
        }
        setCompareItem(created)
        setCompareOpen(true)
      }
    } else if (formMode === 'edit' && editItem) {
      const updated = await updateMutation.mutateAsync({ id: editItem.id, data })
      if (data.compare_after_update) {
        try {
          const res = await compareMutation.mutateAsync({ id: updated.id, body: { manual_measurement_id: updated.id, time_window: 5, include_accuracy: true } })
          setInitialCompare(res)
        } catch (e) {
          setInitialCompare(null)
        }
        setCompareItem(updated)
        setCompareOpen(true)
      }
    }
  }

  const items = data?.items ?? []
  const pageCount = data?.pageCount ?? 1

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('manual.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('manual.description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAdd} disabled={!deviceId}>
            <Plus className="h-4 w-4 mr-2" />
            {t('manual.buttons.add')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('manual.cards.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>{t('common.filters.device')}</Label>
              <DeviceSelector selectedDevice={selectedDevice as any} onDeviceSelect={setSelectedDevice as any} />
            </div>
            <div className="space-y-2">
              <Label>{t('common.filters.startDate')}</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPageIndex(0) }} />
            </div>
            <div className="space-y-2">
              <Label>{t('common.filters.endDate')}</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPageIndex(0) }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('manual.cards.table')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualMeasurementsTable
            data={items}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={pageCount}
            isLoading={isLoading}
            onPageChange={setPageIndex}
            onEdit={handleEdit}
            onCompare={handleCompare}
          />
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {items.map((m) => (
          <Card key={m.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {m.measurement_timestamp ? new Date(m.measurement_timestamp).toLocaleString() : '-'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {m.notes || '-'}
                </div>
                <div className="text-xs mt-1 text-muted-foreground truncate">
                  {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                {m.temperature != null && <div>Temp: {m.temperature}°C</div>}
                {m.ph != null && <div>pH: {m.ph}</div>}
                {m.tds != null && <div>TDS: {m.tds}</div>}
                {m.do_level != null && <div>DO: {m.do_level}</div>}
                {m.comparison?.accuracy_assessment && (
                  <div className="mt-1 inline-flex px-2 py-1 rounded bg-secondary text-secondary-foreground">
                    {m.comparison.accuracy_assessment}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleCompare(m)}>Compare</Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(m)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedDevice && (
        <ManualMeasurementFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          mode={formMode}
          deviceId={selectedDevice.device_id}
          initial={editItem}
          onSubmit={handleSubmitForm}
        />
      )}

      <ManualMeasurementCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        measurement={compareItem || undefined}
        onCompare={runCompare}
        initialComparison={initialCompare}
      />
    </div>
  )
}
