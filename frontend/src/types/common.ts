// ═══════════════════════════════════════════════
// ✅ Typeهای مشترک پروژه (Common Types)
// ═══════════════════════════════════════════════

/** شناسه یکتا (UUID) */
export type ID = string

/** تاریخ و زمان کامل (ISO 8601) - مثال: "2026-10-17T20:30:00.000Z" */
export type ISODate = string

/** تاریخ محلی بدون زمان - مثال: "2026-10-17" */
export type DateStr = string

/** ساعت و دقیقه به صورت رشته - مثال: "14:00" */
export type TimeStr = string

/** زبان‌های پشتیبانی شده */
export type Language = 'fa' | 'en'

/** پاسخ استاندارد APIها */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/** پاسخ‌های صفحه‌بندی شده (Pagination) */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}