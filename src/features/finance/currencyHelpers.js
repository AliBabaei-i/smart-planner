// ═══════════════════════════════════════════════
// ✅ توابع کمکی برای کار با ارزها
// ═══════════════════════════════════════════════

export const CURRENCY_META = {
  IRR: { label: 'ریال', symbol: 'ریال', decimals: 0 },
  IRT: { label: 'تومان', symbol: 'تومان', decimals: 0 },
  USD: { label: 'دلار', symbol: '$', decimals: 2 },
  EUR: { label: 'یورو', symbol: '€', decimals: 2 },
  GOLD_GRAM: { label: 'گرم طلا', symbol: 'گرم', decimals: 4 },
  SILVER_GRAM: { label: 'گرم نقره', symbol: 'گرم', decimals: 4 }
}

// ✅ واحدهای فارسی
const PERSIAN_UNITS = [
  { value: 1e12, label: 'تریلیون' },
  { value: 1e9, label: 'میلیارد' },
  { value: 1e6, label: 'میلیون' },
  { value: 1e3, label: 'هزار' }
]

// ✅ واحدهای انگلیسی
const ENGLISH_UNITS = [
  { value: 1e12, label: 'T' },
  { value: 1e9, label: 'B' },
  { value: 1e6, label: 'M' },
  { value: 1e3, label: 'K' }
]

// ✅ تبدیل اعداد به فارسی
export const toPersianDigits = (str) => {
  if (str === null || str === undefined) return ''
  return str.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
}

// ✅ تبدیل اعداد فارسی به انگلیسی
export const toEnglishDigits = (str) => {
  if (!str) return ''
  return str.toString().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
}

// ✅ فرمت عدد با جداکننده هزارگان
export const formatNumber = (num, isPersian = true, decimals = null) => {
  if (num === null || num === undefined || num === '' || isNaN(num)) {
    return isPersian ? '۰' : '0'
  }
  
  const numValue = Number(num)
  const finalDecimals = decimals !== null 
    ? decimals 
    : (Number.isInteger(numValue) ? 0 : 2)
  
  const formatted = numValue.toLocaleString('en-US', {
    minimumFractionDigits: finalDecimals,
    maximumFractionDigits: finalDecimals
  })
  
  return isPersian ? toPersianDigits(formatted) : formatted
}

// ✅ فرمت خلاصه با واحدهای فارسی/انگلیسی
export const formatCompact = (num, isPersian = true) => {
  if (num === null || num === undefined || num === '' || isNaN(num)) {
    return isPersian ? '۰' : '0'
  }
  
  const n = Number(num)
  const abs = Math.abs(n)
  const units = isPersian ? PERSIAN_UNITS : ENGLISH_UNITS
  
  for (const unit of units) {
    if (abs >= unit.value) {
      const value = n / unit.value
      // ✅ اگه اعشار صفر باشه، نشونش نده
      const formatted = Number.isInteger(value) 
        ? value.toString() 
        : value.toFixed(1)
      
      const finalValue = isPersian ? toPersianDigits(formatted) : formatted
      return `${finalValue} ${unit.label}`
    }
  }
  
  // ✅ اعداد کوچک - با جداکننده هزارگان
  const formatted = n.toLocaleString('en-US', {
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2
  })
  return isPersian ? toPersianDigits(formatted) : formatted
}

// ✅ تبدیل ریال ↔ تومان
export const rialToToman = (rial) => Math.floor(Number(rial) / 10)
export const tomanToRial = (toman) => Number(toman) * 10

// ✅ تبدیل بین ارزها با نرخ
export const convertCurrency = (amount, fromCurrency, toCurrency, rates = {}) => {
  if (!amount || fromCurrency === toCurrency) return amount || 0
  
  const amountNum = Number(amount)
  
  // ✅ اول به IRR (پایه)
  let inBase = amountNum
  if (fromCurrency === 'IRT') {
    inBase = tomanToRial(amountNum)
  } else if (fromCurrency !== 'IRR' && rates[fromCurrency]) {
    inBase = amountNum * rates[fromCurrency]
  }
  
  // ✅ از IRR به ارز هدف
  if (toCurrency === 'IRR') return inBase
  if (toCurrency === 'IRT') return rialToToman(inBase)
  if (rates[toCurrency]) return inBase / rates[toCurrency]
  
  return inBase
}

// ✅ فرمت‌دهی کامل با واحد
export const formatCurrency = (amount, currency = 'IRR', isPersian = true) => {
  const meta = CURRENCY_META[currency] || CURRENCY_META.IRR
  const formatted = formatNumber(amount, isPersian, meta.decimals)
  
  if (currency === 'IRR' || currency === 'IRT') {
    return `${formatted} ${meta.label}`
  }
  
  return `${meta.symbol}${formatted}`
}

// ✅ فرمت عدد برای input (با جداکننده هزارگان در لحظه تایپ)
export const formatNumberForInput = (value, isPersian = false) => {
  if (value === null || value === undefined || value === '') return ''
  
  // ✅ حذف هر چیز غیر از عدد و نقطه اعشار
  const cleanValue = toEnglishDigits(value.toString()).replace(/[^\d.]/g, '')
  
  // ✅ اگه خالی شد
  if (!cleanValue) return ''
  
  // ✅ جدا کردن بخش صحیح و اعشاری
  const parts = cleanValue.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // ✅ جداکننده هزارگان روی بخش صحیح
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // ✅ ترکیب با اعشار (اگه بود)
  let result = formattedInteger
  if (decimalPart !== undefined) {
    result = `${formattedInteger}.${decimalPart}`
  }
  
  return isPersian ? toPersianDigits(result) : result
}

// ✅ حذف جداکننده‌ها برای تبدیل به عدد
export const parseFormattedNumber = (value) => {
  if (!value) return 0
  const cleaned = toEnglishDigits(value.toString()).replace(/,/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// ✅ رنگ برای نوع تراکنش
export const getTransactionColor = (type) => {
  switch (type) {
    case 'income': return 'text-green-600 dark:text-green-400'
    case 'expense': return 'text-red-600 dark:text-red-400'
    case 'transfer': return 'text-blue-600 dark:text-blue-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

// ✅ علامت (+/-)
export const getTransactionSign = (type) => {
  switch (type) {
    case 'income': return '+'
    case 'expense': return '−'
    case 'transfer': return '↔'
    default: return ''
  }
}

export default {
  CURRENCY_META,
  toPersianDigits,
  toEnglishDigits,
  formatNumber,
  formatCompact,
  rialToToman,
  tomanToRial,
  convertCurrency,
  formatCurrency,
  formatNumberForInput,
  parseFormattedNumber,
  getTransactionColor,
  getTransactionSign
}