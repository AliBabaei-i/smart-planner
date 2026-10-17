// ═══════════════════════════════════════════════
// ✅ توابع فرمت‌دهی بر اساس زبان
// ═══════════════════════════════════════════════

import {
  formatPersianDate,
  formatLongPersianDate,
  formatShortPersianDate,
  getPersianDayName
} from './persianDate'

const isPersianLang = (): boolean => {
  try {
    const htmlLang = document.documentElement.getAttribute('lang')
    if (htmlLang) return htmlLang === 'fa' || htmlLang.startsWith('fa')
    const saved = localStorage.getItem('smart-planner-language')
    return saved === 'fa' || !saved
  } catch {
    return true
  }
}

const toPersianDigits = (str: string | number): string => {
  if (str === null || str === undefined) return ''
  return str.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])
}

export const formatDateByLang = (date: Date | string | null | undefined): string => {
  if (!date) return '---'
  try {
    if (isPersianLang()) return formatPersianDate(date as any)
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '---'
  }
}

export const formatLongDateByLang = (date: Date | string | null | undefined): string => {
  if (!date) return '---'
  try {
    if (isPersianLang()) return formatLongPersianDate(date as any)
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '---'
  }
}

export const formatShortDateByLang = (date: Date | string | null | undefined): string => {
  if (!date) return '---'
  try {
    if (isPersianLang()) return formatShortPersianDate(date as any)
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return '---'
  }
}

export const formatDateTimeByLang = (date: Date | string | null | undefined): string => {
  if (!date) return '---'
  try {
    const d = new Date(date)
    if (isPersianLang()) {
      const persianDate = formatPersianDate(date as any)
      const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      return toPersianDigits(`${persianDate} - ${time}`)
    }
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '---'
  }
}

export const getDayNameByLang = (date: Date | string | null | undefined): string => {
  if (!date) return '---'
  try {
    if (isPersianLang()) return getPersianDayName(date as any)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[new Date(date).getDay()]
  } catch {
    return '---'
  }
}

export const formatRelativeTimeByLang = (date: Date | string | null | undefined): string => {
  if (!date) return '---'
  try {
    const now = new Date()
    const target = new Date(date)
    const diffMs = now.getTime() - target.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (isPersianLang()) {
      if (diffSecs < 60) return 'همین حالا'
      if (diffMins < 60) return toPersianDigits(`${diffMins} دقیقه پیش`)
      if (diffHours < 24) return toPersianDigits(`${diffHours} ساعت پیش`)
      if (diffDays < 30) return toPersianDigits(`${diffDays} روز پیش`)
      if (diffDays < 365) return toPersianDigits(`${Math.floor(diffDays / 30)} ماه پیش`)
      return toPersianDigits(`${Math.floor(diffDays / 365)} سال پیش`)
    }

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${Math.floor(diffDays / 365)}y ago`
  } catch {
    return '---'
  }
}

export const formatTimeByLang = (minutes: number | null | undefined): string => {
  try {
    if (minutes === null || minutes === undefined || Number(minutes) === 0) {
      return isPersianLang() ? '۰ دقیقه' : '0 min'
    }

    const numMinutes = parseInt(String(minutes), 10)
    const hours = Math.floor(numMinutes / 60)
    const mins = numMinutes % 60

    if (isPersianLang()) {
      if (mins === 0) return `${toPersianDigits(hours)} ساعت`
      if (hours === 0) return `${toPersianDigits(mins)} دقیقه`
      return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(mins)} دقیقه`
    }

    if (mins === 0) return `${hours}h`
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  } catch {
    return isPersianLang() ? '۰ دقیقه' : '0 min'
  }
}

export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return ''
  if (isPersianLang()) return toPersianDigits(num)
  return num.toString()
}

export default {
  formatDateByLang,
  formatLongDateByLang,
  formatShortDateByLang,
  formatDateTimeByLang,
  getDayNameByLang,
  formatRelativeTimeByLang,
  formatTimeByLang,
  formatDateForInput,
  formatNumber
}