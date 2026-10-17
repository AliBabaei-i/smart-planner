// ═══════════════════════════════════════════════
// ✅ تبدیل و فرمت تاریخ شمسی
// ═══════════════════════════════════════════════
import { toJalaali } from 'jalaali-js'

// ═══════════════════════════════════════════════
// ✅ Types
// ═══════════════════════════════════════════════
export interface PersianDateObject {
  year: number
  month: number
  day: number
  toString: () => string
  toShortString: () => string
  toLongString: () => string
}

// ═══════════════════════════════════════════════
// ✅ Constants
// ═══════════════════════════════════════════════
const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const PERSIAN_WEEKDAYS = [
  'یکشنبه',    // 0 - Sunday
  'دوشنبه',    // 1 - Monday
  'سه‌شنبه',   // 2 - Tuesday
  'چهارشنبه',  // 3 - Wednesday
  'پنجشنبه',   // 4 - Thursday
  'جمعه',      // 5 - Friday
  'شنبه'       // 6 - Saturday
]

// ═══════════════════════════════════════════════
// ✅ تبدیل میلادی → شمسی
// ═══════════════════════════════════════════════
export const toPersianDate = (
  gregorianDate: Date | string | number | null | undefined
): PersianDateObject | null => {
  if (!gregorianDate) return null

  try {
    const date = new Date(gregorianDate)
    if (isNaN(date.getTime())) return null

    const { jy, jm, jd } = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )

    return {
      year: jy,
      month: jm,
      day: jd,
      toString: () => `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`,
      toShortString: () => `${jd} ${getPersianMonthName(jm)}`,
      toLongString: () => `${jd} ${getPersianMonthName(jm)} ${jy}`
    }
  } catch (error) {
    console.error('Error converting to Persian date:', error)
    return null
  }
}

// ═══════════════════════════════════════════════
// ✅ نام ماه شمسی
// ═══════════════════════════════════════════════
export const getPersianMonthName = (month: number): string => {
  return PERSIAN_MONTHS[month - 1] || 'نامشخص'
}

// ═══════════════════════════════════════════════
// ✅ نام روز هفته
// ═══════════════════════════════════════════════
export const getPersianDayName = (
  date: Date | string | null | undefined
): string => {
  if (!date) return 'نامشخص'
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'نامشخص'
    return PERSIAN_WEEKDAYS[d.getDay()] || 'نامشخص'
  } catch {
    return 'نامشخص'
  }
}

// ═══════════════════════════════════════════════
// ✅ روزهای یک هفته (از شنبه تا جمعه)
// ═══════════════════════════════════════════════
export const getPersianWeekDates = (startDate: Date = new Date()): Date[] => {
  const dates: Date[] = []
  const start = new Date(startDate)

  // ✅ رفتن به اول هفته (شنبه)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)
    dates.push(currentDate)
  }

  return dates
}

// ═══════════════════════════════════════════════
// ✅ فرمت‌های مختلف تاریخ
// ═══════════════════════════════════════════════

// فرمت کامل: ۱۴۰۳/۰۷/۱۵
export const formatPersianDate = (
  gregorianDate: Date | string | number | null | undefined
): string => {
  const persianDate = toPersianDate(gregorianDate)
  return persianDate ? persianDate.toString() : '---'
}

// فرمت کوتاه: ۱۵ مهر
export const formatShortPersianDate = (
  gregorianDate: Date | string | number | null | undefined
): string => {
  const persianDate = toPersianDate(gregorianDate)
  return persianDate ? persianDate.toShortString() : '---'
}

// فرمت بلند: ۱۵ مهر ۱۴۰۳
export const formatLongPersianDate = (
  gregorianDate: Date | string | number | null | undefined
): string => {
  const persianDate = toPersianDate(gregorianDate)
  return persianDate ? persianDate.toLongString() : '---'
}

// ═══════════════════════════════════════════════
// ✅ چک امروز بودن
// ═══════════════════════════════════════════════
export const isTodayPersian = (
  gregorianDate: Date | string | null | undefined
): boolean => {
  if (!gregorianDate) return false

  const today = new Date()
  const targetDate = new Date(gregorianDate)

  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  )
}

// ═══════════════════════════════════════════════
// ✅ اضافه کردن روز
// ═══════════════════════════════════════════════
export const addDaysToPersianDate = (
  gregorianDate: Date | string,
  days: number
): Date | null => {
  if (!gregorianDate) return null
  const date = new Date(gregorianDate)
  date.setDate(date.getDate() + days)
  return date
}

// ═══════════════════════════════════════════════
// ✅ بازه هفته
// ═══════════════════════════════════════════════
export const getPersianWeekRange = (date: Date = new Date()) => {
  const weekDates = getPersianWeekDates(date)
  const start = weekDates[0]
  const end = weekDates[6]

  return {
    start,
    end,
    startFormatted: formatPersianDate(start),
    endFormatted: formatPersianDate(end),
    startShort: formatShortPersianDate(start),
    endShort: formatShortPersianDate(end),
    startLong: formatLongPersianDate(start),
    endLong: formatLongPersianDate(end)
  }
}

// ═══════════════════════════════════════════════
// ✅ اجزای تاریخ (روز، ماه، سال)
// ═══════════════════════════════════════════════
export const getPersianDayNumber = (
  gregorianDate: Date | string | null | undefined
): number | string => {
  if (!gregorianDate) return ''
  try {
    const date = new Date(gregorianDate)
    return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate()).jd
  } catch {
    return ''
  }
}

export const getPersianMonthFromDate = (
  gregorianDate: Date | string | null | undefined
): string => {
  if (!gregorianDate) return ''
  try {
    const date = new Date(gregorianDate)
    const { jm } = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )
    return getPersianMonthName(jm)
  } catch {
    return ''
  }
}

export const getPersianYear = (
  gregorianDate: Date | string | null | undefined
): number | string => {
  if (!gregorianDate) return ''
  try {
    const date = new Date(gregorianDate)
    return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate()).jy
  } catch {
    return ''
  }
}

// ═══════════════════════════════════════════════
// ✅ Default export
// ═══════════════════════════════════════════════
export default {
  toPersianDate,
  getPersianMonthName,
  getPersianDayName,
  getPersianWeekDates,
  formatPersianDate,
  formatShortPersianDate,
  formatLongPersianDate,
  isTodayPersian,
  addDaysToPersianDate,
  getPersianWeekRange,
  getPersianDayNumber,
  getPersianMonthFromDate,
  getPersianYear
}