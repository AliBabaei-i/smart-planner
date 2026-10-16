import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FiTarget, FiArrowRight } from 'react-icons/fi'
import { formatCompact } from './currencyHelpers'

const MonthlyBudgetWidget = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const budgets = useSelector(state => state.finance?.budgets || [])
  const transactions = useSelector(state => state.finance?.transactions || [])

  const { totalBudget, totalSpent, percentage, activeBudgets } = useMemo(() => {
    const active = budgets.filter(b => b.isActive)
    const total = active.reduce((s, b) => s + b.amount, 0)
    
    let spent = 0
    active.forEach(b => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      const bSpent = transactions
        .filter(t => 
          t.type === 'expense' &&
          t.category === b.category &&
          new Date(t.date) >= start &&
          new Date(t.date) <= end
        )
        .reduce((s, t) => s + t.amount, 0)
      spent += bSpent
    })
    
    return {
      totalBudget: total,
      totalSpent: spent,
      percentage: total > 0 ? (spent / total) * 100 : 0,
      activeBudgets: active.length
    }
  }, [budgets, transactions])

  if (activeBudgets === 0) {
    return (
      <div className="text-center py-3">
        <FiTarget size={24} className="mx-auto text-gray-300 mb-2" />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isPersian ? 'بودجه‌ای تعریف نشده' : 'No budget'}
        </div>
        <Link
          to="/finance"
          className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>{isPersian ? 'تعریف بودجه' : 'Set budget'}</span>
          <FiArrowRight size={10} />
        </Link>
      </div>
    )
  }

  const isNearLimit = percentage >= 80 && percentage < 100
  const isOver = percentage >= 100
  const barColor = isOver ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <FiTarget size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isPersian ? 'بودجه این دوره' : 'Period Budget'}
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCompact(totalSpent, isPersian)} / {formatCompact(totalBudget, isPersian)}
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          {isPersian ? `${activeBudgets} بودجه فعال` : `${activeBudgets} active budgets`}
        </span>
        <span className="font-bold" style={{ color: barColor }}>
          {Math.round(percentage)}%
        </span>
      </div>

      <Link
        to="/finance"
        className="flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <span>{isPersian ? 'مدیریت بودجه' : 'Manage'}</span>
        <FiArrowRight size={10} />
      </Link>
    </div>
  )
})

MonthlyBudgetWidget.displayName = 'MonthlyBudgetWidget'

export default MonthlyBudgetWidget