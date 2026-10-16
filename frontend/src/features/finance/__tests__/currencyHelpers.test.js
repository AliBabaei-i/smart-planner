import { describe, it, expect } from 'vitest'
import {
  toPersianDigits,
  toEnglishDigits,
  formatNumber,
  formatCompact,
  rialToToman,
  tomanToRial,
  convertCurrency,
  formatNumberForInput,
  parseFormattedNumber
} from '../currencyHelpers'

// ═══════════════════════════════════════════════
// ✅ Digits Conversion
// ═══════════════════════════════════════════════
describe('Digits Conversion', () => {
  it('toPersianDigits - باید اعداد انگلیسی رو فارسی کنه', () => {
    expect(toPersianDigits('123')).toBe('۱۲۳')
    expect(toPersianDigits(456)).toBe('۴۵۶')
    expect(toPersianDigits('1,234')).toBe('۱,۲۳۴')
  })

  it('toEnglishDigits - باید اعداد فارسی رو انگلیسی کنه', () => {
    expect(toEnglishDigits('۱۲۳')).toBe('123')
    expect(toEnglishDigits('۴۵۶')).toBe('456')
  })

  it('toPersianDigits - با ورودی خالی', () => {
    expect(toPersianDigits(null)).toBe('')
    expect(toPersianDigits(undefined)).toBe('')
  })
})

// ═══════════════════════════════════════════════
// ✅ formatNumber
// ═══════════════════════════════════════════════
describe('formatNumber', () => {
  it('باید با جداکننده هزارگان نمایش بده (EN)', () => {
    expect(formatNumber(1234567, false)).toBe('1,234,567')
  })

  it('باید با جداکننده هزارگان نمایش بده (FA)', () => {
    expect(formatNumber(1234567, true)).toBe('۱,۲۳۴,۵۶۷')
  })

  it('باید با اعشار نمایش بده اگه عدد اعشاری باشه', () => {
    expect(formatNumber(1234.56, false)).toBe('1,234.56')
  })

  it('باید صفر برای ورودی نامعتبر', () => {
    expect(formatNumber(null, false)).toBe('0')
    expect(formatNumber('abc', false)).toBe('0')
  })
})

// ═══════════════════════════════════════════════
// ✅ formatCompact — بدون اعشار اگه عدد صحیح باشه
// ═══════════════════════════════════════════════
describe('formatCompact', () => {
  it('هزار (EN) — عدد صحیح', () => {
    expect(formatCompact(5000, false)).toBe('5 K')
  })

  it('هزار (EN) — با اعشار', () => {
    expect(formatCompact(5500, false)).toBe('5.5 K')
  })

  it('میلیون (EN) — عدد صحیح', () => {
    expect(formatCompact(5000000, false)).toBe('5 M')
  })

  it('میلیون (EN) — با اعشار', () => {
    expect(formatCompact(5500000, false)).toBe('5.5 M')
  })

  it('میلیارد (EN) — عدد صحیح', () => {
    expect(formatCompact(5000000000, false)).toBe('5 B')
  })

  it('تریلیون (EN) — عدد صحیح', () => {
    expect(formatCompact(5000000000000, false)).toBe('5 T')
  })

  it('هزار (FA) — کلمات فارسی', () => {
    expect(formatCompact(5000, true)).toContain('هزار')
  })

  it('میلیون (FA) — کلمات فارسی', () => {
    expect(formatCompact(5000000, true)).toContain('میلیون')
  })

  it('میلیارد (FA) — کلمات فارسی', () => {
    expect(formatCompact(5000000000, true)).toContain('میلیارد')
  })

  it('عدد کوچک بدون پسوند', () => {
    expect(formatCompact(500, false)).toBe('500')
  })

  it('صفر', () => {
    expect(formatCompact(0, false)).toBe('0')
  })

  it('ورودی نامعتبر', () => {
    expect(formatCompact(null, false)).toBe('0')
    expect(formatCompact(undefined, false)).toBe('0')
    expect(formatCompact('abc', false)).toBe('0')
  })
})

// ═══════════════════════════════════════════════
// ✅ Rial/Toman
// ═══════════════════════════════════════════════
describe('Rial ↔ Toman', () => {
  it('rialToToman', () => {
    expect(rialToToman(100000)).toBe(10000)
    expect(rialToToman(5000)).toBe(500)
  })

  it('tomanToRial', () => {
    expect(tomanToRial(10000)).toBe(100000)
    expect(tomanToRial(500)).toBe(5000)
  })
})

// ═══════════════════════════════════════════════
// ✅ convertCurrency
// ═══════════════════════════════════════════════
describe('convertCurrency', () => {
  const rates = { USD: 600000, EUR: 650000 }

  it('همون ارز → همون مقدار', () => {
    expect(convertCurrency(1000, 'IRR', 'IRR', rates)).toBe(1000)
  })

  it('IRR → IRT', () => {
    expect(convertCurrency(100000, 'IRR', 'IRT', rates)).toBe(10000)
  })

  it('IRT → IRR', () => {
    expect(convertCurrency(10000, 'IRT', 'IRR', rates)).toBe(100000)
  })

  it('USD → IRR', () => {
    expect(convertCurrency(100, 'USD', 'IRR', rates)).toBe(60000000)
  })

  it('IRR → USD', () => {
    expect(convertCurrency(60000000, 'IRR', 'USD', rates)).toBe(100)
  })
})

// ═══════════════════════════════════════════════
// ✅ Input Formatting
// ═══════════════════════════════════════════════
describe('formatNumberForInput', () => {
  it('باید جداکننده هزارگان اضافه کنه حین تایپ', () => {
    expect(formatNumberForInput('1000', false)).toBe('1,000')
    expect(formatNumberForInput('1000000', false)).toBe('1,000,000')
  })

  it('باید با اعشار کار کنه', () => {
    expect(formatNumberForInput('1234.56', false)).toBe('1,234.56')
  })

  it('باید اعداد فارسی رو تبدیل کنه', () => {
    expect(formatNumberForInput('۱۲۳۴', false)).toBe('1,234')
  })
})

describe('parseFormattedNumber', () => {
  it('باید رشته فرمت‌شده رو به عدد تبدیل کنه', () => {
    expect(parseFormattedNumber('1,234,567')).toBe(1234567)
    expect(parseFormattedNumber('۱,۲۳۴')).toBe(1234)
  })

  it('باید ورودی نامعتبر رو صفر کنه', () => {
    expect(parseFormattedNumber('')).toBe(0)
    expect(parseFormattedNumber(null)).toBe(0)
    expect(parseFormattedNumber('abc')).toBe(0)
  })
})