// ═══════════════════════════════════════════════
// ✅ توابع کمکی برای کار با تاریخ
// (همه توابع از تاریخ محلی استفاده می‌کنن، نه UTC)
// ═══════════════════════════════════════════════

import type { DateStr } from '../types/common'

export const getLocalDateStr = (date: Date | string | null | undefined = new Date()): string => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const getTodayStr = (): string => getLocalDateStr(new Date())

export const fromLocalDateStr = (str: DateStr | null | undefined): Date | null => {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const isSameDay = (d1: Date | string | null | undefined, d2: Date | string | null | undefined): boolean => {
  if (!d1 || !d2) return false
  return new Date(d1).toDateString() === new Date(d2).toDateString()
}

export const isToday = (date: Date | string): boolean => isSameDay(date, new Date())

export const getLast7Days = (fromDate: Date = new Date()): Date[] => {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(fromDate)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - i)
    days.push(date)
  }
  return days
}

export const formatHour = (hour: number | null | undefined): string => {
  if (hour === null || hour === undefined) return '--:--'
  return `${String(hour).padStart(2, '0')}:00`
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addWeeks = (date: Date, weeks: number): Date => addDays(date, weeks * 7)

export interface HourOption {
  value: number
  label: string
}

export const getHourOptions = (from: number = 0, to: number = 23): HourOption[] => {
  const hours: HourOption[] = []
  for (let h = from; h <= to; h++) {
    hours.push({ value: h, label: formatHour(h) })
  }
  return hours
}

export const safeParseDate = (dateInput: Date | string | number | null | undefined): Date | null => {
  if (!dateInput) return null
  if (dateInput instanceof Date) return dateInput

  if (typeof dateInput === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, d] = dateInput.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return new Date(dateInput)
  }

  return new Date(dateInput)
}

export const formatRelativeTime = (dateInput: Date | string | null | undefined): string => {
  try {
    if (!dateInput) return '---'
    const date = safeParseDate(dateInput)
    if (!date) return '---'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    const toPersianDigits = (str: string): string =>
      str.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])

    if (diffSecs < 60) return 'همین حالا'
    if (diffMins < 60) return toPersianDigits(`${diffMins} دقیقه پیش`)
    if (diffHours < 24) return toPersianDigits(`${diffHours} ساعت پیش`)
    if (diffDays < 30) return toPersianDigits(`${diffDays} روز پیش`)
    if (diffDays < 365) return toPersianDigits(`${Math.floor(diffDays / 30)} ماه پیش`)
    return toPersianDigits(`${Math.floor(diffDays / 365)} سال پیش`)
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return '---'
  }
}

export default {
  getLocalDateStr,
  getTodayStr,
  fromLocalDateStr,
  isSameDay,
  isToday,
  getLast7Days,
  formatHour,
  addDays,
  addWeeks,
  getHourOptions,
  safeParseDate,
  formatRelativeTime
}