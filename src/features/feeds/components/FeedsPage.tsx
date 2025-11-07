import React, { useMemo, useState, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, Database } from 'lucide-react';
import { useFeedsListQuery } from '../hooks/useFeedsListQuery';
import type { FeedRecord } from '../types';
import { UpsertFeedModal } from './UpsertFeedModal';
import { DeviceSelector } from '@/features/sensor-data/components/DeviceSelector';
import type { Device } from '@/features/sensor-data/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

function formatWIB(iso?: string | null, locale: string = 'en-US'): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const dayName = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'Asia/Jakarta' }).format(d);
  const dayNum = new Intl.DateTimeFormat(locale, { day: '2-digit', timeZone: 'Asia/Jakarta' }).format(d);
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'Asia/Jakarta' }).format(d);
  const year = new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(d);
  const hm = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(d);
  return `${dayName}, ${dayNum} ${monthName} ${year} ${hm} WIB`;
}

export const FeedsPage: React.FC = () => {
  const { t, i18n } = useTranslation('farming');
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const deviceId = selectedDevice?.device_id || '';
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Reset pagination when device changes
  useEffect(() => {
    setPageIndex(0);
  }, [deviceId]);

  const toWIBOffsetISO = (dtLocal?: string): string | undefined => {
    if (!dtLocal) return undefined;
    const base = dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
    return `${base}+07:00`;
  };

  const { data, isLoading } = useFeedsListQuery({
    deviceId,
    page: pageIndex + 1,
    limit: pageSize,
    startDate: toWIBOffsetISO(startDate),
    endDate: toWIBOffsetISO(endDate),
  });

  const [openUpsert, setOpenUpsert] = useState<{ open: boolean; mode: 'create' | 'edit'; feed?: FeedRecord | null }>({ open: false, mode: 'create', feed: null });
  // Details modal removed

  const columns = useMemo<ColumnDef<FeedRecord>[]>(() => [
    {
      accessorKey: 'fedAt',
      header: t('feeds.table.eventTime'),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{formatWIB(row.original.fedAt || row.original.createdAt, locale)}</span>
      ),
    },
    {
      accessorKey: 'feedName',
      header: t('feeds.table.feedName'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.feedName}</span>
          <span className="text-xs text-muted-foreground">{row.original.deviceId}</span>
        </div>
      ),
    },
    {
      accessorKey: 'feedType',
      header: t('feeds.table.type'),
      meta: { hideOnMobile: true },
      cell: ({ row }) => <span className="text-sm capitalize">{row.original.feedType}</span>,
    },
    {
      accessorKey: 'feedAmountKg',
      header: t('feeds.table.amount'),
      cell: ({ row }) => <span className="text-sm">{row.original.feedAmountKg.toFixed(2)}</span>,
      meta: { hideOnMobile: true },
    },
    {
      id: 'actions',
      header: t('common.table.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpenUpsert({ open: true, mode: 'edit', feed: row.original })}>
            {t('common.buttons.edit')}
          </Button>
        </div>
      ),
    },
  ], [locale, t]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t('feeds.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('feeds.description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenUpsert({ open: true, mode: 'create' })} disabled={!deviceId}>
            <Plus className="h-4 w-4 mr-2" />
            {t('feeds.buttons.add')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('feeds.cards.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>{t('common.filters.device')}</Label>
              <DeviceSelector selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{t('feeds.filters.start')}</Label>
              <Input type="datetime-local" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPageIndex(0); }} />
              <p className="text-xs text-muted-foreground">{t('common.filters.timezone')}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" />{t('feeds.filters.end')}</Label>
              <Input type="datetime-local" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPageIndex(0); }} />
              <p className="text-xs text-muted-foreground">{t('common.filters.timezone')}</p>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="w-full md:w-auto" onClick={() => { setStartDate(''); setEndDate(''); setPageIndex(0); }}>
                {t('feeds.buttons.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('feeds.cards.table')}</CardTitle>
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
        {(data?.items || []).map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{item.feedName}</div>
                <div className="text-xs text-muted-foreground truncate">{item.deviceId}</div>
                <div className="text-xs mt-1">{formatWIB(item.fedAt || item.createdAt, locale)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="capitalize">{item.feedType}</Badge>
                <Badge>{item.feedAmountKg.toFixed(2)} kg</Badge>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpenUpsert({ open: true, mode: 'edit', feed: item })}>
                {t('common.buttons.edit')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <UpsertFeedModal
        open={openUpsert.open}
        mode={openUpsert.mode}
        feed={openUpsert.feed}
        deviceId={deviceId}
        onClose={() => setOpenUpsert({ open: false, mode: 'create', feed: null })}
      />

      {null}
    </div>
  );
};
