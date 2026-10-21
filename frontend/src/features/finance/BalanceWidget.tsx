import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  FiDollarSign, FiArrowRight, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi'
import {
  formatCompact,
  formatNumber,
  CURRENCY_META,
} from './currencyHelpers'
import type { RootState } from '../../app/store'

const BalanceWidget = memo(() => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const accounts = useSelector((s: RootState) => s.finance?.accounts || [])
  const transactions = useSelector((s: RootState) => s.finance?.transactions || [])

  // ✅ موجودی هر ارز جداگانه (بدون قاطی‌کردن)
  const totalsByCurrency = useMemo(() => {
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

  // ✅ خالص ماه بر اساس هر ارز (بدون تبدیل)
  const monthlyByCurrency = useMemo(() => {
    const now = new Date()
    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.date)
      return d.getFullYear() === now.getFullYear() && (d.getMonth() + 1) === (now.getMonth() + 1)
    })

    const map = new Map<string, { income: number; expense: number }>()
    for (const tx of monthTxs) {
      const cur = tx.currency || 'IRR'
      if (!map.has(cur)) map.set(cur, { income: 0, expense: 0 })
      const entry = map.get(cur)!
      if (tx.type === 'income') entry.income += tx.amount
      else if (tx.type === 'expense') entry.expense += tx.amount
    }

    return Array.from(map.entries())
      .map(([currency, { income, expense }]) => ({
        currency,
        income,
        expense,
        net: income - expense
      }))
      .sort((a, b) => {
        const order: Record<string, number> = { IRR: 0, IRT: 1 }
        return (order[a.currency] ?? 99) - (order[b.currency] ?? 99)
      })
  }, [transactions])

  const hasData = accounts.some(a => a.isActive)

  // ✅ حالت خالی
  if (!hasData) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
          <FiDollarSign size={24} className="text-emerald-500" />
        </div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {t('finance.accounts.empty')}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('finance.accounts.emptyHint')}
        </p>
        <Link
          to="/finance"
          className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        >
          <span>{t('finance.actions.newAccount')}</span>
          <FiArrowRight size={10} />
        </Link>
      </div>
    )
  }

  const primary = totalsByCurrency[0]
  const others = totalsByCurrency.slice(1)
  const primaryMeta = CURRENCY_META[primary.currency] || CURRENCY_META.IRR

  return (
    <div className="space-y-3">

      {/* ✅ موجودی اصلی (اولین ارز، معمولاً IRR) */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <FiDollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('finance.accounts.balance')} — {primaryMeta.label}
          </div>
          <div className={`text-lg font-bold truncate ${
            primary.total < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
          }`}>
            {formatCompact(primary.total, isPersian)}
          </div>
        </div>
      </div>

      {/* ✅ سایر ارزها */}
      {others.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="text-[10px] text-gray-400 mb-1">
            {isPersian ? 'سایر ارزها' : 'Other Currencies'}
          </div>
          {others.map(({ currency, total }) => {
            const meta = CURRENCY_META[currency] || CURRENCY_META.IRR
            return (
              <div key={currency} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{meta.label}</span>
                <span className={`font-medium ${total < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {formatNumber(total, isPersian, meta.decimals || 0)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ✅ خالص ماه */}
      {monthlyByCurrency.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="text-[10px] text-gray-400 mb-1">
            {isPersian ? 'خالص ماه' : 'Monthly Net'}
          </div>
          {monthlyByCurrency.map(({ currency, net }) => {
            const meta = CURRENCY_META[currency] || CURRENCY_META.IRR
            const isPositive = net >= 0
            return (
              <div key={currency} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {isPositive
                    ? <FiTrendingUp size={10} className="text-green-600" />
                    : <FiTrendingDown size={10} className="text-red-600" />}
                  <span className="text-gray-500 dark:text-gray-400">{meta.label}</span>
                </div>
                <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? '+' : '−'}{formatCompact(Math.abs(net), isPersian)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* لینک جزئیات */}
      <Link
        to="/finance"
        className="flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline pt-1 font-medium"
      >
        <span>{isPersian ? 'مشاهده جزئیات' : 'View details'}</span>
        <FiArrowRight size={10} />
      </Link>
    </div>
  )
})

BalanceWidget.displayName = 'BalanceWidget'
export default BalanceWidget