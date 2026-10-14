import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  FiTrendingUp, FiTrendingDown, FiRepeat,
  FiArrowRight, FiInbox
} from 'react-icons/fi'
import { formatNumber, formatCompact } from './currencyHelpers'

const RecentTransactionsWidget = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const transactions = useSelector(state => state.finance?.transactions || [])
  const accounts = useSelector(state => state.finance?.accounts || [])

  const accountsMap = useMemo(() => {
    const map = new Map()
    accounts.forEach(a => map.set(a.id, a))
    return map
  }, [accounts])

  const recent = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 4)
  }, [transactions])

  if (recent.length === 0) {
    return (
      <div className="text-center py-3">
        <FiInbox size={24} className="mx-auto text-gray-300 mb-2" />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isPersian ? 'تراکنشی ثبت نشده' : 'No transactions'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recent.map(tx => {
        const account = accountsMap.get(tx.accountId)
        const config = tx.type === 'income'
          ? { Icon: FiTrendingUp, color: '#10b981', sign: '+' }
          : tx.type === 'expense'
            ? { Icon: FiTrendingDown, color: '#ef4444', sign: '−' }
            : { Icon: FiRepeat, color: '#3b82f6', sign: '↔' }
        
        const Icon = config.Icon

        return (
          <div key={tx.id} className="flex items-center gap-2 py-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon size={12} style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {tx.description || tx.category || (isPersian ? 'بدون عنوان' : 'Untitled')}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {account?.name || '—'}
              </div>
            </div>
            <div className="text-xs font-medium flex-shrink-0" style={{ color: config.color }}>
              {config.sign}{formatCompact(tx.amount, isPersian)}
            </div>
          </div>
        )
      })}

      <Link
        to="/finance"
        className="flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
      >
        <span>{isPersian ? 'مشاهده همه' : 'View all'}</span>
        <FiArrowRight size={10} />
      </Link>
    </div>
  )
})

RecentTransactionsWidget.displayName = 'RecentTransactionsWidget'

export default RecentTransactionsWidget