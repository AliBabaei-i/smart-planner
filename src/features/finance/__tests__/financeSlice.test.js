import { describe, it, expect, beforeEach } from 'vitest'
import reducer, {
  addAccount,
  updateAccount,
  deleteAccount,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addPlan,
  updatePlan,
  deletePlan,
  payPlanDue,
  addBudget,
  updateBudget,
  deleteBudget,
  addCategory,
  updateCategory,
  deleteCategory,
  updateIslamicSettings,
  payKhums,
  updateCurrencyRates,
  importFinanceData,
  resetFinance
} from '../financeSlice'

// ═══════════════════════════════════════════════
// ✅ State اولیه
// ═══════════════════════════════════════════════
const getEmptyState = () => ({
  accounts: [],
  transactions: [],
  plans: [],
  planDues: [],
  budgets: [],
  categories: { income: [], expense: [] },
  islamicSettings: {
    khumsYearStart: null,
    khumsPaid: 0,
    goldNisabGrams: 87.48,
    silverNisabGrams: 612.36,
    goldPricePerGram: 5000000,
    silverPricePerGram: 80000
  },
  currencySettings: {
    baseCurrency: 'IRR',
    rates: { USD: 600000 }
  },
  settings: {},
  loading: false,
  error: null
})

// ═══════════════════════════════════════════════
// ✅ Accounts
// ═══════════════════════════════════════════════
describe('Accounts', () => {
  let state

  beforeEach(() => {
    state = getEmptyState()
  })

  it('addAccount - باید حساب جدید اضافه کنه', () => {
    const newState = reducer(state, addAccount({
      name: 'حساب بانک ملی',
      type: 'bank',
      currency: 'IRR',
      balance: 1000000,
      color: '#3b82f6'
    }))

    expect(newState.accounts).toHaveLength(1)
    expect(newState.accounts[0].name).toBe('حساب بانک ملی')
    expect(newState.accounts[0].balance).toBe(1000000)
    expect(newState.accounts[0].isActive).toBe(true)
    expect(newState.accounts[0].id).toBeTruthy()
  })

  it('updateAccount - باید حساب رو آپدیت کنه', () => {
    const stateWithAccount = reducer(state, addAccount({
      name: 'حساب قدیمی',
      balance: 1000000
    }))

    const accountId = stateWithAccount.accounts[0].id

    const newState = reducer(stateWithAccount, updateAccount({
      id: accountId,
      name: 'حساب جدید',
      balance: 2000000
    }))

    expect(newState.accounts[0].name).toBe('حساب جدید')
    expect(newState.accounts[0].balance).toBe(2000000)
  })

  it('deleteAccount - باید حساب و تراکنش‌های مرتبط رو حذف کنه', () => {
    let s = reducer(state, addAccount({ name: 'Acc', balance: 1000000 }))
    const accId = s.accounts[0].id

    s = reducer(s, addTransaction({
      accountId: accId,
      type: 'income',
      amount: 500,
      date: '2026-01-01'
    }))

    expect(s.transactions).toHaveLength(1)

    const newState = reducer(s, deleteAccount(accId))

    expect(newState.accounts).toHaveLength(0)
    expect(newState.transactions).toHaveLength(0) // ✅ cascade delete
  })
})

// ═══════════════════════════════════════════════
// ✅ Transactions + Balance
// ═══════════════════════════════════════════════
describe('Transactions + Balance Auto-Update', () => {
  let state
  let accountId

  beforeEach(() => {
    state = getEmptyState()
    state = reducer(state, addAccount({
      name: 'Test Account',
      type: 'bank',
      currency: 'IRR',
      balance: 1000000
    }))
    accountId = state.accounts[0].id
  })

  it('addTransaction(income) - باید balance رو زیاد کنه', () => {
    const newState = reducer(state, addTransaction({
      accountId,
      type: 'income',
      amount: 500000,
      category: 'salary',
      date: '2026-01-01'
    }))

    expect(newState.transactions).toHaveLength(1)
    expect(newState.accounts[0].balance).toBe(1500000) // 1M + 500K
  })

  it('addTransaction(expense) - باید balance رو کم کنه', () => {
    const newState = reducer(state, addTransaction({
      accountId,
      type: 'expense',
      amount: 300000,
      category: 'food',
      date: '2026-01-01'
    }))

    expect(newState.accounts[0].balance).toBe(700000) // 1M - 300K
  })

  it('addTransaction(transfer) - باید از مبدأ کم و به مقصد اضافه کنه', () => {
    let s = reducer(state, addAccount({
      name: 'Account 2',
      currency: 'IRR',
      balance: 500000
    }))
    const toAccountId = s.accounts[1].id

    const newState = reducer(s, addTransaction({
      accountId,
      toAccountId,
      type: 'transfer',
      amount: 200000,
      date: '2026-01-01'
    }))

    expect(newState.accounts[0].balance).toBe(800000) // 1M - 200K
    expect(newState.accounts[1].balance).toBe(700000) // 500K + 200K
  })

  it('updateTransaction - باید balance رو درست recalculate کنه', () => {
    let s = reducer(state, addTransaction({
      accountId,
      type: 'expense',
      amount: 300000,
      date: '2026-01-01'
    }))
    const txId = s.transactions[0].id

    // ✅ تغییر مبلغ از ۳۰۰K به ۵۰۰K
    const newState = reducer(s, updateTransaction({
      id: txId,
      amount: 500000
    }))

    expect(newState.accounts[0].balance).toBe(500000) // 1M - 500K
  })

  it('deleteTransaction - باید اثر تراکنش رو برگردونه', () => {
    let s = reducer(state, addTransaction({
      accountId,
      type: 'expense',
      amount: 300000,
      date: '2026-01-01'
    }))
    const txId = s.transactions[0].id

    expect(s.accounts[0].balance).toBe(700000)

    const newState = reducer(s, deleteTransaction(txId))

    expect(newState.transactions).toHaveLength(0)
    expect(newState.accounts[0].balance).toBe(1000000) // برگشت به اصل
  })
})

// ═══════════════════════════════════════════════
// ✅ Plans (وام، بدهی)
// ═══════════════════════════════════════════════
describe('Plans', () => {
  let state

  beforeEach(() => {
    state = getEmptyState()
  })

  it('addPlan - باید پلن جدید اضافه کنه با termsLocked', () => {
    const newState = reducer(state, addPlan({
      type: 'loan',
      title: 'وام مسکن',
      totalAmount: 120000000,
      installmentsCount: 12,
      installmentAmount: 10000000,
      startDate: '2026-01-01',
      periodicity: 'monthly',
      counterparty: 'بانک مسکن'
    }))

    expect(newState.plans).toHaveLength(1)
    expect(newState.plans[0].title).toBe('وام مسکن')
    expect(newState.plans[0].totalAmount).toBe(120000000)
    expect(newState.plans[0].termsLocked).toBe(true) // ✅
  })

  it('updatePlan - باید فقط فیلدهای مجاز رو آپدیت کنه', () => {
    let s = reducer(state, addPlan({
      type: 'loan',
      title: 'وام',
      totalAmount: 100000000,
      installmentsCount: 10
    }))
    const planId = s.plans[0].id

    // ✅ تلاش برای تغییر totalAmount (نباید بشه)
    const newState = reducer(s, updatePlan({
      id: planId,
      title: 'وام جدید',
      totalAmount: 200000000 // ❌ نباید اعمال بشه
    }))

    expect(newState.plans[0].title).toBe('وام جدید') // ✅ اعمال شد
    expect(newState.plans[0].totalAmount).toBe(100000000) // ❌ اعمال نشد
  })

  it('payPlanDue - باید قسط رو پرداخت‌شده ثبت کنه', () => {
    let s = reducer(state, addPlan({
      type: 'loan',
      title: 'وام',
      totalAmount: 120000000,
      installmentsCount: 12
    }))
    const planId = s.plans[0].id

    const newState = reducer(s, payPlanDue({
      planId,
      dueIndex: 0,
      paidAmount: 10000000,
      paidDate: '2026-02-01'
    }))

    expect(newState.planDues).toHaveLength(1)
    expect(newState.planDues[0].paid).toBe(true)
    expect(newState.planDues[0].paidAmount).toBe(10000000)
  })

  it('deletePlan - باید پلن و سررسیدهاش رو حذف کنه', () => {
    let s = reducer(state, addPlan({
      type: 'loan',
      title: 'وام',
      totalAmount: 100000000,
      installmentsCount: 10
    }))
    const planId = s.plans[0].id

    s = reducer(s, payPlanDue({
      planId,
      dueIndex: 0,
      paidAmount: 10000000
    }))

    expect(s.planDues).toHaveLength(1)

    const newState = reducer(s, deletePlan(planId))

    expect(newState.plans).toHaveLength(0)
    expect(newState.planDues).toHaveLength(0) // ✅ cascade
  })
})

// ═══════════════════════════════════════════════
// ✅ Budgets
// ═══════════════════════════════════════════════
describe('Budgets', () => {
  let state

  beforeEach(() => {
    state = getEmptyState()
  })

  it('addBudget - باید بودجه جدید اضافه کنه', () => {
    const newState = reducer(state, addBudget({
      category: 'food',
      amount: 5000000,
      period: 'monthly',
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    }))

    expect(newState.budgets).toHaveLength(1)
    expect(newState.budgets[0].amount).toBe(5000000)
    expect(newState.budgets[0].isActive).toBe(true)
  })

  it('updateBudget - باید بودجه رو آپدیت کنه', () => {
    let s = reducer(state, addBudget({ category: 'food', amount: 5000000 }))
    const budgetId = s.budgets[0].id

    const newState = reducer(s, updateBudget({
      id: budgetId,
      amount: 7000000
    }))

    expect(newState.budgets[0].amount).toBe(7000000)
  })

  it('deleteBudget - باید بودجه رو حذف کنه', () => {
    let s = reducer(state, addBudget({ category: 'food', amount: 5000000 }))
    const budgetId = s.budgets[0].id

    const newState = reducer(s, deleteBudget(budgetId))
    expect(newState.budgets).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════
// ✅ Categories
// ═══════════════════════════════════════════════
describe('Categories', () => {
  let state

  beforeEach(() => {
    state = getEmptyState()
  })

  it('addCategory - باید دسته جدید اضافه کنه', () => {
    const newState = reducer(state, addCategory({
      type: 'expense',
      category: { name: 'قهوه', color: '#8b4513' }
    }))

    expect(newState.categories.expense).toHaveLength(1)
    expect(newState.categories.expense[0].name).toBe('قهوه')
  })

  it('deleteCategory - باید دسته رو حذف کنه', () => {
    let s = reducer(state, addCategory({
      type: 'expense',
      category: { id: 'coffee', name: 'قهوه' }
    }))

    const newState = reducer(s, deleteCategory({
      type: 'expense',
      id: 'coffee'
    }))

    expect(newState.categories.expense).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════
// ✅ Islamic Settings + Khums
// ═══════════════════════════════════════════════
describe('Islamic Settings', () => {
  let state

  beforeEach(() => {
    state = getEmptyState()
  })

  it('updateIslamicSettings - باید تنظیمات رو آپدیت کنه', () => {
    const newState = reducer(state, updateIslamicSettings({
      khumsYearStart: '2026-01-01',
      goldPricePerGram: 6000000
    }))

    expect(newState.islamicSettings.khumsYearStart).toBe('2026-01-01')
    expect(newState.islamicSettings.goldPricePerGram).toBe(6000000)
  })

  it('payKhums - باید مبلغ پرداختی رو اضافه کنه', () => {
    const newState = reducer(state, payKhums({ amount: 5000000 }))

    expect(newState.islamicSettings.khumsPaid).toBe(5000000)
  })

  it('payKhums - باید مبلغ‌های متوالی رو جمع کنه', () => {
    let s = reducer(state, payKhums({ amount: 5000000 }))
    s = reducer(s, payKhums({ amount: 3000000 }))

    expect(s.islamicSettings.khumsPaid).toBe(8000000)
  })
})

// ═══════════════════════════════════════════════
// ✅ Currency Rates
// ═══════════════════════════════════════════════
describe('Currency Settings', () => {
  it('updateCurrencyRates - باید نرخ‌ها رو آپدیت کنه', () => {
    const state = getEmptyState()
    const newState = reducer(state, updateCurrencyRates({ USD: 700000 }))

    expect(newState.currencySettings.rates.USD).toBe(700000)
    expect(newState.currencySettings.lastUpdated).toBeTruthy()
  })
})

// ═══════════════════════════════════════════════
// ✅ Import/Export + Reset
// ═══════════════════════════════════════════════
describe('Import/Export/Reset', () => {
  it('importFinanceData - باید داده‌ها رو جایگزین کنه', () => {
    const state = getEmptyState()

    const importData = {
      accounts: [{ id: 'a1', name: 'Imported Acc', balance: 5000000 }],
      transactions: [{ id: 't1', amount: 1000000 }],
      budgets: []
    }

    const newState = reducer(state, importFinanceData(importData))

    expect(newState.accounts).toHaveLength(1)
    expect(newState.accounts[0].name).toBe('Imported Acc')
    expect(newState.transactions).toHaveLength(1)
  })

  it('resetFinance - باید همه چیز رو پاک کنه', () => {
    let state = getEmptyState()
    state = reducer(state, addAccount({ name: 'Test', balance: 1000000 }))
    state = reducer(state, addTransaction({
      accountId: state.accounts[0].id,
      type: 'income',
      amount: 500,
      date: '2026-01-01'
    }))

    expect(state.accounts).toHaveLength(1)
    expect(state.transactions).toHaveLength(1)

    const newState = reducer(state, resetFinance())

    expect(newState.accounts).toHaveLength(0)
    expect(newState.transactions).toHaveLength(0)
  })
})