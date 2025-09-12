export type WaterChangeType = 'partial' | 'full'
export type WaterChangeReason = 'rutin' | 'kualitas_air' | 'penyakit' | 'lainnya'

export interface WaterChangeRecord {
  id: string
  deviceId: string
  changedAt: string
  changeType: WaterChangeType
  reason: WaterChangeReason
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface WaterChangesListParams {
  deviceId: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface WaterChangesListResponse {
  items: WaterChangeRecord[]
  total: number
  page: number
  limit: number
}

