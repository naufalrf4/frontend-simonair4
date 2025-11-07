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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('farming');
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
        toast.success(t('feeds.toasts.created'));
      } else if (mode === 'edit' && feed) {
        await updateMutation.mutateAsync({ id: feed.id, data: {
          feedName: values.feedName,
          feedType: values.feedType,
          feedAmountKg: Number(values.feedAmountKg),
          // @ts-ignore - extend shape to include fedAt
          fedAt: fedAtIso,
        }});
        toast.success(t('feeds.toasts.updated'));
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
            {mode === 'create' ? t('feeds.modal.createTitle') : t('feeds.modal.editTitle')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(createMutation.error || updateMutation.error) && (
            <Alert variant="destructive">
              <AlertDescription>
                {(createMutation.error as any)?.message || (updateMutation.error as any)?.message || t('feeds.modal.errorMessage')}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feedName">{t('feeds.modal.fields.feedName')}</Label>
              <Input
                id="feedName"
                placeholder="e.g. Premium Pellets"
                {...register('feedName', {
                  required: t('feeds.modal.errors.feedName'),
                  minLength: { value: 2, message: t('feeds.modal.errors.feedNameLength') },
                })}
              />
              {errors.feedName && <p className="text-xs text-red-500">{errors.feedName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('feeds.modal.fields.feedType')}</Label>
              <Select defaultValue={feed?.feedType || 'natural'} onValueChange={(v) => setValue('feedType', v as FeedType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('feeds.modal.fields.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">{t('feeds.modal.options.natural')}</SelectItem>
                  <SelectItem value="artificial">{t('feeds.modal.options.artificial')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedAmountKg">{t('feeds.modal.fields.feedAmount')}</Label>
              <Input
                id="feedAmountKg"
                type="number"
                step="0.01"
                min="0"
                {...register('feedAmountKg', {
                  required: t('feeds.modal.errors.amount'),
                  min: { value: 0, message: t('feeds.modal.errors.amountMin') },
                })}
              />
              {errors.feedAmountKg && <p className="text-xs text-red-500">{errors.feedAmountKg.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fedAt">{t('feeds.modal.fields.eventTime')}</Label>
              <Input id="fedAt" type="datetime-local" {...register('fedAt')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {t('feeds.modal.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {mode === 'create' ? t('feeds.modal.buttons.create') : t('feeds.modal.buttons.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
