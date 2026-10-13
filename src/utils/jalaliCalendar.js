import { toJalaali, toGregorian, jalaaliMonthLength, isLeapJalaaliYear } from 'jalaali-js'

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
export const PERSIAN_WEEKDAYS_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

export const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const ENGLISH_WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const ENGLISH_WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * دریافت اطلاعات کامل یک روز از تقویم شمسی
 */
export const getJalaliDayInfo = (gregorianDate) => {
  const date = new Date(gregorianDate)
  const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return { jy, jm, jd }
}

/**
 * تبدیل تاریخ شمسی به میلادی (Date object)
 */
export const jalaliToDate = (jy, jm, jd) => {
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

/**
 * گرفتن تعداد روزهای ماه شمسی
 */
export const getJalaliMonthLength = (jy, jm) => {
  return jalaaliMonthLength(jy, jm)
}

/**
 * گرفتن ایندکس روز هفته برای اول ماه شمسی
 * 0 = شنبه (Saturday)
 */
export const getFirstDayOfJalaliMonth = (jy, jm) => {
  const firstDay = jalaliToDate(jy, jm, 1)
  // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
  // تبدیل به: 0=Saturday, 1=Sunday, ..., 6=Friday
  const jsDay = firstDay.getDay()
  return (jsDay + 1) % 7
}

/**
 * ساخت آرایه‌ای از روزهای یک ماه (برای نمایش در Calendar)
 */
export const getMonthGrid = (jy, jm) => {
  const monthLength = getJalaliMonthLength(jy, jm)
  const firstDayIndex = getFirstDayOfJalaliMonth(jy, jm)
  
  const grid = []
  // روزهای خالی اول ماه
  for (let i = 0; i < firstDayIndex; i++) {
    grid.push({ empty: true, key: `empty-start-${i}` })
  }
  // روزهای ماه
  for (let day = 1; day <= monthLength; day++) {
    const date = jalaliToDate(jy, jm, day)
    grid.push({
      empty: false,
      day,
      date,
      dateStr: formatDateStr(date),
      key: `day-${day}`
    })
  }
  // پر کردن آخر هفته اگه لازمه
  const remaining = 7 - (grid.length % 7)
  if (remaining < 7) {
    for (let i = 0; i < remaining; i++) {
      grid.push({ empty: true, key: `empty-end-${i}` })
    }
  }
  return grid
}

/**
 * فرمت تاریخ به صورت YYYY-MM-DD (محلی، بدون UTC)
 */
export const formatDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * امروز به صورت YYYY-MM-DD محلی
 */
export const getTodayStr = () => formatDateStr(new Date())

/**
 * نام ماه شمسی
 */
export const getPersianMonthName = (jm) => PERSIAN_MONTHS[jm - 1]

/**
 * نام ماه میلادی
 */
export const getEnglishMonthName = (gm) => ENGLISH_MONTHS[gm - 1]

export default {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  PERSIAN_WEEKDAYS_FULL,
  ENGLISH_MONTHS,
  ENGLISH_WEEKDAYS_SHORT,
  ENGLISH_WEEKDAYS_FULL,
  getJalaliDayInfo,
  jalaliToDate,
  getJalaliMonthLength,
  getFirstDayOfJalaliMonth,
  getMonthGrid,
  formatDateStr,
  getTodayStr,
  getPersianMonthName,
  getEnglishMonthName
}