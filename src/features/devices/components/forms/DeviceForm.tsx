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
import { DEVICE_MESSAGES } from '../../constants/messages';
import { Fingerprint, User, MapPin, Ruler, Fish, EqualApproximately } from 'lucide-react';

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
  submitLabel = DEVICE_MESSAGES.SAVE_CHANGES,
  submitIcon,
  showCancel = true,
  disabled = false,
  className,
  disableDeviceId = false,
  onChange,
}) => {
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
                  {DEVICE_MESSAGES.DEVICE_ID_LABEL} *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={DEVICE_MESSAGES.DEVICE_ID_PLACEHOLDER}
                    disabled={disabled || isLoading || disableDeviceId}
                  />
                </FormControl>
                <FormDescription>
                  {disableDeviceId
                    ? DEVICE_MESSAGES.DEVICE_ID_LOCKED
                    : DEVICE_MESSAGES.DEVICE_ID_HELP}
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
                  {DEVICE_MESSAGES.DEVICE_NAME_LABEL} *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={DEVICE_MESSAGES.DEVICE_NAME_PLACEHOLDER}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <FormDescription>{DEVICE_MESSAGES.DEVICE_NAME_HELP}</FormDescription>
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
                  {DEVICE_MESSAGES.LOCATION_LABEL} *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={DEVICE_MESSAGES.LOCATION_PLACEHOLDER}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <FormDescription>{DEVICE_MESSAGES.LOCATION_HELP}</FormDescription>
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
                {DEVICE_MESSAGES.AQUARIUM_SIZE_LABEL}
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
                  {DEVICE_MESSAGES.GLASS_TYPE_LABEL}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={DEVICE_MESSAGES.GLASS_TYPE_PLACEHOLDER}
                    disabled={disabled || isLoading}
                  />
                </FormControl>
                <FormDescription>{DEVICE_MESSAGES.GLASS_TYPE_HELP}</FormDescription>
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
                  {DEVICE_MESSAGES.FISH_COUNT_LABEL}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder={DEVICE_MESSAGES.FISH_COUNT_PLACEHOLDER}
                    disabled={disabled || isLoading}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormDescription>{DEVICE_MESSAGES.FISH_COUNT_HELP}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          {showCancel && (
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              {DEVICE_MESSAGES.CANCEL}
            </Button>
          )}
          <Button type="submit" disabled={disabled || isLoading}>
            {submitIcon}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
