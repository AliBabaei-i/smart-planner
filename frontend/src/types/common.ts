// ═══════════════════════════════════════════════
// ✅ Typeهای مشترک پروژه
// ═══════════════════════════════════════════════

export type ID = string
export type ISODate = string  // فرمت: "2026-10-17T20:30:00.000Z"
export type DateStr = string  // فرمت: "2026-10-17"
export type TimeStr = string  // فرمت: "14:00"
export type Language = 'fa' | 'en'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}