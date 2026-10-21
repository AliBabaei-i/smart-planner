import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiInfo
} from 'react-icons/fi'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import Card from '../../components/ui/Card'
import { formatCompact, formatNumber, CURRENCY_META, convertCurrency } from './currencyHelpers'
import type { RootState } from '../../app/store'

interface FinanceDashboardProps {
  onNavigate?: (tab: string) => void
}

// ✅ فرمت کوتاه برای محور Y (بدون واحد طولانی)
const formatAxisShort = (v: number): string => {
  const abs = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`
  return String(Math.round(v))
}

const FinanceDashboard = memo(({ onNavigate }: FinanceDashboardProps) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector((state: RootState) => state.finance)
  const {
    accounts = [],
    transactions = [],
    budgets = [],
    categories = { income: [], expense: [] },
    currencySettings,
  } = finance || {}

  const rates = currencySettings?.rates || {}
  const baseCurrency = currencySettings?.baseCurrency || 'IRR'
  const baseMeta = CURRENCY_META[baseCurrency] || CURRENCY_META.IRR

  // ✅ موجودی هر ارز (بدون تبدیل)
  const balancesByCurrency = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of accounts.filter(x => x.isActive)) {
      const cur = a.currency || 'IRR'
      map.set(cur, (map.get(cur) || 0) + (a.balance || 0))
    }
    return Array.from(map.entries())
      .map(([currency, total]) => ({ currency, total }))
      .sort((a, b) => {
        const order: Record<string, number> = { IRR: 0, IRT: 1 }
        return (order[a.currency] ?? 99) - (order[b.currency] ?? 99)
      })
  }, [accounts])

  // ✅ آمار ماهانه — همه به ارز پایه تبدیل می‌شوند
  const monthlyStats = useMemo(() => {
    const now = new Date()
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === now.getFullYear() && (d.getMonth() + 1) === (now.getMonth() + 1)
    })

    let income = 0
    let expense = 0
    for (const tx of monthTxs) {
      const amtBase = convertCurrency(tx.amount, tx.currency || 'IRR', baseCurrency, rates)
      if (tx.type === 'income') income += amtBase
      else if (tx.type === 'expense') expense += amtBase
    }

    return { income, expense, net: income - expense, count: monthTxs.length }
  }, [transactions, baseCurrency, rates])

  // ✅ Pie Chart — توزیع هزینه‌ها (به ارز پایه)
  const expenseByCategory = useMemo(() => {
    const now = new Date()
    const monthExpenses = transactions.filter(t => {
      const d = new Date(t.date)
      return t.type === 'expense' &&
        d.getFullYear() === now.getFullYear() &&
        (d.getMonth() + 1) === (now.getMonth() + 1)
    })

    const grouped: Record<string, number> = {}
    for (const tx of monthExpenses) {
      const amtBase = convertCurrency(tx.amount, tx.currency || 'IRR', baseCurrency, rates)
      grouped[tx.category] = (grouped[tx.category] || 0) + amtBase
    }

    return Object.entries(grouped)
      .map(([catId, amount]) => {
        const cat = categories.expense?.find((c: any) => c.id === catId)
        return {
          name: isPersian ? (cat?.name || catId) : catId,
          value: amount,
          color: cat?.color || '#6b7280',
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [transactions, categories, isPersian, baseCurrency, rates])

  // ✅ Bar Chart — ۷ روز اخیر (به ارز پایه)
  const last7DaysData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = isPersian
        ? ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'][date.getDay()]
        : ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]

      const dayTxs = transactions.filter(t => t.date === dateStr)
      let income = 0
      let expense = 0
      for (const tx of dayTxs) {
        const amtBase = convertCurrency(tx.amount, tx.currency || 'IRR', baseCurrency, rates)
        if (tx.type === 'income') income += amtBase
        else if (tx.type === 'expense') expense += amtBase
      }

      days.push({
        day: dayName,
        date: dateStr,
        income,
        expense,
      })
    }
    return days
  }, [transactions, isPersian, baseCurrency, rates])

  const primaryBalance = balancesByCurrency[0]
  const otherBalances = balancesByCurrency.slice(1)

  return (
    <div className="space-y-5">

      {/* ═══ کارت‌های آماری ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* موجودی */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <FiDollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'موجودی' : 'Balance'}
            </span>
          </div>
          <div className={`text-lg font-bold truncate ${
            (primaryBalance?.total || 0) < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
          }`}>
            {primaryBalance ? formatCompact(primaryBalance.total, isPersian) : '—'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {primaryBalance ? (CURRENCY_META[primaryBalance.currency]?.label || primaryBalance.currency) : '—'}
          </div>
          {otherBalances.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700 space-y-0.5">
              {otherBalances.map(({ currency, total }) => {
                const meta = CURRENCY_META[currency] || CURRENCY_META.IRR
                return (
                  <div key={currency} className="flex justify-between text-[10px]">
                    <span className="text-gray-400">{meta.label}</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {formatNumber(total, isPersian, meta.decimals || 0)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* درآمد ماه */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiTrendingUp size={14} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'درآمد ماه' : 'Monthly Income'}
            </span>
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400 truncate">
            {formatCompact(monthlyStats.income, isPersian)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{baseMeta.label}</div>
        </Card>

        {/* هزینه ماه */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiTrendingDown size={14} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'هزینه ماه' : 'Monthly Expense'}
            </span>
          </div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 truncate">
            {formatCompact(monthlyStats.expense, isPersian)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{baseMeta.label}</div>
        </Card>

        {/* خالص ماه */}
        <Card className={`p-4 ${
          monthlyStats.net >= 0
            ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900'
            : 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              monthlyStats.net >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <FiPieChart size={14} className={
                monthlyStats.net >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              } />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'خالص ماه' : 'Monthly Net'}
            </span>
          </div>
          <div className={`text-lg font-bold truncate ${
            monthlyStats.net >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {monthlyStats.net >= 0 ? '+' : '−'}{formatCompact(Math.abs(monthlyStats.net), isPersian)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{baseMeta.label}</div>
        </Card>
      </div>

      {/* هشدار ارز پایه */}
      <div className="flex items-start gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <FiInfo size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
          {isPersian
            ? `آمار ماهانه به «${baseMeta.label}» تبدیل شده‌اند. می‌توانید در تنظیمات، ارز پایه را تغییر دهید.`
            : `Monthly stats are converted to ${baseMeta.label}. Change base currency in settings.`}
        </p>
      </div>

      {/* ═══ Pie Chart — توزیع هزینه‌ها ═══ */}
      {expenseByCategory.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {isPersian ? 'توزیع هزینه‌های این ماه' : 'This Month Expenses'} ({baseMeta.label})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${formatNumber(value, isPersian)} ${baseMeta.label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    direction: isPersian ? 'rtl' : 'ltr',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {expenseByCategory.map((cat, i) => {
                const total = expenseByCategory.reduce((s, c) => s + c.value, 0)
                const percentage = total > 0 ? (cat.value / total) * 100 : 0
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-end">
                      {formatCompact(cat.value, isPersian)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ═══ Bar Chart — ۷ روز اخیر ═══ */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {isPersian ? `درآمد و هزینه ۷ روز اخیر (${baseMeta.label})` : `Last 7 Days (${baseMeta.label})`}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={last7DaysData} margin={{ top: 5, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatAxisShort}
              width={48}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${formatNumber(value, isPersian)} ${baseMeta.label}`,
                name === 'income' ? (isPersian ? 'درآمد' : 'Income') : (isPersian ? 'هزینه' : 'Expense'),
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: 'none', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                direction: isPersian ? 'rtl' : 'ltr',
              }}
            />
            <Legend
              formatter={(v) =>
                v === 'income'
                  ? (isPersian ? 'درآمد' : 'Income')
                  : (isPersian ? 'هزینه' : 'Expense')
              }
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ═══ بودجه‌ها ═══ */}
      {budgets.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {isPersian ? 'وضعیت بودجه‌ها' : 'Budget Status'}
            </h3>
            <button
              onClick={() => onNavigate?.('budgets')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isPersian ? 'مدیریت' : 'Manage'}
            </button>
          </div>
          <div className="space-y-2">
            {budgets.slice(0, 4).map((b: any) => {
              const meta = CURRENCY_META[b.currency] || CURRENCY_META.IRR
              return (
                <div key={b.id} className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{b.category}</span>
                  <span className="text-gray-500">
                    {formatCompact(b.amount, isPersian)} {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ═══ حالت خالی ═══ */}
      {accounts.length === 0 && transactions.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <FiDollarSign size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isPersian ? 'هنوز داده‌ای نداری' : 'No data yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isPersian ? 'با ایجاد اولین حساب و ثبت تراکنش شروع کن' : 'Start by creating your first account'}
          </p>
        </Card>
      )}
    </div>
  )
})

FinanceDashboard.displayName = 'FinanceDashboard'
export default FinanceDashboard