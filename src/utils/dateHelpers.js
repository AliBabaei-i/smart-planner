import { 
  format, 
  parseISO, 
  formatDistanceToNow, 
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  isSameWeek as isSameWeekFn,
  isSameMonth as isSameMonthFn,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInMinutes,
  differenceInHours,
  differenceInDays
} from 'date-fns'
// حذف import fa و استفاده از تنظیمات فارسی به صورت دستی

// تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (number) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return number.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

// تبدیل اعداد فارسی به انگلیسی
const toEnglishDigits = (persianNumber) => {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  
  return persianNumber.toString().replace(/[۰-۹]/g, (digit) => {
    const index = persianDigits.indexOf(digit)
    return englishDigits[index]
  })
}

// تنظیمات فارسی برای تاریخ‌ها
const persianLocale = {
  formatRelative: (token) => {
    const relativeTimeFormat = {
      lessThanXSeconds: 'کمتر از {{count}} ثانیه',
      xSeconds: '{{count}} ثانیه',
      halfAMinute: 'نیم دقیقه',
      lessThanXMinutes: 'کمتر از {{count}} دقیقه',
      xMinutes: '{{count}} دقیقه',
      aboutXHours: 'حدود {{count}} ساعت',
      xHours: '{{count}} ساعت',
      xDays: '{{count}} روز',
      aboutXWeeks: 'حدود {{count}} هفته',
      xWeeks: '{{count}} هفته',
      aboutXMonths: 'حدود {{count}} ماه',
      xMonths: '{{count}} ماه',
      aboutXYears: 'حدود {{count}} سال',
      xYears: '{{count}} سال',
      overXYears: 'بیش از {{count}} سال',
      almostXYears: 'نزدیک {{count}} سال'
    }
    return relativeTimeFormat[token]
  }
}

/**
 * فرمت تاریخ به صورت فارسی (۱۴۰۲/۱۰/۱۵)
 */
export const formatDate = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const formatted = format(date, 'yyyy/MM/dd')
    return toPersianDigits(formatted)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'تاریخ نامعتبر'
  }
}

/**
 * فرمت تاریخ و زمان به صورت فارسی (۱۴۰۲/۱۰/۱۵ - ۱۴:۳۰)
 */
export const formatDateTime = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const formatted = format(date, 'yyyy/MM/dd - HH:mm')
    return toPersianDigits(formatted)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return 'تاریخ نامعتبر'
  }
}

/**
 * نمایش زمان نسبی (مثلاً "۲ روز پیش")
 */
export const formatRelativeTime = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    
    // ✅ محاسبه دستی برای جلوگیری از خطا
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    const toPersianDigits = (str) => str.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
    
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
 * فرمت بازه زمانی (مثلاً "۰۸:۰۰ - ۱۰:۳۰")
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
    
    return `${toPersianDigits(start)} - ${toPersianDigits(end)}`
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
 * بررسی آیا تاریخ در گذشته است
 */
export const isPastDate = (dateString) => {
  try {
    if (!dateString) return false
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return date < new Date()
  } catch (error) {
    console.error('Error checking past date:', error)
    return false
  }
}

/**
 * بررسی آیا تاریخ امروز است
 */
export const isToday = (dateString) => {
  try {
    if (!dateString) return false
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return isSameDay(date, new Date())
  } catch (error) {
    console.error('Error checking today:', error)
    return false
  }
}

/**
 * گرفتن نام روز هفته به فارسی
 */
export const getPersianDayName = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const day = date.getDay()
    
    const days = [
      'یکشنبه',
      'دوشنبه',
      'سه‌شنبه',
      'چهارشنبه',
      'پنجشنبه',
      'جمعه',
      'شنبه'
    ]
    
    return days[day]
  } catch (error) {
    console.error('Error getting day name:', error)
    return '---'
  }
}

/**
 * گرفتن نام ماه به فارسی
 */
export const getPersianMonthName = (dateString) => {
  try {
    if (!dateString) return '---'
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const month = date.getMonth()
    
    const months = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند'
    ]
    
    return months[month]
  } catch (error) {
    console.error('Error getting month name:', error)
    return '---'
  }
}

/**
 * تولید آرایه‌ای از تاریخ‌های یک هفته
 */
export const getWeekDates = (startDate = new Date()) => {
  try {
    const start = startOfWeek(new Date(startDate), { weekStartsOn: 6 }) // شروع از شنبه
    const end = endOfWeek(new Date(startDate), { weekStartsOn: 6 })
    
    return eachDayOfInterval({
      start,
      end
    })
  } catch (error) {
    console.error('Error getting week dates:', error)
    return []
  }
}

/**
 * تولید آرایه‌ای از تاریخ‌های یک ماه
 */
export const getMonthDates = (date = new Date()) => {
  try {
    const start = startOfMonth(new Date(date))
    const end = endOfMonth(new Date(date))
    
    return eachDayOfInterval({
      start,
      end
    })
  } catch (error) {
    console.error('Error getting month dates:', error)
    return []
  }
}

/**
 * فرمت تاریخ برای input type="date"
 */
export const formatDateForInput = (date) => {
  try {
    if (!date) return ''
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'yyyy-MM-dd')
  } catch (error) {
    console.error('Error formatting date for input:', error)
    return ''
  }
}

/**
 * فرمت زمان برای input type="time"
 */
export const formatTimeForInput = (timeString) => {
  try {
    if (!timeString) return ''
    
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString
    }
    
    const date = typeof timeString === 'string' ? parseISO(timeString) : new Date(timeString)
    return format(date, 'HH:mm')
  } catch (error) {
    console.error('Error formatting time for input:', error)
    return ''
  }
}

/**
 * ایجاد تاریخ از رشته‌های تاریخ و زمان
 */
export const createDateFromStrings = (dateString, timeString) => {
  try {
    if (!dateString) return null
    
    let date = new Date(dateString)
    
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number)
      date.setHours(hours, minutes, 0, 0)
    }
    
    return date
  } catch (error) {
    console.error('Error creating date from strings:', error)
    return null
  }
}

/**
 * محاسبه سن بر اساس تاریخ تولد
 */
export const calculateAge = (birthDateString) => {
  try {
    if (!birthDateString) return 0
    const birthDate = typeof birthDateString === 'string' ? parseISO(birthDateString) : new Date(birthDateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    console.error('Error calculating age:', error)
    return 0
  }
}

/**
 * بررسی آیا دو تاریخ در یک هفته هستند
 */
export const isSameWeek = (date1, date2) => {
  try {
    if (!date1 || !date2) return false
    const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1)
    const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2)
    return isSameWeekFn(d1, d2, { weekStartsOn: 6 })
  } catch (error) {
    console.error('Error checking same week:', error)
    return false
  }
}

/**
 * بررسی آیا دو تاریخ در یک ماه هستند
 */
export const isSameMonth = (date1, date2) => {
  try {
    if (!date1 || !date2) return false
    const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1)
    const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2)
    return isSameMonthFn(d1, d2)
  } catch (error) {
    console.error('Error checking same month:', error)
    return false
  }
}

/**
 * اضافه کردن روز به تاریخ
 */
export const addDaysToDate = (dateString, days) => {
  try {
    if (!dateString) return null
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return addDays(date, days)
  } catch (error) {
    console.error('Error adding days to date:', error)
    return null
  }
}

/**
 * گرفتن تاریخ شروع و پایان هفته
 */
export const getWeekRange = (date = new Date()) => {
  try {
    const start = startOfWeek(new Date(date), { weekStartsOn: 6 })
    const end = endOfWeek(new Date(date), { weekStartsOn: 6 })
    
    return {
      start,
      end,
      startFormatted: formatDate(start),
      endFormatted: formatDate(end)
    }
  } catch (error) {
    console.error('Error getting week range:', error)
    return { start: new Date(), end: new Date(), startFormatted: '', endFormatted: '' }
  }
}
export const getTodayStr = () => getLocalDateStr(new Date())
// Export default برای راحتی استفاده
export default {
  toPersianDigits,
  toEnglishDigits,
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
  getWeekDates,
  getMonthDates,
  formatDateForInput,
  formatTimeForInput,
  createDateFromStrings,
  calculateAge,
  isSameWeek,
  isSameMonth,
  addDaysToDate,
  getWeekRange
}