export interface KhumsResult {
  totalIncome: number
  totalExpenses: number
  surplus: number
  khums: number
  sahmImam: number
  sahmSadat: number
}

export const calculateKhums = (totalIncome: number, totalExpenses: number): KhumsResult => {
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

export const ZAKAT_NISAB = {
  goldGrams: 87.48,
  silverGrams: 612.36,
  zakatRate: 1 / 40
}

export interface ZakatResult {
  goldGrams: number
  silverGrams: number
  goldMeetsNisab: boolean
  silverMeetsNisab: boolean
  zakatGold: number
  zakatSilver: number
  total: number
}

export const calculateZakat = (goldGrams: number, silverGrams: number, goldPrice: number, silverPrice: number): ZakatResult => {
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
    goldGrams: gold,
    silverGrams: silver,
    goldMeetsNisab: gold >= ZAKAT_NISAB.goldGrams,
    silverMeetsNisab: silver >= ZAKAT_NISAB.silverGrams,
    zakatGold,
    zakatSilver,
    total: zakatGold + zakatSilver
  }
}

export const RED_MAZALIM_TYPES = {
  unknown_owner: 'مالی که صاحبش معلوم نیست',
  mixed_halal_haram: 'مال حلال مخلوط به حرام',
  debt_to_unknown: 'بدهی به شخص نامعلوم',
  interest_repentance: 'توبه از ربا'
}

export const INTEREST_WARNING_MESSAGE = '⚠️ توجه: دریافت یا پرداخت سود (ربا) در اسلام حرام است...'
export const isInterestWarning = (category: string): boolean => ['interest', 'riba'].includes(category)
export const SADAT_INFO = {
  who: 'سیدهایی که از طرف پدر به هاشم (جد پیامبر) منتسب هستند',
  share: 'نصف خمس (بعد از کسر سهم امام ع)',
  howToPay: 'باید به سید فقیر یا یتیم سید داده بشه — با اجازه مرجع تقلید'
}

export const formatKhumsReport = (calc: KhumsResult) => ({
  income: calc.totalIncome,
  expenses: calc.totalExpenses,
  surplus: calc.surplus,
  khums: calc.khums,
  sahmImam: calc.sahmImam,
  sahmSadat: calc.sahmSadat,
  summary: `خمس قابل پرداخت: ${calc.khums.toLocaleString('fa-IR')} ریال`
})