import { describe, it, expect } from 'vitest'
import {
  calculateKhums,
  calculateZakat,
  ZAKAT_NISAB
} from '../islamicFinance'

// ═══════════════════════════════════════════════
// ✅ calculateKhums
// ═══════════════════════════════════════════════
describe('calculateKhums', () => {
  it('باید ۲۰٪ مازاد رو محاسبه کنه', () => {
    const result = calculateKhums(500000000, 300000000)

    expect(result.surplus).toBe(200000000)
    expect(result.khums).toBe(40000000)
    expect(result.sahmImam).toBe(20000000)
    expect(result.sahmSadat).toBe(20000000)
  })

  it('اگه مخارج بیشتر از درآمد باشه، خمس صفر', () => {
    const result = calculateKhums(300000000, 500000000)

    expect(result.surplus).toBe(0)
    expect(result.khums).toBe(0)
  })

  it('باید با ورودی نامعتبر کنار بیاد', () => {
    expect(calculateKhums(null, undefined).khums).toBe(0)
    expect(calculateKhums('abc', 'def').khums).toBe(0)
  })
})

// ═══════════════════════════════════════════════
// ✅ calculateZakat
// ═══════════════════════════════════════════════
describe('calculateZakat', () => {
  it('طلا زیر نصاب: صفر', () => {
    const result = calculateZakat(50, 0, 5000000, 80000)

    expect(result.goldMeetsNisab).toBe(false)
    expect(result.zakatGold).toBe(0)
  })

  it('طلا بالای نصاب: ۲.۵٪', () => {
    const result = calculateZakat(100, 0, 5000000, 80000)

    expect(result.goldMeetsNisab).toBe(true)
    // ✅ ۱۰۰ / ۴۰ = ۲.۵ گرم × ۵M = ۱۲.۵M
    expect(result.zakatGold).toBe(12500000)
  })

  it('نقره زیر نصاب: صفر', () => {
    const result = calculateZakat(0, 500, 5000000, 80000)

    expect(result.silverMeetsNisab).toBe(false)
    expect(result.zakatSilver).toBe(0)
  })

  it('نقره بالای نصاب: ۲.۵٪', () => {
    const result = calculateZakat(0, 700, 5000000, 80000)

    expect(result.silverMeetsNisab).toBe(true)
    // ✅ ۷۰۰ / ۴۰ = ۱۷.۵ گرم × ۸۰K = ۱.۴M
    expect(result.zakatSilver).toBe(1400000)
  })

  it('مجموع زکات طلا + نقره', () => {
    const result = calculateZakat(100, 700, 5000000, 80000)

    expect(result.total).toBe(12500000 + 1400000)
  })
})

// ═══════════════════════════════════════════════
// ✅ ZAKAT_NISAB Constants
// ═══════════════════════════════════════════════
describe('ZAKAT_NISAB', () => {
  it('نصاب طلا ۸۷.۴۸ گرم', () => {
    expect(ZAKAT_NISAB.goldGrams).toBe(87.48)
  })

  it('نصاب نقره ۶۱۲.۳۶ گرم', () => {
    expect(ZAKAT_NISAB.silverGrams).toBe(612.36)
  })

  it('نرخ زکات ۲.۵٪ (۱/۴۰)', () => {
    expect(ZAKAT_NISAB.zakatRate).toBe(1 / 40)
  })
})