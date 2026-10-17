import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js'

export const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
export const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
export const PERSIAN_WEEKDAYS_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
export const ENGLISH_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const ENGLISH_WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const ENGLISH_WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const getJalaliDayInfo = (gregorianDate: Date | string) => {
  const date = new Date(gregorianDate)
  return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export const jalaliToDate = (jy: number, jm: number, jd: number): Date => {
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

export const getJalaliMonthLength = (jy: number, jm: number): number => jalaaliMonthLength(jy, jm)

export const getFirstDayOfJalaliMonth = (jy: number, jm: number): number => {
  const firstDay = jalaliToDate(jy, jm, 1)
  return (firstDay.getDay() + 1) % 7
}

export interface CalendarGridItem {
  empty: boolean
  day?: number
  date?: Date
  dateStr?: string
  key: string
}

export const getMonthGrid = (jy: number, jm: number): CalendarGridItem[] => {
  const monthLength = getJalaliMonthLength(jy, jm)
  const firstDayIndex = getFirstDayOfJalaliMonth(jy, jm)
  const grid: CalendarGridItem[] = []

  for (let i = 0; i < firstDayIndex; i++) {
    grid.push({ empty: true, key: `empty-start-${i}` })
  }

  for (let day = 1; day <= monthLength; day++) {
    const date = jalaliToDate(jy, jm, day)
    grid.push({ empty: false, day, date, dateStr: formatDateStr(date), key: `day-${day}` })
  }

  const remaining = 7 - (grid.length % 7)
  if (remaining < 7) {
    for (let i = 0; i < remaining; i++) {
      grid.push({ empty: true, key: `empty-end-${i}` })
    }
  }
  return grid
}

export const formatDateStr = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const getTodayStr = (): string => formatDateStr(new Date())
export const getPersianMonthName = (jm: number): string => PERSIAN_MONTHS[jm - 1]
export const getEnglishMonthName = (gm: number): string => ENGLISH_MONTHS[gm - 1]