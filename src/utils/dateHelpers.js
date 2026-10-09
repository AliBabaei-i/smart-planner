import { format, parseISO, differenceInMinutes } from 'date-fns'
import { toJalaali } from 'jalaali-js'

// ✅ تبدیل اعداد به فارسی
const toPersianDigits = (str) => {
  return str.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
}

/**
 * فرمت تاریخ
 */
export const formatDate = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
    return toPersianDigits(`${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '---'
  }
}

/**
 * فرمت تاریخ و زمان
 */
export const formatDateTime = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const hours = date.getHours().toString().padStart(2, '0')
    const mins = date.getMinutes().toString().padStart(2, '0')
    return toPersianDigits(`${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')} - ${hours}:${mins}`)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return '---'
  }
}

/**
 * ✅ نمایش زمان نسبی (بدون date-fns locale که خطا می‌داد)
 */
export const formatRelativeTime = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
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

/**
 * فرمت زمان به دقیقه و ساعت
 */
export const formatTimeFromMinutes = (minutes) => {
  if (!minutes || minutes === 0) return '۰ دقیقه'
  
  if (minutes < 60) {
    return `${toPersianDigits(minutes)} دقیقه`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${toPersianDigits(hours)} ساعت`
  }
  
  return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(remainingMinutes)} دقیقه`
}

/**
 * فرمت بازه زمانی
 */
export const formatTimeRange = (startTime, endTime) => {
  try {
    if (!startTime || !endTime) return '---'
    
    const formatTime = (timeString) => {
      if (typeof timeString === 'string' && timeString.includes(':')) {
        return timeString
      }
      const date = typeof timeString === 'string' ? parseISO(timeString) : new Date(timeString)
      return format(date, 'HH:mm')
    }
    
    const start = formatTime(startTime)
    const end = formatTime(endTime)
    
    return toPersianDigits(`${start} - ${end}`)
  } catch (error) {
    console.error('Error formatting time range:', error)
    return '---'
  }
}

/**
 * محاسبه تفاوت دو تاریخ به دقیقه
 */
export const getTimeDifferenceInMinutes = (startDate, endDate) => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate)
    const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate)
    return differenceInMinutes(end, start)
  } catch (error) {
    console.error('Error calculating time difference:', error)
    return 0
  }
}

/**
 * بررسی آیا تاریخ گذشته است
 */
export const isPastDate = (dateString) => {
  try {
    if (!dateString) return false
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return date < new Date()
  } catch {
    return false
  }
}

/**
 * بررسی آیا امروز است
 */
export const isToday = (dateString) => {
  try {
    if (!dateString) return false
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  } catch {
    return false
  }
}

/**
 * نام روز هفته فارسی
 */
export const getPersianDayName = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
    return days[date.getDay()]
  } catch {
    return '---'
  }
}

/**
 * نام ماه فارسی
 */
export const getPersianMonthName = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const { jm } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
    return months[jm - 1]
  } catch {
    return '---'
  }
}

/**
 * فرمت تاریخ برای input
 */
export const formatDateForInput = (date) => {
  try {
    if (!date) return ''
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

/**
 * فرمت زمان برای input
 */
export const formatTimeForInput = (timeString) => {
  try {
    if (!timeString) return ''
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString
    }
    const date = typeof timeString === 'string' ? parseISO(timeString) : new Date(timeString)
    return format(date, 'HH:mm')
  } catch {
    return ''
  }
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTimeFromMinutes,
  formatTimeRange,
  getTimeDifferenceInMinutes,
  isPastDate,
  isToday,
  getPersianDayName,
  getPersianMonthName,
  formatDateForInput,
  formatTimeForInput
}