import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ManualMeasurement, MeasurementComparisonResponse } from '../types';
import { useTranslation } from 'react-i18next';

interface ManualMeasurementCompareModalProps {
  open: boolean;
  onClose: () => void;
  measurement?: ManualMeasurement | null;
  onCompare: (timeWindow: number) => Promise<MeasurementComparisonResponse>;
  initialComparison?: MeasurementComparisonResponse | null;
}

export function ManualMeasurementCompareModal({ open, onClose, measurement, onCompare, initialComparison }: ManualMeasurementCompareModalProps) {
  const { t, i18n } = useTranslation('farming');
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
  const [timeWindow, setTimeWindow] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MeasurementComparisonResponse | null>(initialComparison ?? null);

  useEffect(() => {
    if (open) {
      setResult(initialComparison ?? null);
      setTimeWindow(5);
    }
  }, [open, initialComparison]);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await onCompare(timeWindow);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-3xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('manual.compare.title')}</DialogTitle>
          <DialogDescription>
            {t('manual.compare.description', {
              device: measurement?.device_id ?? '-',
              time: measurement ? new Date(measurement.measurement_timestamp).toLocaleString(locale) : '-',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium">{t('manual.compare.timeWindow')}</label>
              <Input type="number" min={1} max={60} value={timeWindow} onChange={(e) => setTimeWindow(Number(e.target.value))} />
            </div>
            <Button onClick={handleCompare} disabled={loading || !measurement?.id}>
              {loading ? t('common.buttons.compare') : t('manual.compare.run')}
            </Button>
          </div>

          {!result && (
            <p className="text-sm text-muted-foreground">{t('manual.compare.empty')}</p>
          )}

          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <div className="font-medium mb-2">{t('manual.compare.manualValues')}</div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">{t('manual.table.temperature')}</dt>
                  <dd>{result.manual_values.temperature ?? '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.ph')}</dt>
                  <dd>{result.manual_values.ph ?? '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.tds')}</dt>
                  <dd>{result.manual_values.tds ?? '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.do')}</dt>
                  <dd>{result.manual_values.do_level ?? '-'}</dd>
                </dl>
              </div>
              <div className="border rounded p-3">
                <div className="font-medium mb-2">{t('manual.compare.sensorValues')}</div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">{t('common.statuses.available', { defaultValue: 'Available' })}</dt>
                  <dd>{result.sensor_data_available ? t('common.statuses.yes') : t('common.statuses.no')}</dd>
                  <dt className="text-muted-foreground">{t('manual.form.fields.timestamp')}</dt>
                  <dd>{result.sensor_timestamp ? new Date(result.sensor_timestamp).toLocaleString(locale) : '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.temperature')}</dt>
                  <dd>{result.sensor_values?.temperature ?? '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.ph')}</dt>
                  <dd>{result.sensor_values?.ph ?? '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.tds')}</dt>
                  <dd>{result.sensor_values?.tds ?? '-'}</dd>
                  <dt className="text-muted-foreground">{t('manual.table.do')}</dt>
                  <dd>{result.sensor_values?.do_level ?? '-'}</dd>
                </dl>
              </div>

              <div className="border rounded p-3 sm:col-span-2">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-sm">{t('manual.compare.accuracy')}:</span>
                  <span className="text-sm font-medium">
                    {result.accuracy_assessment}
                  </span>
                  {typeof result.comparison_quality_score === 'number' && (
                    <span className="text-xs text-muted-foreground">Score {result.comparison_quality_score}</span>
                  )}
                  {typeof result.time_difference_minutes === 'number' && (
                    <span className="text-xs text-muted-foreground">Δt {result.time_difference_minutes} min</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">{t('manual.compare.delta.temperature')}</div>
                    <div>{result.absolute_differences?.temperature ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t('manual.compare.delta.ph')}</div>
                    <div>{result.absolute_differences?.ph ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t('manual.compare.delta.tds')}</div>
                    <div>{result.absolute_differences?.tds ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t('manual.compare.delta.do')}</div>
                    <div>{result.absolute_differences?.do_level ?? '-'}</div>
                  </div>
                </div>
                {result.summary && (
                  <p className="text-sm mt-3">{result.summary}</p>
                )}
                {result.flags && result.flags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-muted-foreground mr-2">
                      {t('manual.compare.flags')}:
                    </span>
                    {result.flags.map((f, i) => (
                      <span key={i} className="text-xs bg-accent px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
