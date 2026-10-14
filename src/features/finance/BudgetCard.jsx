import React, { useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiTarget, FiAlertTriangle, FiCheckCircle, FiEdit2, FiCalendar
} from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import { useSelector } from 'react-redux'
import { selectBudgetProgress } from '../financeSlice'
import { formatNumber, formatCompact } from './currencyHelpers'

const BudgetCard = memo(({ budget, onEdit }) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const progress = useSelector(state => selectBudgetProgress(state, budget))

  const categoryName = useSelector(state => {
  const cats = state.finance?.categories?.expense || []
  const found = cats.find(c => c.id === budget.category)
  return found ? found.name : budget.category
})

  const status = useMemo(() => {
    if (progress.isOverBudget) return 'over'
    if (progress.isNearLimit) return 'near'
    return 'ok'
  }, [progress])

  const statusConfig = {
    ok: {
      color: '#10b981',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      Icon: FiCheckCircle
    },
    near: {
      color: '#f59e0b',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      Icon: FiAlertTriangle
    },
    over: {
      color: '#ef4444',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      Icon: FiAlertTriangle
    }
  }

  const config = statusConfig[status]
  const StatusIcon = config.Icon

  return (
    <Card className="p-4 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <FiTarget size={18} style={{ color: config.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate text-sm">
  {categoryName}
</div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <FiCalendar size={10} />
              <span>{budget.startDate} → {budget.endDate}</span>
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(budget)}
            className="text-gray-400 hover:text-emerald-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <FiEdit2 size={14} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {isPersian ? 'هزینه‌شده' : 'Spent'}
          </span>
          <span className={`font-medium ${config.text}`}>
            {formatNumber(progress.percentage, isPersian, 0)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress.percentage, 100)}%`,
              backgroundColor: config.color
            }}
          />
        </div>

        <div className="flex justify-between items-center text-xs">
          {/* ✅ FIX: رنگ متن رو صریح تنظیم کن */}
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCompact(progress.spent, isPersian)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {isPersian ? 'از' : 'of'} {formatCompact(budget.amount, isPersian)}
          </span>
        </div>

        {/* وضعیت */}
        <div className={`flex items-center gap-1.5 p-2 rounded ${config.bg} mt-2`}>
          <StatusIcon size={12} className={config.text} />
          <span className={`text-xs font-medium ${config.text}`}>
            {status === 'over' && (isPersian ? 'از بودجه گذشته!' : 'Over budget!')}
            {status === 'near' && (isPersian ? 'نزدیک سقف بودجه' : 'Near limit')}
            {status === 'ok' && `${isPersian ? 'باقیمانده' : 'Remaining'}: ${formatCompact(progress.remaining, isPersian)}`}
          </span>
        </div>
      </div>
    </Card>
  )
})

BudgetCard.displayName = 'BudgetCard'

export default BudgetCard