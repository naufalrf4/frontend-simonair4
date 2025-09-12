import { apiClient } from '@/utils/apiClient'
import type { MortalityListParams, MortalityListResponse, MortalityRecord } from '../types'

function mapItem(raw: any, deviceIdHint?: string): MortalityRecord {
  return {
    id: raw.id,
    deviceId: deviceIdHint,
    deviceUuid: raw.device_uuid,
    eventDate: raw.event_date,
    deadCount: Number(raw.dead_count ?? 0),
    cause: raw.cause ?? null,
    description: raw.description ?? null,
    reportedBy: raw.reported_by,
    reportedByName: raw.reported_by_name ?? null,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
  }
}

export class MortalityService {
  static async list(params: MortalityListParams): Promise<MortalityListResponse> {
    const { deviceId, startDate, endDate, limit = 10, offset = 0, cause, sortBy, sortOrder } = params
    const q = new URLSearchParams()
    q.set('limit', String(limit))
    q.set('offset', String(offset))
    if (startDate) q.set('startDate', startDate)
    if (endDate) q.set('endDate', endDate)
    if (cause) q.set('cause', cause)
    if (sortBy) q.set('sortBy', sortBy)
    if (sortOrder) q.set('sortOrder', sortOrder)

    const res = await apiClient.get(`/fish/mortality/device/${encodeURIComponent(deviceId)}?${q.toString()}`)
    const root = res.data
    const dataArray = root?.data ?? []
    const pagination = root?.pagination ?? root?.data?.pagination
    const items = Array.isArray(dataArray) ? dataArray.map((r: any) => mapItem(r, deviceId)) : []
    return {
      items,
      total: pagination?.total ?? items.length,
      page: pagination?.page,
      limit: pagination?.limit ?? limit,
      offset,
      totalPages: pagination?.totalPages,
    }
  }

  static async create(deviceId: string, dto: { eventDate: string; deadCount: number; cause?: string; description?: string }): Promise<MortalityRecord> {
    const payload: any = {
      event_date: dto.eventDate,
      dead_count: dto.deadCount,
    }
    if (dto.cause !== undefined) payload.cause = dto.cause
    if (dto.description !== undefined) payload.description = dto.description
    const res = await apiClient.post(`/fish/mortality/device/${encodeURIComponent(deviceId)}`, payload)
    const raw = res.data?.data ?? res.data
    return mapItem(raw, deviceId)
  }

  static async detail(id: string): Promise<MortalityRecord> {
    const res = await apiClient.get(`/fish/mortality/${encodeURIComponent(id)}`)
    const raw = res.data?.data ?? res.data
    return mapItem(raw)
  }

  static async update(id: string, dto: Partial<{ eventDate: string; deadCount: number; cause: string; description: string }>): Promise<MortalityRecord> {
    const payload: any = {}
    if (dto.eventDate !== undefined) payload.event_date = dto.eventDate
    if (dto.deadCount !== undefined) payload.dead_count = dto.deadCount
    if (dto.cause !== undefined) payload.cause = dto.cause
    if (dto.description !== undefined) payload.description = dto.description
    const res = await apiClient.put(`/fish/mortality/${encodeURIComponent(id)}`, payload)
    const raw = res.data?.data ?? res.data
    return mapItem(raw)
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete(`/fish/mortality/${encodeURIComponent(id)}`)
  }
}

export const mortalityKeys = {
  all: ['fish-mortality'] as const,
  list: (params: MortalityListParams) => [...mortalityKeys.all, 'list', params] as const,
  detail: (id: string) => [...mortalityKeys.all, 'detail', id] as const,
}

