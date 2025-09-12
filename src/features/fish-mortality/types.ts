export interface MortalityRecord {
  id: string
  deviceId?: string
  deviceUuid: string
  eventDate: string // YYYY-MM-DD
  deadCount: number
  cause?: string | null
  description?: string | null
  reportedBy?: string
  reportedByName?: string | null
  createdAt: string
  updatedAt: string
}

export interface MortalityListParams {
  deviceId: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  cause?: string
  sortBy?: 'event_date' | 'created_at'
  sortOrder?: 'ASC' | 'DESC'
}

export interface MortalityListResponse {
  items: MortalityRecord[]
  total: number
  page?: number
  limit?: number
  offset?: number
  totalPages?: number
}

