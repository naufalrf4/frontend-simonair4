import type { DeviceFormData, CreateDeviceData, UpdateDeviceData } from '../types';
import i18n from '@/i18n/config';

const localeMap: Record<string, string> = {
  id: 'id-ID',
  en: 'en-US',
};

const getLocale = (): string => {
  const lang = i18n.resolvedLanguage || i18n.language || 'en';
  return localeMap[lang] || 'en-US';
};

const tDevices = (key: string, options?: Record<string, unknown>) =>
  i18n.t(`devices:${key}`, options);

// Aquarium size formatting utilities
export const formatAquariumSize = (dimensions: {
  length: number;
  width: number;
  height: number;
}): string => {
  if (
    !dimensions ||
    (dimensions.length === 0 && dimensions.width === 0 && dimensions.height === 0)
  ) {
    return '';
  }
  return `${dimensions.length}x${dimensions.width}x${dimensions.height} cm`;
};

export const parseAquariumSize = (
  sizeString: string,
): { length: number; width: number; height: number } => {
  if (!sizeString) {
    return { length: 0, width: 0, height: 0 };
  }

  // Remove 'cm' and any extra spaces
  const cleanString = sizeString.replace(/\s*cm\s*$/i, '').trim();

  // Split by 'x' or '×' and parse numbers
  const parts = cleanString.split(/[x×]/i).map((part) => parseFloat(part.trim()));

  if (parts.length === 3 && parts.every((part) => !isNaN(part))) {
    return {
      length: parts[0],
      width: parts[1],
      height: parts[2],
    };
  }

  return { length: 0, width: 0, height: 0 };
};

// Convert form data to API format
export const formatDeviceForCreate = (formData: DeviceFormData): CreateDeviceData => {
  return {
    device_id: formData.device_id.trim(),
    device_name: formData.device_name.trim(),
    location: formData.location.trim(),
    aquarium_size: formatAquariumSize(formData.aquarium_size),
    glass_type: formData.glass_type?.trim() || undefined,
    fish_count: formData.fish_count || undefined,
  };
};

// Convert form data to API format for updates
export const formatDeviceForUpdate = (formData: Partial<DeviceFormData>): UpdateDeviceData => {
  const updateData: UpdateDeviceData = {};

  if (formData.device_name !== undefined) {
    updateData.device_name = formData.device_name.trim();
  }

  if (formData.location !== undefined) {
    updateData.location = formData.location.trim();
  }

  if (formData.aquarium_size !== undefined) {
    updateData.aquarium_size = formatAquariumSize(formData.aquarium_size);
  }

  if (formData.glass_type !== undefined) {
    updateData.glass_type = formData.glass_type?.trim() || undefined;
  }

  if (formData.fish_count !== undefined) {
    updateData.fish_count = formData.fish_count || undefined;
  }

  return updateData;
};

// Convert API device data to form format
export const formatDeviceForForm = (device: any): DeviceFormData => {
  return {
    device_id: device.device_id || '',
    device_name: device.device_name || '',
    location: device.location || '',
    aquarium_size: parseAquariumSize(device.aquarium_size || ''),
    glass_type: device.glass_type || '',
    fish_count: device.fish_count || 0,
  };
};

// Display formatting utilities
export const formatDeviceStatus = (isOnline: boolean, lastSeen?: string | null): string => {
  if (isOnline) {
    return tDevices('status.online');
  }

  if (lastSeen) {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return tDevices('status.offlineMinutes', { value: diffInMinutes });
    }

    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return tDevices('status.offlineHours', { value: hours });
    }

    const days = Math.floor(diffInMinutes / 1440);
    return tDevices('status.offlineDays', { value: days });
  }

  return tDevices('status.offline');
};

export const formatSensorValue = (
  value: number | undefined,
  unit: string,
  decimals: number = 1,
): string => {
  if (value === undefined || value === null) {
    return tDevices('card.labels.notAvailable');
  }
  const formatter = new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const formatted = formatter.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
};

export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch (error) {
    return '';
  }
};

// Validation helpers for formatted data
export const isValidAquariumSize = (sizeString: string): boolean => {
  const dimensions = parseAquariumSize(sizeString);
  return dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0;
};

export const getAquariumVolume = (dimensions: {
  length: number;
  width: number;
  height: number;
}): number => {
  return (dimensions.length * dimensions.width * dimensions.height) / 1000; // Convert cm³ to liters
};

export const formatAquariumVolume = (dimensions: {
  length: number;
  width: number;
  height: number;
}): string => {
  const volume = getAquariumVolume(dimensions);
  return `${volume.toFixed(1)} L`;
};
