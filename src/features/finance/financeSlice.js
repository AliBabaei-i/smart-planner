import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════
// ✅ ثابت‌ها
// ═══════════════════════════════════════════════

export const ACCOUNT_TYPES = {
    bank: { id: 'bank', label: 'حساب بانکی', icon: 'landmark' },
    cash: { id: 'cash', label: 'نقد', icon: 'banknote' },
    gold: { id: 'gold', label: 'طلا', icon: 'gem' },
    silver: { id: 'silver', label: 'نقره', icon: 'gem' },
    crypto: { id: 'crypto', label: 'ارز دیجیتال', icon: 'bitcoin' },
    stock: { id: 'stock', label: 'سهام', icon: 'trending-up' },
    property: { id: 'property', label: 'املاک', icon: 'home' },
    other: { id: 'other', label: 'سایر', icon: 'wallet' }
}

export const CURRENCIES = {
    IRR: { id: 'IRR', label: 'ریال', symbol: 'ریال', decimals: 0 },
    IRT: { id: 'IRT', label: 'تومان', symbol: 'تومان', decimals: 0 },
    USD: { id: 'USD', label: 'دلار', symbol: '$', decimals: 2 },
    EUR: { id: 'EUR', label: 'یورو', symbol: '€', decimals: 2 },
    GOLD_GRAM: { id: 'GOLD_GRAM', label: 'گرم طلا', symbol: 'گرم', decimals: 4 },
    SILVER_GRAM: { id: 'SILVER_GRAM', label: 'گرم نقره', symbol: 'گرم', decimals: 4 }
}

export const TRANSACTION_TYPES = {
    income: { id: 'income', label: 'درآمد', color: '#10b981' },
    expense: { id: 'expense', label: 'هزینه', color: '#ef4444' },
    transfer: { id: 'transfer', label: 'انتقال', color: '#3b82f6' }
}

export const PLAN_TYPES = {
    debt: { id: 'debt', label: 'بدهی', color: '#ef4444' },
    credit: { id: 'credit', label: 'طلب', color: '#10b981' },
    loan: { id: 'loan', label: 'وام', color: '#f59e0b' },
    installment: { id: 'installment', label: 'اقساط', color: '#8b5cf6' }
}

export const BUDGET_PERIODS = {
    daily: { id: 'daily', label: 'روزانه' },
    weekly: { id: 'weekly', label: 'هفتگی' },
    monthly: { id: 'monthly', label: 'ماهانه' },
    yearly: { id: 'yearly', label: 'سالانه' }
}

// ═══════════════════════════════════════════════
// ✅ دسته‌بندی‌های پیش‌فرض
// ═══════════════════════════════════════════════

const DEFAULT_INCOME_CATEGORIES = [
    { id: 'salary', name: 'حقوق', icon: 'briefcase', color: '#10b981' },
    { id: 'business', name: 'کسب و کار', icon: 'store', color: '#059669' },
    { id: 'investment', name: 'سرمایه‌گذاری', icon: 'trending-up', color: '#0891b2' },
    { id: 'gift', name: 'هدیه', icon: 'gift', color: '#8b5cf6' },
    { id: 'rent_income', name: 'درآمد اجاره', icon: 'home', color: '#06b6d4' },
    { id: 'other_income', name: 'سایر درآمدها', icon: 'plus-circle', color: '#6b7280' }
]

const DEFAULT_EXPENSE_CATEGORIES = [
    { id: 'food', name: 'خوراک', icon: 'utensils', color: '#f59e0b' },
    { id: 'rent', name: 'اجاره', icon: 'home', color: '#ef4444' },
    { id: 'transport', name: 'حمل و نقل', icon: 'car', color: '#3b82f6' },
    { id: 'utilities', name: 'قبوض', icon: 'zap', color: '#8b5cf6' },
    { id: 'health', name: 'سلامت', icon: 'heart', color: '#ec4899' },
    { id: 'education', name: 'آموزش', icon: 'book', color: '#06b6d4' },
    { id: 'clothing', name: 'پوشاک', icon: 'shopping-bag', color: '#f97316' },
    { id: 'entertainment', name: 'سرگرمی', icon: 'smile', color: '#a855f7' },
    { id: 'charity', name: 'صدقه و خیرات', icon: 'heart-handshake', color: '#22c55e' },
    { id: 'khums', name: 'خمس', icon: 'percent', color: '#14b8a6' },
    { id: 'zakat', name: 'زکات', icon: 'coins', color: '#eab308' },
    { id: 'sadaqah', name: 'صدقه', icon: 'gift', color: '#84cc16' },
    { id: 'other_expense', name: 'سایر هزینه‌ها', icon: 'more-horizontal', color: '#6b7280' }
]

// ═══════════════════════════════════════════════
// ✅ State اولیه + Load از LocalStorage
// ═══════════════════════════════════════════════

const STORAGE_KEY = 'smart-planner-finance'

const getInitialState = () => {
    const defaultState = {
        accounts: [],
        transactions: [],
        plans: [],
        planDues: [],
        budgets: [],
        categories: {
            income: DEFAULT_INCOME_CATEGORIES,
            expense: DEFAULT_EXPENSE_CATEGORIES
        },
        islamicSettings: {
            khumsYearStart: null,
            khumsCalculated: 0,
            khumsPaid: 0,
            sahmImam: 0,
            sahmSadat: 0,
            goldNisabGrams: 87.48,
            silverNisabGrams: 612.36,
            goldPricePerGram: 5000000,
            silverPricePerGram: 80000,
            showKhumsWidget: true,
            showZakatWidget: true,
            warnOnInterest: true
        },
        currencySettings: {
            baseCurrency: 'IRR',
            displayCurrency: 'IRT',
            rates: {
                USD: 600000,
                EUR: 650000,
                GOLD_GRAM: 5000000,
                SILVER_GRAM: 80000
            },
            lastUpdated: new Date().toISOString()
        },
        settings: {
            defaultAccountId: null,
            startOfWeek: 6,
            numberFormat: 'fa',
            dateFormat: 'jalali'
        },
        loading: false,
        error: null
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved)
            return {
                ...defaultState,
                ...parsed,
                categories: {
                    income: parsed.categories?.income || DEFAULT_INCOME_CATEGORIES,
                    expense: parsed.categories?.expense || DEFAULT_EXPENSE_CATEGORIES
                },
                islamicSettings: { ...defaultState.islamicSettings, ...parsed.islamicSettings },
                currencySettings: { ...defaultState.currencySettings, ...parsed.currencySettings },
                settings: { ...defaultState.settings, ...parsed.settings }
            }
        }
    } catch (e) {
        console.error('Error loading finance state:', e)
    }

    return defaultState
}

// ═══════════════════════════════════════════════
// ✅ Helper: محاسبه سررسیدهای Plan (derived)
// ═══════════════════════════════════════════════

const calculatePlanDues = (plan) => {
    const dues = []
    const startDate = new Date(plan.startDate)
    const count = plan.installmentsCount || 1
    const totalAmount = Number(plan.totalAmount) || 0

    const normalAmount = plan.installmentAmount
        ? Number(plan.installmentAmount)
        : Math.floor(totalAmount / count)

    const lastAmount = plan.lastInstallmentAmount
        ? Number(plan.lastInstallmentAmount)
        : (totalAmount - normalAmount * (count - 1))

    for (let i = 0; i < count; i++) {
        const dueDate = new Date(startDate)

        switch (plan.periodicity) {
            case 'daily':
                dueDate.setDate(startDate.getDate() + i)
                break
            case 'weekly':
                dueDate.setDate(startDate.getDate() + i * 7)
                break
            case 'monthly':
                dueDate.setMonth(startDate.getMonth() + i)
                break
            case 'yearly':
                dueDate.setFullYear(startDate.getFullYear() + i)
                break
            default:
                dueDate.setMonth(startDate.getMonth() + i)
        }

        const isLast = i === count - 1
        const amount = isLast ? lastAmount : normalAmount

        dues.push({
            id: `${plan.id}:${i}`,
            planId: plan.id,
            index: i,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: amount,
            currency: plan.currency,
            isLast: isLast
        })
    }

    return dues
}

// ═══════════════════════════════════════════════
// ✅ Slice
// ═══════════════════════════════════════════════

const financeSlice = createSlice({
    name: 'finance',
    initialState: getInitialState(),
    reducers: {
        // ─────────────────────────────────────
        // ✅ حساب‌ها (Accounts)
        // ─────────────────────────────────────
        addAccount: (state, action) => {
            const newAccount = {
                id: uuidv4(),
                name: action.payload.name,
                type: action.payload.type || 'bank',
                currency: action.payload.currency || 'IRR',
                balance: action.payload.balance || 0,
                color: action.payload.color || '#3b82f6',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            state.accounts.push(newAccount)
        },

        updateAccount: (state, action) => {
            const idx = state.accounts.findIndex(a => a.id === action.payload.id)
            if (idx !== -1) {
                state.accounts[idx] = {
                    ...state.accounts[idx],
                    ...action.payload,
                    updatedAt: new Date().toISOString()
                }
            }
        },

        deleteAccount: (state, action) => {
            state.accounts = state.accounts.filter(a => a.id !== action.payload)
            state.transactions = state.transactions.filter(t =>
                t.accountId !== action.payload && t.toAccountId !== action.payload
            )
        },

        // ─────────────────────────────────────
        // ✅ تراکنش‌ها (Transactions)
        // ─────────────────────────────────────
        addTransaction: (state, action) => {
            const newTx = {
                id: action.payload.id || uuidv4(),
                accountId: action.payload.accountId,
                type: action.payload.type,
                amount: parseFloat(action.payload.amount) || 0,
                currency: action.payload.currency || 'IRR',
                category: action.payload.category || 'other_expense',
                subcategory: action.payload.subcategory || null,
                description: action.payload.description || '',
                date: action.payload.date,
                time: action.payload.time || null,
                tags: action.payload.tags || [],
                toAccountId: action.payload.toAccountId || null,
                toAmount: action.payload.toAmount ? parseFloat(action.payload.toAmount) : null,
                khumsRelevant: action.payload.khumsRelevant !== false,
                zakatRelevant: action.payload.zakatRelevant || false,
                taskId: action.payload.taskId || null,
                projectId: action.payload.projectId || null,
                planId: action.payload.planId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            state.transactions.push(newTx)

            const fromAcc = state.accounts.find(a => a.id === newTx.accountId)
            if (fromAcc) {
                if (newTx.type === 'income') {
                    fromAcc.balance = (fromAcc.balance || 0) + newTx.amount
                } else if (newTx.type === 'expense') {
                    fromAcc.balance = (fromAcc.balance || 0) - newTx.amount
                } else if (newTx.type === 'transfer') {
                    fromAcc.balance = (fromAcc.balance || 0) - newTx.amount
                    const toAcc = state.accounts.find(a => a.id === newTx.toAccountId)
                    if (toAcc) {
                        toAcc.balance = (toAcc.balance || 0) + (newTx.toAmount || newTx.amount)
                    }
                }
                fromAcc.updatedAt = new Date().toISOString()
            }
        },

        updateTransaction: (state, action) => {
            const idx = state.transactions.findIndex(t => t.id === action.payload.id)
            if (idx === -1) return

            const oldTx = state.transactions[idx]

            const oldAcc = state.accounts.find(a => a.id === oldTx.accountId)
            if (oldAcc) {
                if (oldTx.type === 'income') oldAcc.balance -= oldTx.amount
                else if (oldTx.type === 'expense') oldAcc.balance += oldTx.amount
                else if (oldTx.type === 'transfer') {
                    oldAcc.balance += oldTx.amount
                    const oldTo = state.accounts.find(a => a.id === oldTx.toAccountId)
                    if (oldTo) oldTo.balance -= (oldTx.toAmount || oldTx.amount)
                }
            }

            state.transactions[idx] = {
                ...oldTx,
                ...action.payload,
                updatedAt: new Date().toISOString()
            }

            const newTx = state.transactions[idx]
            const newAcc = state.accounts.find(a => a.id === newTx.accountId)
            if (newAcc) {
                if (newTx.type === 'income') newAcc.balance += newTx.amount
                else if (newTx.type === 'expense') newAcc.balance -= newTx.amount
                else if (newTx.type === 'transfer') {
                    newAcc.balance -= newTx.amount
                    const newTo = state.accounts.find(a => a.id === newTx.toAccountId)
                    if (newTo) newTo.balance += (newTx.toAmount || newTx.amount)
                }
            }
        },

        deleteTransaction: (state, action) => {
            const tx = state.transactions.find(t => t.id === action.payload)
            if (!tx) return

            const acc = state.accounts.find(a => a.id === tx.accountId)
            if (acc) {
                if (tx.type === 'income') acc.balance -= tx.amount
                else if (tx.type === 'expense') acc.balance += tx.amount
                else if (tx.type === 'transfer') {
                    acc.balance += tx.amount
                    const toAcc = state.accounts.find(a => a.id === tx.toAccountId)
                    if (toAcc) toAcc.balance -= (tx.toAmount || tx.amount)
                }
            }

            state.transactions = state.transactions.filter(t => t.id !== action.payload)
        },

        // ─────────────────────────────────────
        // ✅ پلن‌ها (Plans)
        // ─────────────────────────────────────
        addPlan: (state, action) => {
            const newPlan = {
                id: uuidv4(),
                type: action.payload.type || 'debt',
                title: action.payload.title,
                description: action.payload.description || '',
                totalAmount: parseFloat(action.payload.totalAmount) || 0,
                currency: action.payload.currency || 'IRR',
                startDate: action.payload.startDate,
                installmentsCount: parseInt(action.payload.installmentsCount) || 1,
                installmentAmount: action.payload.installmentAmount
                    ? parseFloat(action.payload.installmentAmount)
                    : null,
                periodicity: action.payload.periodicity || 'monthly',
                accountId: action.payload.accountId || null,
                counterparty: action.payload.counterparty || '',
                termsLocked: true,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastInstallmentAmount: action.payload.lastInstallmentAmount
                    ? parseFloat(action.payload.lastInstallmentAmount)
                    : null
            }
            state.plans.push(newPlan)
        },

        updatePlan: (state, action) => {
            const idx = state.plans.findIndex(p => p.id === action.payload.id)
            if (idx === -1) return

            const allowedFields = ['title', 'description', 'counterparty', 'isActive', 'accountId']
            const filtered = {}
            allowedFields.forEach(f => {
                if (action.payload[f] !== undefined) filtered[f] = action.payload[f]
            })

            state.plans[idx] = {
                ...state.plans[idx],
                ...filtered,
                updatedAt: new Date().toISOString()
            }
        },

        deletePlan: (state, action) => {
            state.plans = state.plans.filter(p => p.id !== action.payload)
            state.planDues = state.planDues.filter(d => d.planId !== action.payload)
        },

        payPlanDue: (state, action) => {
            const { planId, dueIndex, paidAmount, paidDate, transactionId, notes } = action.payload
            const existingIdx = state.planDues.findIndex(
                d => d.planId === planId && d.index === dueIndex
            )

            const dueData = {
                planId,
                index: dueIndex,
                paid: true,
                paidDate: paidDate || new Date().toISOString().split('T')[0],
                paidAmount: parseFloat(paidAmount) || 0,
                transactionId: transactionId || null,
                notes: notes || ''
            }

            if (existingIdx !== -1) {
                state.planDues[existingIdx] = { ...state.planDues[existingIdx], ...dueData }
            } else {
                state.planDues.push({ id: uuidv4(), ...dueData })
            }
        },

        // ─────────────────────────────────────
        // ✅ بودجه‌ها (Budgets)
        // ─────────────────────────────────────
        addBudget: (state, action) => {
            const newBudget = {
                id: uuidv4(),
                category: action.payload.category,
                amount: parseFloat(action.payload.amount) || 0,
                currency: action.payload.currency || 'IRR',
                period: action.payload.period || 'monthly',
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
                rollover: action.payload.rollover || false,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            state.budgets.push(newBudget)
        },

        updateBudget: (state, action) => {
            const idx = state.budgets.findIndex(b => b.id === action.payload.id)
            if (idx !== -1) {
                state.budgets[idx] = {
                    ...state.budgets[idx],
                    ...action.payload,
                    updatedAt: new Date().toISOString()
                }
            }
        },

        deleteBudget: (state, action) => {
            state.budgets = state.budgets.filter(b => b.id !== action.payload)
        },

        // ─────────────────────────────────────
        // ✅ دسته‌بندی‌ها
        // ─────────────────────────────────────
        addCategory: (state, action) => {
            const { type, category } = action.payload
            if (!state.categories[type]) return
            state.categories[type].push({
                id: category.id || uuidv4(),
                name: category.name,
                icon: category.icon || 'tag',
                color: category.color || '#6b7280'
            })
        },

        updateCategory: (state, action) => {
            const { type, id, updates } = action.payload
            if (!state.categories[type]) return
            const idx = state.categories[type].findIndex(c => c.id === id)
            if (idx !== -1) {
                state.categories[type][idx] = { ...state.categories[type][idx], ...updates }
            }
        },

        deleteCategory: (state, action) => {
            const { type, id } = action.payload
            if (!state.categories[type]) return
            state.categories[type] = state.categories[type].filter(c => c.id !== id)
        },

        // ─────────────────────────────────────
        // ✅ تنظیمات
        // ─────────────────────────────────────
        updateIslamicSettings: (state, action) => {
            state.islamicSettings = { ...state.islamicSettings, ...action.payload }
        },

        payKhums: (state, action) => {
            state.islamicSettings.khumsPaid =
                (state.islamicSettings.khumsPaid || 0) + parseFloat(action.payload.amount || 0)
        },

        updateCurrencyRates: (state, action) => {
            state.currencySettings.rates = {
                ...state.currencySettings.rates,
                ...action.payload
            }
            state.currencySettings.lastUpdated = new Date().toISOString()
        },

        updateCurrencySettings: (state, action) => {
            state.currencySettings = { ...state.currencySettings, ...action.payload }
        },

        updateSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload }
        },

        // ─────────────────────────────────────
        // ✅ Import/Export
        // ─────────────────────────────────────
        importFinanceData: (state, action) => {
            const data = action.payload
            if (data.accounts) state.accounts = data.accounts
            if (data.transactions) state.transactions = data.transactions
            if (data.plans) state.plans = data.plans
            if (data.planDues) state.planDues = data.planDues
            if (data.budgets) state.budgets = data.budgets
            if (data.categories) state.categories = data.categories
            if (data.islamicSettings) state.islamicSettings = data.islamicSettings
            if (data.currencySettings) state.currencySettings = data.currencySettings
            if (data.settings) state.settings = data.settings
        },

        resetFinance: (state) => {
            Object.assign(state, getInitialState())
        },

        setLoading: (state, action) => {
            state.loading = action.payload
        },

        setError: (state, action) => {
            state.error = action.payload
        }
    },

    // ═══════════════════════════════════════════════
    // ✅ Extra Reducers — برای Sync
    // ═══════════════════════════════════════════════
    extraReducers: (builder) => {
        // ✅ Accounts
        builder.addCase('sync/mergeFinanceAccounts', (state, action) => {
            const remoteItems = action.payload?.items || []

            for (const remote of remoteItems) {
                if (remote.deletedAt || remote.deleted_at) {
                    state.accounts = state.accounts.filter(a => a.id !== remote.id)
                    continue
                }

                const index = state.accounts.findIndex(a => a.id === remote.id)

                if (index === -1) {
                    state.accounts.push(remote)
                } else {
                    const local = state.accounts[index]
                    const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
                    const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

                    if (remoteTime > localTime) {
                        state.accounts[index] = { ...local, ...remote }
                    }
                }
            }
        })

        // ✅ Transactions
        builder.addCase('sync/mergeFinanceTransactions', (state, action) => {
            const remoteItems = action.payload?.items || []

            for (const remote of remoteItems) {
                if (remote.deletedAt || remote.deleted_at) {
                    state.transactions = state.transactions.filter(t => t.id !== remote.id)
                    continue
                }

                const index = state.transactions.findIndex(t => t.id === remote.id)

                if (index === -1) {
                    state.transactions.push(remote)
                } else {
                    const local = state.transactions[index]
                    const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
                    const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

                    if (remoteTime > localTime) {
                        state.transactions[index] = { ...local, ...remote }
                    }
                }
            }
        })

        // ✅ Plans
        builder.addCase('sync/mergeFinancePlans', (state, action) => {
            const remoteItems = action.payload?.items || []

            for (const remote of remoteItems) {
                if (remote.deletedAt || remote.deleted_at) {
                    state.plans = state.plans.filter(p => p.id !== remote.id)
                    continue
                }

                const index = state.plans.findIndex(p => p.id === remote.id)

                if (index === -1) {
                    state.plans.push(remote)
                } else {
                    const local = state.plans[index]
                    const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
                    const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

                    if (remoteTime > localTime) {
                        state.plans[index] = { ...local, ...remote }
                    }
                }
            }
        })

        // ✅ Plan Dues
        builder.addCase('sync/mergeFinancePlanDues', (state, action) => {
            const remoteItems = action.payload?.items || []

            for (const remote of remoteItems) {
                if (remote.deletedAt || remote.deleted_at) {
                    state.planDues = state.planDues.filter(d => d.id !== remote.id)
                    continue
                }

                const index = state.planDues.findIndex(d => d.id === remote.id)

                if (index === -1) {
                    state.planDues.push(remote)
                } else {
                    const local = state.planDues[index]
                    const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
                    const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

                    if (remoteTime > localTime) {
                        state.planDues[index] = { ...local, ...remote }
                    }
                }
            }
        })

        // ✅ Budgets
        builder.addCase('sync/mergeFinanceBudgets', (state, action) => {
            const remoteItems = action.payload?.items || []

            for (const remote of remoteItems) {
                if (remote.deletedAt || remote.deleted_at) {
                    state.budgets = state.budgets.filter(b => b.id !== remote.id)
                    continue
                }

                const index = state.budgets.findIndex(b => b.id === remote.id)

                if (index === -1) {
                    state.budgets.push(remote)
                } else {
                    const local = state.budgets[index]
                    const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
                    const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

                    if (remoteTime > localTime) {
                        state.budgets[index] = { ...local, ...remote }
                    }
                }
            }
        })
    }
})

// ═══════════════════════════════════════════════
// ✅ Exports
// ═══════════════════════════════════════════════

export const {
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
    updateCurrencySettings,
    updateSettings,
    importFinanceData,
    resetFinance,
    setLoading,
    setError
} = financeSlice.actions

// ═══════════════════════════════════════════════
// ✅ Selectors
// ═══════════════════════════════════════════════

export const selectPlanDues = (plan) => calculatePlanDues(plan)

export const selectTotalBalance = (state) => {
    return state.finance.accounts
        .filter(a => a.isActive)
        .reduce((sum, acc) => sum + (acc.balance || 0), 0)
}

export const selectMonthlySummary = (state, year, month) => {
    const transactions = state.finance.transactions.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === year && (d.getMonth() + 1) === month
    })

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return { income, expense, net: income - expense }
}

export const selectKhumsCalculation = (state) => {
    const settings = state.finance.islamicSettings
    const yearStart = settings.khumsYearStart

    if (!yearStart) return { surplus: 0, khums: 0, sahmImam: 0, sahmSadat: 0 }

    const transactions = state.finance.transactions.filter(t =>
        t.date >= yearStart && t.khumsRelevant !== false
    )

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
        .filter(t => t.type === 'expense' && t.category !== 'khums')
        .reduce((sum, t) => sum + t.amount, 0)

    const surplus = Math.max(0, totalIncome - totalExpenses)
    const khums = surplus * 0.2

    return {
        surplus,
        khums,
        sahmImam: khums / 2,
        sahmSadat: khums / 2,
        totalIncome,
        totalExpenses
    }
}

export const selectZakatCalculation = (state) => {
    const settings = state.finance.islamicSettings
    const goldAccounts = state.finance.accounts.filter(a => a.type === 'gold')
    const silverAccounts = state.finance.accounts.filter(a => a.type === 'silver')

    const totalGold = goldAccounts.reduce((sum, a) => sum + (a.balance || 0), 0)
    const totalSilver = silverAccounts.reduce((sum, a) => sum + (a.balance || 0), 0)

    let zakatGold = 0
    let zakatSilver = 0

    if (totalGold >= settings.goldNisabGrams) {
        zakatGold = (totalGold / 40) * settings.goldPricePerGram
    }
    if (totalSilver >= settings.silverNisabGrams) {
        zakatSilver = (totalSilver / 40) * settings.silverPricePerGram
    }

    return {
        totalGold,
        totalSilver,
        zakatGold,
        zakatSilver,
        total: zakatGold + zakatSilver,
        goldMeetsNisab: totalGold >= settings.goldNisabGrams,
        silverMeetsNisab: totalSilver >= settings.silverNisabGrams
    }
}

export const selectBudgetProgress = (state, budget) => {
    const start = new Date(budget.startDate)
    const end = new Date(budget.endDate)

    const spent = state.finance.transactions
        .filter(t =>
            t.type === 'expense' &&
            t.category === budget.category &&
            new Date(t.date) >= start &&
            new Date(t.date) <= end
        )
        .reduce((sum, t) => sum + t.amount, 0)

    const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
    const remaining = Math.max(0, budget.amount - spent)

    return {
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount,
        isNearLimit: percentage >= 80 && spent <= budget.amount
    }
}

export default financeSlice.reducer