import { z } from 'zod';

// Device ID validation regex
export const DEVICE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

// Validation schema for device form
export const deviceFormSchema = z.object({
  device_id: z
    .string()
    .min(1, 'Device ID is required')
    .max(50, 'Device ID must be less than 50 characters')
    .regex(DEVICE_ID_REGEX, 'Device ID can only contain letters, numbers, hyphens, and underscores'),
  device_name: z
    .string()
    .min(1, 'Device name is required')
    .max(100, 'Device name must be less than 100 characters'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  aquarium_size: z.object({
    length: z
      .number()
      .min(0.1, 'Length must be greater than 0')
      .max(1000, 'Length must be less than 1000 cm'),
    width: z
      .number()
      .min(0.1, 'Width must be greater than 0')
      .max(1000, 'Width must be less than 1000 cm'),
    height: z
      .number()
      .min(0.1, 'Height must be greater than 0')
      .max(1000, 'Height must be less than 1000 cm'),
  }),
  glass_type: z
    .string()
    .max(50, 'Glass type must be less than 50 characters')
    .optional(),
  fish_count: z
    .number()
    .min(0, 'Fish count cannot be negative')
    .max(1000, 'Fish count must be less than 1000')
    .optional(),
});

// Validation functions
export const validateDeviceId = (deviceId: string): string | null => {
  if (!deviceId) return 'Device ID is required';
  if (deviceId.length > 50) return 'Device ID must be less than 50 characters';
  if (!DEVICE_ID_REGEX.test(deviceId)) {
    return 'Device ID can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
};

export const validateDeviceName = (deviceName: string): string | null => {
  if (!deviceName) return 'Device name is required';
  if (deviceName.length > 100) return 'Device name must be less than 100 characters';
  return null;
};

export const validateLocation = (location: string): string | null => {
  if (!location) return 'Location is required';
  if (location.length > 100) return 'Location must be less than 100 characters';
  return null;
};

export const validateAquariumDimension = (
  value: number, 
  dimensionName: string
): string | null => {
  if (value <= 0) return `${dimensionName} must be greater than 0`;
  if (value > 1000) return `${dimensionName} must be less than 1000 cm`;
  return null;
};

export const validateFishCount = (fishCount?: number): string | null => {
  if (fishCount === undefined || fishCount === null) return null;
  if (fishCount < 0) return 'Fish count cannot be negative';
  if (fishCount > 1000) return 'Fish count must be less than 1000';
  return null;
};

export const validateGlassType = (glassType?: string): string | null => {
  if (!glassType) return null;
  if (glassType.length > 50) return 'Glass type must be less than 50 characters';
  return null;
};

// Type for validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Comprehensive form validation
export const validateDeviceForm = (data: any): ValidationResult => {
  const result = deviceFormSchema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { isValid: false, errors };
};