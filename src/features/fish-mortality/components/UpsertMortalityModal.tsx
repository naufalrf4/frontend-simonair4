import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { MortalityRecord } from '../types'
import { MortalityService } from '../services/mortalityService'

type Mode = 'create' | 'edit'

export interface UpsertMortalityModalProps {
  open: boolean
  mode: Mode
  deviceId: string
  item?: MortalityRecord | null
  onClose: () => void
  onSuccess?: () => void
}

interface FormValues {
  eventDate: string // YYYY-MM-DD
  deadCount: number
  cause: string
  description: string
}

export const UpsertMortalityModal: React.FC<UpsertMortalityModalProps> = ({ open, mode, deviceId, item, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      eventDate: '',
      deadCount: 1,
      cause: '',
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        reset({
          eventDate: item.eventDate,
          deadCount: item.deadCount,
          cause: item.cause || '',
          description: item.description || '',
        })
      } else {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        reset({ eventDate: `${yyyy}-${mm}-${dd}`, deadCount: 1, cause: '', description: '' })
      }
    }
  }, [open, mode, item, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === 'create') {
        await MortalityService.create(deviceId, {
          eventDate: values.eventDate,
          deadCount: Number(values.deadCount),
          cause: values.cause?.trim() || undefined,
          description: values.description?.trim() || undefined,
        })
        toast.success('Mortality record created')
      } else if (mode === 'edit' && item) {
        await MortalityService.update(item.id, {
          eventDate: values.eventDate,
          deadCount: Number(values.deadCount),
          cause: values.cause?.trim() || '',
          description: values.description?.trim() || '',
        })
        toast.success('Mortality record updated')
      }
      onSuccess?.()
      onClose()
    } catch (e: any) {
      // handled by alert if needed
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Log Fish Mortality' : 'Edit Fish Mortality'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" {...register('eventDate', { required: 'Required' })} />
              {errors.eventDate && <p className="text-xs text-red-500">{errors.eventDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadCount">Dead Count</Label>
              <Input id="deadCount" type="number" min={1} step={1} {...register('deadCount', { required: 'Required', min: { value: 1, message: 'Min 1' } })} />
              {errors.deadCount && <p className="text-xs text-red-500">{errors.deadCount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause">Cause (optional)</Label>
              <Input id="cause" placeholder="e.g., penyakit" {...register('cause')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" placeholder="Notes/observations" {...register('description')} />
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

