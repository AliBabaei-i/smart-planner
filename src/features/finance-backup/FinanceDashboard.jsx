import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign,
  FiTarget, FiPieChart, FiPercent
} from 'react-icons/fi'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts'
import Card from '../../components/ui/Card'
import {
  formatCompact, formatNumber, CURRENCY_META
} from './currencyHelpers'
import { selectKhumsCalculation } from './financeSlice''

const FinanceDashboard = memo(({ onNavigate }) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const { accounts = [], transactions = [], budgets = [], categories = {} } = finance

  // ✅ محاسبات آماری
  const stats = useMemo(() => {
    const totalBalance = accounts
      .filter(a => a.isActive)
      .reduce((sum, a) => sum + (a.balance || 0), 0)

    const now = new Date()
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === now.getFullYear() && 
             (d.getMonth() + 1) === (now.getMonth() + 1)
    })

    const monthlyIncome = monthTxs
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const monthlyExpense = monthTxs
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense
    }
  }, [accounts, transactions])

  // ✅ داده‌های Pie Chart (توزیع دسته‌ها)
  const expenseByCategory = useMemo(() => {
    const now = new Date()
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date)
      return t.type === 'expense' &&
             d.getFullYear() === now.getFullYear() && 
             (d.getMonth() + 1) === (now.getMonth() + 1)
    })

    const grouped = {}
    monthTxs.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = 0
      grouped[t.category] += t.amount
    })

    return Object.entries(grouped)
      .map(([catId, amount]) => {
        const cat = categories.expense?.find(c => c.id === catId)
        return {
          name: isPersian ? (cat?.name || catId) : catId,
          value: amount,
          color: cat?.color || '#6b7280'
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [transactions, categories, isPersian])

  // ✅ داده‌های Bar Chart (۷ روز اخیر)
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
      const income = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

      days.push({
        day: dayName,
        date: dateStr,
        income: Math.round(income / 1000), // به هزار ریال
        expense: Math.round(expense / 1000)
      })
    }
    return days
  }, [transactions, isPersian])

  return (
    <div className="space-y-5">

      {/* ═══════════════════════════════════ */}
      {/* کارت‌های آماری */}
      {/* ═══════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <FiDollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'موجودی کل' : 'Total Balance'}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCompact(stats.totalBalance, isPersian)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {isPersian ? 'ریال' : 'IRR'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiTrendingUp size={14} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'درآمد ماه' : 'Monthly Income'}
            </span>
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCompact(stats.monthlyIncome, isPersian)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiTrendingDown size={14} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'هزینه ماه' : 'Monthly Expense'}
            </span>
          </div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCompact(stats.monthlyExpense, isPersian)}
          </div>
        </Card>

        <Card className={`p-4 ${
          stats.monthlyNet >= 0 
            ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900' 
            : 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.monthlyNet >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <FiPieChart size={14} className={
                stats.monthlyNet >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              } />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPersian ? 'خالص ماه' : 'Monthly Net'}
            </span>
          </div>
          <div className={`text-lg font-bold ${
            stats.monthlyNet >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {stats.monthlyNet >= 0 ? '+' : '−'}{formatCompact(Math.abs(stats.monthlyNet), isPersian)}
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* Pie Chart - توزیع هزینه‌ها */}
      {/* ═══════════════════════════════════ */}
      {expenseByCategory.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {isPersian ? 'توزیع هزینه‌های این ماه' : 'This Month Expenses Distribution'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatNumber(value, isPersian)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    direction: isPersian ? 'rtl' : 'ltr'
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
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                      {cat.name}
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {percentage.toFixed(1)}%
                    </span>
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

      {/* ═══════════════════════════════════ */}
      {/* Bar Chart - ۷ روز اخیر */}
      {/* ═══════════════════════════════════ */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {isPersian ? 'درآمد و هزینه ۷ روز اخیر (هزار ریال)' : 'Last 7 Days (Thousand IRR)'}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={last7DaysData}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatNumber(value * 1000, isPersian),
                name === 'income' ? (isPersian ? 'درآمد' : 'Income') : (isPersian ? 'هزینه' : 'Expense')
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                direction: isPersian ? 'rtl' : 'ltr'
              }}
            />
            <Legend 
              formatter={(value) => value === 'income' 
                ? (isPersian ? 'درآمد' : 'Income') 
                : (isPersian ? 'هزینه' : 'Expense')
              }
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ═══════════════════════════════════ */}
      {/* وضعیت بودجه‌ها */}
      {/* ═══════════════════════════════════ */}
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
          <div className="space-y-3">
            {budgets.slice(0, 4).map(b => {
              const total = b.amount || 1
              const percentage = Math.min(100, (0 / total) * 100) // TODO: محاسبه
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {b.category}
                    </span>
                    <span className="text-gray-500">
                      {formatCompact(b.amount, isPersian)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ═══════════════════════════════════ */}
      {/* حالت خالی */}
      {/* ═══════════════════════════════════ */}
      {accounts.length === 0 && transactions.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <FiDollarSign size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isPersian ? 'هنوز داده‌ای نداری' : 'No data yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isPersian 
              ? 'با ایجاد اولین حساب و ثبت تراکنش شروع کن'
              : 'Start by creating your first account'}
          </p>
        </Card>
      )}
    </div>
  )
})

FinanceDashboard.displayName = 'FinanceDashboard'

export default FinanceDashboard