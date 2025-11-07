import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { AquariumSizeInput } from './AquariumSizeInput';
import type { DeviceFormData } from '../../types';
import { deviceFormSchema } from '../../utils/deviceValidation';
import { Fingerprint, User, MapPin, Ruler, Fish, EqualApproximately } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface DeviceFormProps {
  onSubmit: (data: DeviceFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<DeviceFormData>;
  isLoading?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  showCancel?: boolean;
  disabled?: boolean;
  className?: string;
  disableDeviceId?: boolean;
  onChange?: (data: DeviceFormData) => void;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  submitLabel,
  submitIcon,
  showCancel = true,
  disabled = false,
  className,
  disableDeviceId = false,
  onChange,
}) => {
  const { t } = useTranslation('devices');
  const resolvedSubmitLabel = submitLabel ?? t('buttons.save');
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      device_id: initialData?.device_id || '',
      device_name: initialData?.device_name || '',
      location: initialData?.location || '',
      aquarium_size: initialData?.aquarium_size || { length: 0, width: 0, height: 0 },
      glass_type: initialData?.glass_type || '',
      fish_count: initialData?.fish_count || 0,
    },
  });

  const prevValuesRef = useRef<DeviceFormData | undefined>(undefined);
  const watchedValues = form.watch();

  useEffect(() => {
    if (onChange) {
      const currentValues = JSON.stringify(watchedValues);
      const prevValues = JSON.stringify(prevValuesRef.current);

      if (currentValues !== prevValues) {
        onChange(watchedValues);
        prevValuesRef.current = watchedValues;
      }
    }
  }, [watchedValues, onChange]);

  const handleSubmit = async (data: DeviceFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is managed by the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className="space-y-6">
          {/* Device ID Field */}
          <FormField
            control={form.control}
            name="device_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  {t('forms.deviceId.label')} *
                </FormLabel>
                <FormControl>
                  {disableDeviceId ? (
                    <Input
                      {...field}
                      placeholder={t('forms.deviceId.placeholder')}
                      disabled={true}
                    />
                  ) : (
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm font-mono text-muted-foreground select-none">
                        SMNR-
                      </span>
                      <Input
                        value={(field.value || '').replace(/^SMNR-?/i, '')}
                        onChange={(e) => {
                          const raw = e.target.value || '';
                          const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                          field.onChange(`SMNR-${upper}`);
                        }}
                        placeholder={'XXXX'}
                        disabled={disabled || isLoading}
                        className="rounded-l-none"
                      />
                    </div>
                  )}
                </FormControl>
                <FormDescription>
                  {disableDeviceId ? t('forms.deviceId.locked') : t('forms.deviceId.hint')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Device Name Field */}
          <FormField
            control={form.control}
            name="device_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('forms.deviceName.label')} *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('forms.deviceName.placeholder')}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <FormDescription>{t('forms.deviceName.help')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Field */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('forms.location.label')} *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('forms.location.placeholder')}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <FormDescription>{t('forms.location.help')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aquarium Size Field */}
          <AquariumSizeInput
            control={form.control}
            name="aquarium_size"
            disabled={disabled || isLoading}
            label={
              <span className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                {t('forms.aquariumSize.label')}
              </span>
            }
          />

          {/* Glass Type Field */}
          <FormField
            control={form.control}
            name="glass_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <EqualApproximately className="h-4 w-4" />
                  {t('forms.glassType.label')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('forms.glassType.placeholder')}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <FormDescription>{t('forms.glassType.help')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fish Count Field */}
          <FormField
            control={form.control}
            name="fish_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Fish className="h-4 w-4" />
                  {t('forms.fishCount.label')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder={t('forms.fishCount.placeholder')}
                    disabled={disabled || isLoading}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormDescription>{t('forms.fishCount.help')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          {showCancel && (
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              {t('buttons.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={disabled || isLoading}>
            {submitIcon}
            {resolvedSubmitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
