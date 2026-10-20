// ═══════════════════════════════════════════════
// ✅ محاسبات مالی اسلامی (فقه تشیع)
// ═══════════════════════════════════════════════

import type { KhumsCalculation, ZakatCalculation } from '../../types/finance'

/**
 * محاسبه خمس
 * خمس = ۲۰٪ از مازاد درآمد سالانه
 */
export const calculateKhums = (totalIncome: number, totalExpenses: number): KhumsCalculation => {
  const income = Number(totalIncome) || 0
  const expenses = Number(totalExpenses) || 0
  
  const surplus = Math.max(0, income - expenses)
  const khums = surplus * 0.2
  
  return {
    totalIncome: income,
    totalExpenses: expenses,
    surplus,
    khums,
    sahmImam: khums / 2,
    sahmSadat: khums / 2
  }
}

/**
 * نصاب‌های شرعی
 */
export const ZAKAT_NISAB = {
  goldGrams: 87.48,      // ۲۰ دینار
  silverGrams: 612.36,   // ۲۰۰ درهم
  zakatRate: 1 / 40      // ۲.۵٪
} as const

/**
 * محاسبه زکات طلا و نقره
 */
export const calculateZakat = (
  goldGrams: number, 
  silverGrams: number, 
  goldPrice: number, 
  silverPrice: number
): ZakatCalculation => {
  const gold = Number(goldGrams) || 0
  const silver = Number(silverGrams) || 0
  const goldPriceNum = Number(goldPrice) || 0
  const silverPriceNum = Number(silverPrice) || 0
  
  let zakatGold = 0
  let zakatSilver = 0
  
  if (gold >= ZAKAT_NISAB.goldGrams) {
    zakatGold = gold * ZAKAT_NISAB.zakatRate * goldPriceNum
  }
  
  if (silver >= ZAKAT_NISAB.silverGrams) {
    zakatSilver = silver * ZAKAT_NISAB.zakatRate * silverPriceNum
  }
  
  return {
    totalGold: gold,
    totalSilver: silver,
    goldMeetsNisab: gold >= ZAKAT_NISAB.goldGrams,
    silverMeetsNisab: silver >= ZAKAT_NISAB.silverGrams,
    zakatGold,
    zakatSilver,
    total: zakatGold + zakatSilver
  }
}

// ═══════════════════════════════════════════════
// ✅ حرمت ربا
// ═══════════════════════════════════════════════
export const INTEREST_WARNING_MESSAGE = 
  '⚠️ توجه: دریافت یا پرداخت سود (ربا) در اسلام حرام است. ' +
  'اگر این مبلغ شامل سود قرض یا وام ربوی است، لطفاً با دقت بررسی کنید. ' +
  'برای جایگزین شرعی، می‌توانید از عقود اسلامی مثل مضاربه، مشارکت یا مرابحه استفاده کنید.'

export const isInterestWarning = (category: string) => {
  return category === 'interest' || category === 'riba'
}