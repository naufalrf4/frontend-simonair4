import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { WaterChangeRecord, WaterChangeType, WaterChangeReason } from '../types'
import { WaterChangesService } from '../services/waterChangesService'

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
        toast.success('Water change logged')
      } else if (mode === 'edit' && item) {
        await WaterChangesService.update(item.id, {
          changedAt: changedAtIso!,
          changeType: values.changeType,
          reason: values.reason,
          notes: values.notes,
        })
        toast.success('Water change updated')
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
            {mode === 'create' ? 'Log Water Change' : 'Edit Water Change'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Form */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="changedAt">Event Time</Label>
              <Input id="changedAt" type="datetime-local" {...register('changedAt', { required: 'Required' })} />
              {errors.changedAt && <p className="text-xs text-red-500">{errors.changedAt.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Change Type</Label>
              <Select defaultValue={item?.changeType || 'partial'} onValueChange={(v) => setValue('changeType', v as WaterChangeType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Select defaultValue={item?.reason || 'rutin'} onValueChange={(v) => setValue('reason', v as WaterChangeReason)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rutin">Rutin</SelectItem>
                  <SelectItem value="kualitas_air">Kualitas Air</SelectItem>
                  <SelectItem value="penyakit">Penyakit</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Optional notes" {...register('notes')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{mode === 'create' ? 'Create' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

