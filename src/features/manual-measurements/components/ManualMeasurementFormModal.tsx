import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { CreateManualMeasurementDto, ManualMeasurement, UpdateManualMeasurementDto } from '../types';

interface ManualMeasurementFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  deviceId: string;
  initial?: ManualMeasurement | null;
  onSubmit: (payload: { deviceId: string; data: CreateManualMeasurementDto | UpdateManualMeasurementDto }) => Promise<void> | void;
}

export function ManualMeasurementFormModal({ open, onClose, mode, deviceId, initial, onSubmit }: ManualMeasurementFormModalProps) {
  const toWIBLocalInput = (dt: Date | string): string => {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return '';
    const wibMs = d.getTime() + 7 * 60 * 60 * 1000;
    const w = new Date(wibMs);
    const yyyy = w.getUTCFullYear();
    const mm = String(w.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(w.getUTCDate()).padStart(2, '0');
    const HH = String(w.getUTCHours()).padStart(2, '0');
    const MM = String(w.getUTCMinutes()).padStart(2, '0');
    const SS = String(w.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}`;
  };

  const toWIBOffsetISO = (dtLocal?: string): string | undefined => {
    if (!dtLocal) return undefined;
    const base = dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
    return `${base}+07:00`;
  };
  const [timestamp, setTimestamp] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [ph, setPh] = useState<string>('');
  const [tds, setTds] = useState<string>('');
  const [doLevel, setDoLevel] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [compare, setCompare] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initial) {
        setTimestamp(toWIBLocalInput(initial.measurement_timestamp));
        setTemperature(initial.temperature != null ? String(initial.temperature) : '');
        setPh(initial.ph != null ? String(initial.ph) : '');
        setTds(initial.tds != null ? String(initial.tds) : '');
        setDoLevel(initial.do_level != null ? String(initial.do_level) : '');
        setNotes(initial.notes ?? '');
        setCompare(false);
      } else {
        setTimestamp(toWIBLocalInput(new Date()));
        setTemperature('');
        setPh('');
        setTds('');
        setDoLevel('');
        setNotes('');
        setCompare(true);
      }
    }
  }, [open, mode, initial]);

  const isValid = useMemo(() => {
    const hasOneValue = [temperature, ph, tds, doLevel].some((v) => v !== '' && !isNaN(Number(v)));
    return Boolean(timestamp) && hasOneValue;
  }, [timestamp, temperature, ph, tds, doLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      if (mode === 'create') {
        const payload: CreateManualMeasurementDto = {
          measurement_timestamp: toWIBOffsetISO(timestamp)!,
          temperature: temperature !== '' ? Number(temperature) : undefined,
          ph: ph !== '' ? Number(ph) : undefined,
          tds: tds !== '' ? Number(tds) : undefined,
          do_level: doLevel !== '' ? Number(doLevel) : undefined,
          notes: notes || undefined,
          compare_with_sensor: compare,
        };
        await onSubmit({ deviceId, data: payload });
      } else if (mode === 'edit' && initial) {
        const payload: UpdateManualMeasurementDto = {
          measurement_timestamp: timestamp ? toWIBOffsetISO(timestamp) : undefined,
          temperature: temperature !== '' ? Number(temperature) : undefined,
          ph: ph !== '' ? Number(ph) : undefined,
          tds: tds !== '' ? Number(tds) : undefined,
          do_level: doLevel !== '' ? Number(doLevel) : undefined,
          notes: notes || undefined,
          compare_after_update: compare,
        };
        await onSubmit({ deviceId, data: payload });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-2xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Manual Measurement' : 'Edit Manual Measurement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timestamp">Timestamp</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input id="temperature" type="number" step="0.01" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ph">pH</Label>
              <Input id="ph" type="number" step="0.01" value={ph} onChange={(e) => setPh(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tds">TDS</Label>
              <Input id="tds" type="number" step="0.1" value={tds} onChange={(e) => setTds(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="do_level">DO</Label>
              <Input id="do_level" type="number" step="0.01" value={doLevel} onChange={(e) => setDoLevel(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="compare" checked={compare} onCheckedChange={setCompare} />
              <Label htmlFor="compare">
                {mode === 'create' ? 'Compare with sensor after save' : 'Compare after update'}
              </Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || submitting}>
                {submitting ? 'Saving...' : mode === 'create' ? 'Save' : 'Update'}
              </Button>
            </div>
          </div>

          {!isValid && (
            <p className="text-xs text-red-600">
              Please provide timestamp and at least one value (temperature, pH, TDS, or DO).
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
