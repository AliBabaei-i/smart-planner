// ═══════════════════════════════════════════════
// ✅ Typeهای ماژول Finance
// ═══════════════════════════════════════════════

import type { ID, ISODate, DateStr, TimeStr } from './common'

// ✅ حساب‌ها
export type AccountType =
  | 'bank'
  | 'cash'
  | 'gold'
  | 'silver'
  | 'crypto'
  | 'stock'
  | 'property'
  | 'other'

export type CurrencyCode = 'IRR' | 'IRT' | 'USD' | 'EUR' | 'GOLD_GRAM' | 'SILVER_GRAM'

export interface Account {
  id: ID
  name: string
  type: AccountType
  currency: CurrencyCode
  balance: number
  color: string
  isActive: boolean
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

// ✅ تراکنش‌ها
export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Transaction {
  id: ID
  accountId: ID
  type: TransactionType
  amount: number
  currency: CurrencyCode
  category: string
  subcategory?: string | null
  description: string
  date: DateStr
  time?: TimeStr | null
  tags: string[]
  toAccountId?: ID | null
  toAmount?: number | null
  khumsRelevant: boolean
  zakatRelevant: boolean
  taskId?: ID | null
  projectId?: ID | null
  planId?: ID | null
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

// ✅ پلن‌ها (وام، بدهی، اقساط)
export type PlanType = 'debt' | 'credit' | 'loan' | 'installment'
export type Periodicity = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Plan {
  id: ID
  type: PlanType
  title: string
  description: string
  totalAmount: number
  currency: CurrencyCode
  startDate: DateStr
  installmentsCount: number
  installmentAmount: number | null
  lastInstallmentAmount: number | null
  periodicity: Periodicity
  accountId?: ID | null
  counterparty: string
  termsLocked: boolean
  isActive: boolean
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface PlanDue {
  id: ID
  planId: ID
  index: number
  dueDate: DateStr
  amount: number
  currency: CurrencyCode
  isLast: boolean
  paid?: boolean
  paidDate?: DateStr
  paidAmount?: number
  transactionId?: ID | null
  notes?: string
  createdAt?: ISODate     
  updatedAt?: ISODate
}

// ✅ بودجه‌ها
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Budget {
  id: ID
  category: string
  amount: number
  currency: CurrencyCode
  period: BudgetPeriod
  startDate: DateStr
  endDate: DateStr
  rollover: boolean
  isActive: boolean
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

// ✅ دسته‌بندی‌ها
export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Categories {
  income: Category[]
  expense: Category[]
}

// ✅ تنظیمات اسلامی
export interface IslamicSettings {
  khumsYearStart: DateStr | null
  khumsCalculated: number
  khumsPaid: number
  sahmImam: number
  sahmSadat: number
  goldNisabGrams: number
  silverNisabGrams: number
  goldPricePerGram: number
  silverPricePerGram: number
  showKhumsWidget: boolean
  showZakatWidget: boolean
  warnOnInterest: boolean
}

// ✅ تنظیمات ارز
export interface CurrencySettings {
  baseCurrency: CurrencyCode
  displayCurrency: CurrencyCode
  rates: Record<string, number>
  lastUpdated: ISODate
}

// ✅ تنظیمات کل ماژول
export interface FinanceSettings {
  defaultAccountId: ID | null
  startOfWeek: number
  numberFormat: 'fa' | 'en'
  dateFormat: 'jalali' | 'gregorian'
}

// ✅ State کامل finance
export interface FinanceState {
  accounts: Account[]
  transactions: Transaction[]
  plans: Plan[]
  planDues: PlanDue[]
  budgets: Budget[]
  categories: Categories
  islamicSettings: IslamicSettings
  currencySettings: CurrencySettings
  settings: FinanceSettings
  loading: boolean
  error: string | null
}

// ✅ محاسبات
export interface KhumsCalculation {
  surplus: number
  khums: number
  sahmImam: number
  sahmSadat: number
  totalIncome: number
  totalExpenses: number
}

export interface ZakatCalculation {
  totalGold: number
  totalSilver: number
  zakatGold: number
  zakatSilver: number
  total: number
  goldMeetsNisab: boolean
  silverMeetsNisab: boolean
}

export interface BudgetProgress {
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
  isNearLimit: boolean
}

export interface MonthlySummary {
  income: number
  expense: number
  net: number
}

// ✅ APIهای بک‌اند
export interface MarketPrices {
  gold18kRial: number
  silverRial: number
  usdRial: number
  fetchedAt: ISODate
}