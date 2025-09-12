import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ManualMeasurementsService, manualMeasurementsKeys } from '../services/manualMeasurementsService';
import type {
  ManualMeasurementsListParams,
  ManualMeasurementsListResponse,
  ManualMeasurement,
  CreateManualMeasurementDto,
  UpdateManualMeasurementDto,
  MeasurementComparisonResponse,
  CompareManualMeasurementDto,
} from '../types';

export function useManualMeasurementsList(deviceId: string, params: ManualMeasurementsListParams) {
  return useQuery<ManualMeasurementsListResponse>({
    queryKey: manualMeasurementsKeys.list(deviceId, params),
    queryFn: () => ManualMeasurementsService.list(deviceId, params),
    enabled: Boolean(deviceId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Back-compat: accept a single params object containing deviceId
export function useManualMeasurementsListQuery(params: ManualMeasurementsListParams & { deviceId: string }) {
  const { deviceId, ...rest } = params;
  return useManualMeasurementsList(deviceId, rest as ManualMeasurementsListParams);
}

export function useManualMeasurementDetail(id: string, includeComparison = false) {
  return useQuery<ManualMeasurement>({
    queryKey: manualMeasurementsKeys.detail(id, includeComparison),
    queryFn: () => ManualMeasurementsService.detail(id, includeComparison),
    enabled: Boolean(id),
  });
}

export function useCreateManualMeasurement(deviceId: string, params?: ManualMeasurementsListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateManualMeasurementDto) => ManualMeasurementsService.create(deviceId, dto),
    onSuccess: () => {
      if (deviceId) qc.invalidateQueries({ queryKey: manualMeasurementsKeys.list(deviceId, params || ({} as any)) });
    },
  });
}

export function useUpdateManualMeasurement(deviceId: string, params?: ManualMeasurementsListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateManualMeasurementDto }) => ManualMeasurementsService.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: manualMeasurementsKeys.detail(id, false) });
      if (deviceId) qc.invalidateQueries({ queryKey: manualMeasurementsKeys.list(deviceId, params || ({} as any)) });
    },
  });
}

export function useCompareManualMeasurement() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<CompareManualMeasurementDto, 'manual_measurement_id'> & { manual_measurement_id: string } }) =>
      ManualMeasurementsService.compare(id, body),
  }) as unknown as {
    mutateAsync: (args: { id: string; body: Omit<CompareManualMeasurementDto, 'manual_measurement_id'> & { manual_measurement_id: string } }) => Promise<MeasurementComparisonResponse>;
    isPending: boolean;
    error: any;
  };
}

// Mutation wrappers expected by existing route file
export function useCreateManualMeasurementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: string; data: CreateManualMeasurementDto }) =>
      ManualMeasurementsService.create(deviceId, data),
    onSuccess: (_res, variables) => {
      // Invalidate any list queries for this device if present
      qc.invalidateQueries({ queryKey: ['manual-measurements', 'list', variables.deviceId] });
    },
  });
}

export function useUpdateManualMeasurementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManualMeasurementDto }) =>
      ManualMeasurementsService.update(id, data),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: manualMeasurementsKeys.detail(variables.id, false) });
      qc.invalidateQueries({ queryKey: manualMeasurementsKeys.all as any });
    },
  });
}

export function useCompareManualMeasurementMutation() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<CompareManualMeasurementDto, 'manual_measurement_id'> & { manual_measurement_id: string } }) =>
      ManualMeasurementsService.compare(id, body),
  });
}
