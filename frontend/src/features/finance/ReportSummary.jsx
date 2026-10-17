// frontend/src/features/finance/ReportSummary.jsx
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiTrendingUp, FiTrendingDown, FiActivity, FiHash
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { formatCompact, formatNumber } from './currencyHelpers'

const ReportSummary = memo(({ transactions = [], currency = 'IRR' }) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ محاسبه‌ی آمار از تراکنش‌های فیلترشده
  const stats = useMemo(() => {
    let income = 0
    let expense = 0
    let count = 0

    for (const t of transactions) {
      count++
      if (t.type === 'income') income += Number(t.amount) || 0
      else if (t.type === 'expense') expense += Number(t.amount) || 0
    }

    return {
      income,
      expense,
      net: income - expense,
      count
    }
  }, [transactions])

  const cards = [
    {
      key: 'income',
      label: t('finance.reports.summary.totalIncome'),
      value: stats.income,
      color: 'green',
      icon: FiTrendingUp,
      prefix: '+'
    },
    {
      key: 'expense',
      label: t('finance.reports.summary.totalExpense'),
      value: stats.expense,
      color: 'red',
      icon: FiTrendingDown,
      prefix: '−'
    },
    {
      key: 'net',
      label: t('finance.reports.summary.net'),
      value: stats.net,
      color: stats.net >= 0 ? 'green' : 'red',
      icon: FiActivity,
      prefix: stats.net >= 0 ? '+' : '−'
    },
    {
      key: 'count',
      label: t('finance.reports.summary.count'),
      value: stats.count,
      color: 'blue',
      icon: FiHash,
      isCount: true
    }
  ]

  const colorClasses = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(card => {
        const Icon = card.icon
        const colors = colorClasses[card.color]
        const absValue = Math.abs(card.value)

        return (
          <Card key={card.key} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                <Icon size={14} className={colors.text} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {card.label}
              </span>
            </div>

            <div className={`text-lg font-bold ${colors.text}`}>
              {card.isCount ? (
                isPersian
                  ? formatNumber(absValue, true).replace(/\.00$/, '')
                  : absValue.toLocaleString('en-US')
              ) : (
                <>
                  {card.prefix}
                  {formatCompact(absValue, isPersian)}
                </>
              )}
            </div>

            {!card.isCount && (
              <div className="text-[10px] text-gray-400 mt-0.5">
                {currency === 'IRR' ? (isPersian ? 'ریال' : 'IRR') : currency}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
})

ReportSummary.displayName = 'ReportSummary'

export default ReportSummary