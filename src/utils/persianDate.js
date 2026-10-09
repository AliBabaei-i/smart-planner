import { toJalaali, toGregorian } from 'jalaali-js'

/**
 * تبدیل تاریخ میلادی به شمسی
 */
export const toPersianDate = (gregorianDate) => {
  if (!gregorianDate) return null
  
  try {
    const date = new Date(gregorianDate)
    const { jy, jm, jd } = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )
    
    return {
      year: jy,
      month: jm,
      day: jd,
      toString: () => `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`,
      toShortString: () => `${jd} ${getPersianMonthName(jm)}`,
      toLongString: () => `${jd} ${getPersianMonthName(jm)} ${jy}`
    }
  } catch (error) {
    console.error('Error converting to Persian date:', error)
    return null
  }
}

/**
 * گرفتن نام ماه شمسی
 */
export const getPersianMonthName = (month) => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]
  return months[month - 1] || 'نامشخص'
}

/**
 * گرفتن نام روز هفته به فارسی
 */
export const getPersianDayName = (date) => {
  const days = [
    'یکشنبه',
    'دوشنبه', 
    'سه‌شنبه',
    'چهارشنبه',
    'پنجشنبه',
    'جمعه',
    'شنبه'
  ]
  
  const dayIndex = date.getDay()
  return days[dayIndex] || 'نامشخص'
}

/**
 * تولید آرایه‌ای از تاریخ‌های یک هفته شمسی
 */
export const getPersianWeekDates = (startDate = new Date()) => {
  const dates = []
  const start = new Date(startDate)
  
  // رفتن به اول هفته (شنبه)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)
    dates.push(currentDate)
  }
  
  return dates
}

/**
 * فرمت تاریخ شمسی برای نمایش
 */
export const formatPersianDate = (gregorianDate) => {
  const persianDate = toPersianDate(gregorianDate)
  return persianDate ? persianDate.toString() : '---'
}

/**
 * فرمت تاریخ شمسی کوتاه (۱۵ دی)
 */
export const formatShortPersianDate = (gregorianDate) => {
  const persianDate = toPersianDate(gregorianDate)
  return persianDate ? persianDate.toShortString() : '---'
}

/**
 * فرمت تاریخ شمسی کامل (۱۵ دی ۱۴۰۲)
 */
export const formatLongPersianDate = (gregorianDate) => {
  const persianDate = toPersianDate(gregorianDate)
  return persianDate ? persianDate.toLongString() : '---'
}

/**
 * بررسی آیا تاریخ امروز است
 */
export const isTodayPersian = (gregorianDate) => {
  if (!gregorianDate) return false
  
  const today = new Date()
  const targetDate = new Date(gregorianDate)
  
  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  )
}

/**
 * اضافه کردن روز به تاریخ
 */
export const addDaysToPersianDate = (gregorianDate, days) => {
  if (!gregorianDate) return null
  
  const date = new Date(gregorianDate)
  date.setDate(date.getDate() + days)
  return date
}

/**
 * گرفتن بازه هفته شمسی
 */
export const getPersianWeekRange = (date = new Date()) => {
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

/**
 * گرفتن شماره روز شمسی از تاریخ میلادی
 */
export const getPersianDayNumber = (gregorianDate) => {
  if (!gregorianDate) return ''
  
  try {
    const date = new Date(gregorianDate)
    const { jd } = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )
    return jd
  } catch (error) {
    console.error('Error getting Persian day number:', error)
    return ''
  }
}

/**
 * گرفتن ماه شمسی از تاریخ میلادی
 */
export const getPersianMonthFromDate = (gregorianDate) => {
  if (!gregorianDate) return ''
  
  try {
    const date = new Date(gregorianDate)
    const { jm } = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )
    return getPersianMonthName(jm)
  } catch (error) {
    console.error('Error getting Persian month:', error)
    return ''
  }
}

/**
 * گرفتن سال شمسی از تاریخ میلادی
 */
export const getPersianYear = (gregorianDate) => {
  if (!gregorianDate) return ''
  
  try {
    const date = new Date(gregorianDate)
    const { jy } = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    )
    return jy
  } catch (error) {
    console.error('Error getting Persian year:', error)
    return ''
  }
}

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