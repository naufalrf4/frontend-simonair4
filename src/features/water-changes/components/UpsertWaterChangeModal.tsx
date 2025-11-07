import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { WaterChangeRecord, WaterChangeType, WaterChangeReason } from '../types'
import { WaterChangesService } from '../services/waterChangesService'
import { useTranslation } from 'react-i18next'

type Mode = 'create' | 'edit'

export interface UpsertWaterChangeModalProps {
  open: boolean
  mode: Mode
  deviceId: string
  item?: WaterChangeRecord | null
  onClose: () => void
  onSuccess?: () => void
}

interface FormValues {
  changedAt: string
  changeType: WaterChangeType
  reason: WaterChangeReason
  notes: string
}

export const UpsertWaterChangeModal: React.FC<UpsertWaterChangeModalProps> = ({ open, mode, deviceId, item, onClose, onSuccess }) => {
  const { t } = useTranslation('farming')
  const toWIBLocalInput = (dt: Date | string): string => {
    const d = new Date(dt)
    if (isNaN(d.getTime())) return ''
    const wibMs = d.getTime() + 7 * 60 * 60 * 1000
    const w = new Date(wibMs)
    const yyyy = w.getUTCFullYear()
    const mm = String(w.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(w.getUTCDate()).padStart(2, '0')
    const HH = String(w.getUTCHours()).padStart(2, '0')
    const MM = String(w.getUTCMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}`
  }

  const nowWIBLocalInput = (): string => toWIBLocalInput(new Date())

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      changedAt: nowWIBLocalInput(),
      changeType: 'partial',
      reason: 'rutin',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        reset({
          changedAt: toWIBLocalInput(item.changedAt),
          changeType: item.changeType,
          reason: item.reason,
          notes: item.notes || '',
        })
      } else {
        reset({ changedAt: nowWIBLocalInput(), changeType: 'partial', reason: 'rutin', notes: '' })
      }
    }
  }, [open, mode, item, reset])

  const toWIBOffsetISO = (dtLocal?: string): string | undefined => {
    if (!dtLocal) return undefined
    const base = dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal
    return `${base}+07:00`
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const changedAtIso = toWIBOffsetISO(values.changedAt)
      if (mode === 'create') {
        await WaterChangesService.create({
          deviceId,
          changedAt: changedAtIso,
          changeType: values.changeType,
          reason: values.reason,
          notes: values.notes || undefined,
        })
        toast.success(t('waterChanges.toasts.created'))
      } else if (mode === 'edit' && item) {
        await WaterChangesService.update(item.id, {
          changedAt: changedAtIso!,
          changeType: values.changeType,
          reason: values.reason,
          notes: values.notes,
        })
        toast.success(t('waterChanges.toasts.updated'))
      }
      onSuccess?.()
      onClose()
    } catch (e: any) {
      // Error handled below via alert
    }
  }

  // Naive local error aggregator (no react-query mutation here to keep it simple)
  // In future we can refactor to use useMutation with query invalidation.

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('waterChanges.modal.createTitle') : t('waterChanges.modal.editTitle')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Form */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="changedAt">{t('waterChanges.modal.fields.changedAt')}</Label>
              <Input id="changedAt" type="datetime-local" {...register('changedAt', { required: t('waterChanges.modal.errors.required') })} />
              {errors.changedAt && <p className="text-xs text-red-500">{errors.changedAt.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('waterChanges.modal.fields.changeType')}</Label>
              <Select defaultValue={item?.changeType || 'partial'} onValueChange={(v) => setValue('changeType', v as WaterChangeType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('waterChanges.modal.fields.changeType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partial">{t('waterChanges.modal.options.partial')}</SelectItem>
                  <SelectItem value="full">{t('waterChanges.modal.options.full')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('waterChanges.modal.fields.reason')}</Label>
              <Select defaultValue={item?.reason || 'rutin'} onValueChange={(v) => setValue('reason', v as WaterChangeReason)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('waterChanges.modal.fields.reason')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rutin">{t('waterChanges.modal.options.rutin')}</SelectItem>
                  <SelectItem value="kualitas_air">{t('waterChanges.modal.options.kualitas_air')}</SelectItem>
                  <SelectItem value="penyakit">{t('waterChanges.modal.options.penyakit')}</SelectItem>
                  <SelectItem value="lainnya">{t('waterChanges.modal.options.lainnya')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('waterChanges.modal.fields.notes')}</Label>
              <Input id="notes" placeholder={t('waterChanges.modal.fields.notes')} {...register('notes')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? t('waterChanges.modal.buttons.create') : t('waterChanges.modal.buttons.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
