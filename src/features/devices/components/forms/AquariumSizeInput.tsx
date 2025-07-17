import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import type { DeviceFormData } from '../../types';
import { DEVICE_MESSAGES } from '../../constants/messages';
import { formatAquariumVolume } from '../../utils/deviceFormatters';

interface AquariumSizeInputProps {
  control: Control<DeviceFormData>;
  name: 'aquarium_size';
  label?: string | React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const AquariumSizeInput: React.FC<AquariumSizeInputProps> = ({
  control,
  name,
  label = DEVICE_MESSAGES.AQUARIUM_SIZE_LABEL,
  className,
  disabled = false,
}) => {
  const {
    field: { value, onChange, onBlur },
  } = useController({
    name,
    control,
    defaultValue: { length: 0, width: 0, height: 0 },
  });

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', inputValue: string) => {
    const numericValue = inputValue === '' ? 0 : parseFloat(inputValue) || 0;
    onChange({
      ...value,
      [dimension]: numericValue,
    });
  };

  const formatDisplayValue = () => {
    if (!value || (value.length === 0 && value.width === 0 && value.height === 0)) {
      return '';
    }
    return `${value.length} × ${value.width} × ${value.height} cm`;
  };

  const showVolume = value && value.length > 0 && value.width > 0 && value.height > 0;

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`${name}-length`} className="text-xs text-muted-foreground">
              {DEVICE_MESSAGES.LENGTH_LABEL}
            </Label>
            <Input
              id={`${name}-length`}
              type="number"
              min="0"
              step="0.1"
              value={value?.length || ''}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="0"
              className="text-center"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${name}-width`} className="text-xs text-muted-foreground">
              {DEVICE_MESSAGES.WIDTH_LABEL}
            </Label>
            <Input
              id={`${name}-width`}
              type="number"
              min="0"
              step="0.1"
              value={value?.width || ''}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="0"
              className="text-center"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${name}-height`} className="text-xs text-muted-foreground">
              {DEVICE_MESSAGES.HEIGHT_LABEL}
            </Label>
            <Input
              id={`${name}-height`}
              type="number"
              min="0"
              step="0.1"
              value={value?.height || ''}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="0"
              className="text-center"
            />
          </div>
        </div>
        
        {/* Display formatted size and volume */}
        {formatDisplayValue() && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 flex justify-between">
            <span>
              <span className="font-medium">{DEVICE_MESSAGES.DIMENSIONS}: </span>
              {formatDisplayValue()}
            </span>
            {showVolume && (
              <span>
                <span className="font-medium">{DEVICE_MESSAGES.VOLUME}: </span>
                {formatAquariumVolume(value)}
              </span>
            )}
          </div>
        )}
        
        <FormDescription>
          {DEVICE_MESSAGES.AQUARIUM_SIZE_HELP}
        </FormDescription>
      </div>
      <FormMessage />
    </FormItem>
  );
};