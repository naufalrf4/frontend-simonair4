import React, { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGrowthList, useCreateGrowth, useUpdateGrowth } from '../hooks/useGrowth';
import type { FishGrowth, GrowthListParams, ConditionIndicator } from '../types';
import { DeviceSelector } from '@/features/sensor-data/components/DeviceSelector';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function toDateInputValue(d?: Date): string {
  const date = d ?? new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatLongDate(iso?: string | null, locale: string = 'en-US'): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d);
    const day = new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(d);
    const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(d);
    const year = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(d);
    return `${weekday}, ${day} ${month} ${year}`;
  } catch {
    return '-';
  }
}

export const GrowthPage: React.FC = () => {
  const { t, i18n } = useTranslation('farming');
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
  const [device, setDevice] = useState<{ device_id: string; name?: string } | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  // simplified filters: device + date range only

  const params = useMemo<GrowthListParams>(() => ({
    deviceId: device?.device_id || '',
    page: pageIndex + 1,
    limit: pageSize,
    startDate: start || undefined,
    endDate: end || undefined,
  }), [device, pageIndex, pageSize, start, end]);

  const { data, isLoading } = useGrowthList(params);
  const createMutation = useCreateGrowth(params);
  const updateMutation = useUpdateGrowth(params);

  const [editing, setEditing] = useState<FishGrowth | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const columns = useMemo<ColumnDef<FishGrowth>[]>(() => [
    {
      accessorKey: 'measurement_date',
      header: t('growth.table.measuredAt'),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {formatLongDate(row.original.measurement_date, locale)}
        </span>
      ),
    },
    {
      accessorKey: 'weight_gram',
      header: t('growth.table.weight'),
      meta: { hideOnMobile: true },
      cell: ({ row }) => row.original.weight_gram ?? '-',
    },
    {
      accessorKey: 'length_cm',
      header: t('growth.table.length'),
      meta: { hideOnMobile: true },
      cell: ({ row }) => row.original.length_cm ?? '-',
    },
    {
      accessorKey: 'condition_indicator',
      header: t('growth.table.condition'),
      cell: ({ row }) => row.original.condition_indicator ?? '-',
    },
    {
      accessorKey: 'notes',
      header: t('growth.table.notes'),
      meta: { hideOnMobile: true },
      cell: ({ row }) => (
        <span className="truncate block max-w-[200px]" title={row.original.notes ?? ''}>
          {row.original.notes ?? '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.table.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditing(row.original); setOpenForm(true); }}>
            {t('common.buttons.edit')}
          </Button>
        </div>
      ),
    },
  ], [locale, t]);

  const [formState, setFormState] = useState<{ measurement_date: string; weight_gram: string; length_cm: string; notes: string; condition_indicator: ConditionIndicator }>({
    measurement_date: '', weight_gram: '', length_cm: '', notes: '', condition_indicator: 'Good'
  });

  useEffect(() => {
    if (openForm) {
      if (editing) {
        const d = editing.measurement_date ? new Date(editing.measurement_date) : new Date();
        const dateOnly = toDateInputValue(d);
        setFormState({
          measurement_date: dateOnly,
          weight_gram: editing.weight_gram != null ? String(editing.weight_gram) : '',
          length_cm: editing.length_cm != null ? String(editing.length_cm) : '',
          notes: editing.notes ?? '',
          condition_indicator: (editing.condition_indicator as ConditionIndicator) || 'Good',
        });
      } else {
        setFormState({ measurement_date: toDateInputValue(new Date()), weight_gram: '', length_cm: '', notes: '', condition_indicator: 'Good' });
      }
    }
  }, [openForm, editing]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!device) return;
    const dto: any = {};
    if (editing) {
      // For update: send only changed fields to avoid triggering validators unnecessarily
      const originalDate = (editing.measurement_date || '').slice(0, 10);
      if (formState.measurement_date && formState.measurement_date !== originalDate) {
        dto.measurement_date = formState.measurement_date;
      }
      const origW = editing.weight_gram != null ? String(editing.weight_gram) : '';
      const origL = editing.length_cm != null ? String(editing.length_cm) : '';
      if (formState.weight_gram !== '' && formState.weight_gram !== origW) dto.weight_gram = Number(formState.weight_gram);
      if (formState.length_cm !== '' && formState.length_cm !== origL) dto.length_cm = Number(formState.length_cm);
      if ((editing.notes ?? '') !== formState.notes) dto.notes = formState.notes;
      if ((editing.condition_indicator as any) !== formState.condition_indicator) dto.condition_indicator = formState.condition_indicator;
      await updateMutation.mutateAsync({ id: editing.id, dto });
      toast.success(t('growth.toasts.updated'));
    } else {
      // For create: send provided fields
      dto.measurement_date = formState.measurement_date;
      if (formState.weight_gram !== '') dto.weight_gram = Number(formState.weight_gram);
      if (formState.length_cm !== '') dto.length_cm = Number(formState.length_cm);
      if (formState.notes) dto.notes = formState.notes;
      dto.condition_indicator = formState.condition_indicator;
      await createMutation.mutateAsync({ deviceId: device.device_id, dto });
      toast.success(t('growth.toasts.created'));
    }
    setOpenForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('growth.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('growth.description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditing(null); setOpenForm(true); }} disabled={!device}>
            <Plus className="h-4 w-4 mr-2" />
            {t('growth.buttons.add')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('growth.cards.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 items-end">
            <div className="md:col-span-2">
              <Label>{t('common.filters.device')}</Label>
              <DeviceSelector selectedDevice={device as any} onDeviceSelect={(d: any) => { setDevice(d); setPageIndex(0); }} />
            </div>
            <div>
              <Label>{t('growth.filters.start')}</Label>
              <Input type="date" value={start} onChange={(e) => { setStart(e.target.value); setPageIndex(0); }} />
            </div>
            <div>
              <Label>{t('growth.filters.end')}</Label>
              <Input type="date" value={end} onChange={(e) => { setEnd(e.target.value); setPageIndex(0); }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('growth.cards.table')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            pagination={{
              pageIndex,
              pageSize,
              pageCount: data?.pageCount || 1,
              onPageChange: setPageIndex,
            }}
          />
        </CardContent>
      </Card>

      {/* Modal for create/edit (shadcn Dialog for consistency/animations) */}
      <Dialog open={openForm} onOpenChange={(o) => { if (!o) { setOpenForm(false); setEditing(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('growth.form.titleEdit') : t('growth.form.titleCreate')}</DialogTitle>
          </DialogHeader>
          <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmitForm}>
            <div>
              <Label>{t('growth.form.measurementDate')}</Label>
              <Input type="date" value={formState.measurement_date} onChange={(e) => setFormState((s) => ({ ...s, measurement_date: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('growth.form.weight')}</Label>
                <Input type="number" inputMode="decimal" value={formState.weight_gram} onChange={(e) => setFormState((s) => ({ ...s, weight_gram: e.target.value }))} />
              </div>
              <div>
                <Label>{t('growth.form.length')}</Label>
                <Input type="number" inputMode="decimal" value={formState.length_cm} onChange={(e) => setFormState((s) => ({ ...s, length_cm: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>{t('growth.form.notes')}</Label>
              <Input value={formState.notes} onChange={(e) => setFormState((s) => ({ ...s, notes: e.target.value }))} placeholder={t('growth.form.notes')} />
            </div>
            <div>
              <Label>{t('growth.form.condition')}</Label>
              <Select
                value={formState.condition_indicator}
                onValueChange={(v) => setFormState((s) => ({ ...s, condition_indicator: v as ConditionIndicator }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('growth.form.conditionPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">{t('growth.form.conditionOptions.excellent')}</SelectItem>
                  <SelectItem value="Good">{t('growth.form.conditionOptions.good')}</SelectItem>
                  <SelectItem value="Poor">{t('growth.form.conditionOptions.poor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">{t('growth.form.hint')}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); setEditing(null); }}>
                {t('growth.buttons.cancel')}
              </Button>
              <Button type="submit">
                {editing ? t('growth.buttons.update') : t('growth.buttons.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
