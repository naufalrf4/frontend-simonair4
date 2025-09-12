import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { useCreateFeedMutation, useUpdateFeedMutation } from '../hooks/useFeedMutations';
import type { FeedRecord, FeedType } from '../types';

type Mode = 'create' | 'edit';

export interface UpsertFeedModalProps {
  open: boolean;
  mode: Mode;
  deviceId: string;
  feed?: FeedRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  feedName: string;
  feedType: FeedType;
  feedAmountKg: number;
  fedAt: string; // datetime-local
}

export const UpsertFeedModal: React.FC<UpsertFeedModalProps> = ({ open, mode, deviceId, feed, onClose, onSuccess }) => {
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
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
  };

  const nowWIBLocalInput = (): string => toWIBLocalInput(new Date());

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      feedName: '',
      feedType: 'natural',
      feedAmountKg: 0,
      fedAt: nowWIBLocalInput(),
    },
  });

  const createMutation = useCreateFeedMutation({ deviceId });
  const updateMutation = useUpdateFeedMutation({ deviceId });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && feed) {
        reset({
          feedName: feed.feedName,
          feedType: feed.feedType,
          feedAmountKg: feed.feedAmountKg,
          fedAt: toWIBLocalInput(feed.fedAt || feed.createdAt || new Date()),
        });
      } else {
        reset({ feedName: '', feedType: 'natural', feedAmountKg: 0, fedAt: nowWIBLocalInput() });
      }
    }
  }, [open, mode, feed, reset]);

  const toWIBOffsetISO = (dtLocal?: string): string | undefined => {
    if (!dtLocal) return undefined;
    // datetime-local returns 'YYYY-MM-DDTHH:mm' (no TZ). Interpret as WIB (+07:00)
    const base = dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
    return `${base}+07:00`;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const fedAtIso = toWIBOffsetISO(values.fedAt);
      if (mode === 'create') {
        await createMutation.mutateAsync({
          deviceId,
          feedName: values.feedName,
          feedType: values.feedType,
          feedAmountKg: Number(values.feedAmountKg),
        });
        toast.success('Feed record created');
      } else if (mode === 'edit' && feed) {
        await updateMutation.mutateAsync({ id: feed.id, data: {
          feedName: values.feedName,
          feedType: values.feedType,
          feedAmountKg: Number(values.feedAmountKg),
          // @ts-ignore - extend shape to include fedAt
          fedAt: fedAtIso,
        }});
        toast.success('Feed record updated');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      // errors shown via mutation state
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Feed Record' : 'Edit Feed Record'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(createMutation.error || updateMutation.error) && (
            <Alert variant="destructive">
              <AlertDescription>
                {(createMutation.error as any)?.message || (updateMutation.error as any)?.message || 'Failed to save feed record.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feedName">Feed Name</Label>
              <Input id="feedName" placeholder="e.g. Premium Pellets" {...register('feedName', { required: 'Feed name is required', minLength: { value: 2, message: 'Min length 2' } })} />
              {errors.feedName && <p className="text-xs text-red-500">{errors.feedName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Feed Type</Label>
              <Select defaultValue={feed?.feedType || 'natural'} onValueChange={(v) => setValue('feedType', v as FeedType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="artificial">Artificial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedAmountKg">Amount (kg)</Label>
              <Input id="feedAmountKg" type="number" step="0.01" min="0" {...register('feedAmountKg', { required: 'Amount is required', min: { value: 0, message: 'Must be >= 0' } })} />
              {errors.feedAmountKg && <p className="text-xs text-red-500">{errors.feedAmountKg.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fedAt">Event Time</Label>
              <Input id="fedAt" type="datetime-local" {...register('fedAt')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
