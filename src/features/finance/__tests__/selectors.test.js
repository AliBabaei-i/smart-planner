import { describe, it, expect } from 'vitest'
import {
  selectTotalBalance,
  selectMonthlySummary,
  selectKhumsCalculation,
  selectZakatCalculation
} from '../financeSlice'

// ═══════════════════════════════════════════════
// ✅ Mock State
// ═══════════════════════════════════════════════
const createState = (overrides = {}) => ({
  finance: {
    accounts: [],
    transactions: [],
    islamicSettings: {
      khumsYearStart: null,
      khumsPaid: 0,
      goldNisabGrams: 87.48,
      silverNisabGrams: 612.36,
      goldPricePerGram: 5000000,
      silverPricePerGram: 80000
    },
    ...overrides
  }
})

// ═══════════════════════════════════════════════
// ✅ selectTotalBalance
// ═══════════════════════════════════════════════
describe('selectTotalBalance', () => {
  it('باید مجموع موجودی حساب‌های فعال رو برگردونه', () => {
    const state = createState({
      accounts: [
        { id: 'a1', isActive: true, balance: 1000000 },
        { id: 'a2', isActive: true, balance: 500000 },
        { id: 'a3', isActive: false, balance: 2000000 } // ❌ غیرفعال
      ]
    })

    expect(selectTotalBalance(state)).toBe(1500000)
  })

  it('باید صفر برگردونه اگه حسابی نباشه', () => {
    const state = createState()
    expect(selectTotalBalance(state)).toBe(0)
  })
})

// ═══════════════════════════════════════════════
// ✅ selectMonthlySummary
// ═══════════════════════════════════════════════
describe('selectMonthlySummary', () => {
  it('باید درآمد و هزینه ماه رو محاسبه کنه', () => {
    const state = createState({
      transactions: [
        { type: 'income', amount: 5000000, date: '2026-10-15' },
        { type: 'income', amount: 3000000, date: '2026-10-20' },
        { type: 'expense', amount: 2000000, date: '2026-10-18' },
        { type: 'expense', amount: 1000000, date: '2026-10-25' },
        { type: 'expense', amount: 500000, date: '2026-09-15' } // ❌ ماه قبل
      ]
    })

    const result = selectMonthlySummary(state, 2026, 10)

    expect(result.income).toBe(8000000)
    expect(result.expense).toBe(3000000)
    expect(result.net).toBe(5000000)
  })
})

// ═══════════════════════════════════════════════
// ✅ selectKhumsCalculation
// ═══════════════════════════════════════════════
describe('selectKhumsCalculation', () => {
  it('اگه سال خمسی تنظیم نشده، صفر برگردونه', () => {
    const state = createState()
    const result = selectKhumsCalculation(state)

    expect(result.khums).toBe(0)
    expect(result.surplus).toBe(0)
  })

  it('باید خمس ۲۰٪ مازاد رو محاسبه کنه', () => {
    const state = createState({
      islamicSettings: {
        khumsYearStart: '2026-01-01',
        khumsPaid: 0,
        goldNisabGrams: 87.48,
        silverNisabGrams: 612.36,
        goldPricePerGram: 5000000,
        silverPricePerGram: 80000
      },
      transactions: [
        { type: 'income', amount: 500000000, date: '2026-03-15', khumsRelevant: true },
        { type: 'expense', amount: 300000000, date: '2026-05-20' }
      ]
    })

    const result = selectKhumsCalculation(state)

    expect(result.totalIncome).toBe(500000000)
    expect(result.totalExpenses).toBe(300000000)
    expect(result.surplus).toBe(200000000)
    expect(result.khums).toBe(40000000) // 20% از 200M
    expect(result.sahmImam).toBe(20000000)
    expect(result.sahmSadat).toBe(20000000)
  })

  it('نباید درآمد khumsRelevant:false رو حساب کنه', () => {
    const state = createState({
      islamicSettings: {
        khumsYearStart: '2026-01-01',
        khumsPaid: 0,
        goldNisabGrams: 87.48,
        silverNisabGrams: 612.36,
        goldPricePerGram: 5000000,
        silverPricePerGram: 80000
      },
      transactions: [
        { type: 'income', amount: 500000000, date: '2026-03-15', khumsRelevant: true },
        { type: 'income', amount: 100000000, date: '2026-04-15', khumsRelevant: false } // ❌
      ]
    })

    const result = selectKhumsCalculation(state)

    expect(result.totalIncome).toBe(500000000) // نه 600M
  })
})

// ═══════════════════════════════════════════════
// ✅ selectZakatCalculation
// ═══════════════════════════════════════════════
describe('selectZakatCalculation', () => {
  it('اگه طلا/نقره نباشه، صفر برگردونه', () => {
    const state = createState()
    const result = selectZakatCalculation(state)

    expect(result.totalGold).toBe(0)
    expect(result.totalSilver).toBe(0)
    expect(result.total).toBe(0)
  })

  it('اگه طلا زیر نصاب باشه، زکات صفر', () => {
    const state = createState({
      accounts: [
        { id: 'a1', type: 'gold', balance: 50, isActive: true } // زیر 87.48
      ]
    })

    const result = selectZakatCalculation(state)

    expect(result.goldMeetsNisab).toBe(false)
    expect(result.zakatGold).toBe(0)
  })

  it('اگه طلا بالای نصاب باشه، ۲.۵٪ زکات محاسبه بشه', () => {
    const state = createState({
      islamicSettings: {
        goldNisabGrams: 87.48,
        silverNisabGrams: 612.36,
        goldPricePerGram: 5000000,
        silverPricePerGram: 80000,
        khumsYearStart: null,
        khumsPaid: 0
      },
      accounts: [
        { id: 'a1', type: 'gold', balance: 100, isActive: true }
      ]
    })

    const result = selectZakatCalculation(state)

    expect(result.goldMeetsNisab).toBe(true)
    // ✅ ۱۰۰ گرم / ۴۰ = ۲.۵ گرم × ۵M = ۱۲.۵M
    expect(result.zakatGold).toBe(12500000)
  })
})