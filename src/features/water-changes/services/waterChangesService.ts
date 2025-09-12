import { apiClient } from '@/utils/apiClient'
import type { WaterChangesListParams, WaterChangesListResponse, WaterChangeRecord, WaterChangeReason, WaterChangeType } from '../types'

function mapApiItem(raw: any): WaterChangeRecord {
  return {
    id: raw.id,
    deviceId: raw?.device_id ?? raw?.device?.device_id ?? raw?.device_uuid,
    changedAt: raw.changed_at,
    changeType: raw.change_type as WaterChangeType,
    reason: raw.reason as WaterChangeReason,
    notes: raw.notes ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? raw.changed_at,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.changed_at,
  }
}

export class WaterChangesService {
  static async list(params: WaterChangesListParams): Promise<WaterChangesListResponse> {
    const { deviceId, page = 1, limit = 10, startDate, endDate } = params
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (startDate) q.set('startDate', startDate)
    if (endDate) q.set('endDate', endDate)

    const res = await apiClient.get(`/water-changes/device/${encodeURIComponent(deviceId)}?${q.toString()}`)
    const payload = res.data?.data ?? res.data

    const itemsRaw = payload?.items ?? []
    const items: WaterChangeRecord[] = Array.isArray(itemsRaw) ? itemsRaw.map(mapApiItem) : []
    return {
      items,
      total: payload?.total ?? items.length,
      page: payload?.page ?? page,
      limit: payload?.limit ?? limit,
    }
  }

  static async create(data: {
    deviceId: string
    changedAt?: string | null
    changeType: WaterChangeType
    reason: WaterChangeReason
    notes?: string | null
  }): Promise<WaterChangeRecord> {
    const payload: any = {
      device_id: data.deviceId,
      change_type: data.changeType,
      reason: data.reason,
    }
    if (data.changedAt) payload.changed_at = data.changedAt
    if (data.notes !== undefined) payload.notes = data.notes

    const res = await apiClient.post('/water-changes', payload)
    const raw = res.data?.data ?? res.data
    return mapApiItem(raw)
  }

  static async getById(id: string): Promise<WaterChangeRecord> {
    const res = await apiClient.get(`/water-changes/by-id/${encodeURIComponent(id)}`)
    const raw = res.data?.data ?? res.data
    return mapApiItem(raw)
  }

  static async update(id: string, data: Partial<{
    changedAt: string
    changeType: WaterChangeType
    reason: WaterChangeReason
    notes: string | null
  }>): Promise<WaterChangeRecord> {
    const payload: any = {}
    if (data.changedAt !== undefined) payload.changed_at = data.changedAt
    if (data.changeType !== undefined) payload.change_type = data.changeType
    if (data.reason !== undefined) payload.reason = data.reason
    if (data.notes !== undefined) payload.notes = data.notes

    const res = await apiClient.put(`/water-changes/${encodeURIComponent(id)}`, payload)
    const raw = res.data?.data ?? res.data
    return mapApiItem(raw)
  }

  static async remove(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/water-changes/${encodeURIComponent(id)}`)
    const raw = res.data?.data ?? res.data
    return raw ?? { message: 'Deleted' }
  }
}

export const waterChangesKeys = {
  all: ['water-changes'] as const,
  list: (params: WaterChangesListParams) => [...waterChangesKeys.all, 'list', params] as const,
  detail: (id: string) => [...waterChangesKeys.all, 'detail', id] as const,
}

