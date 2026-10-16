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
  CURRENCY_META
} from './currencyHelpers'

const BalanceWidget = memo(() => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const accounts = useSelector(state => state.finance?.accounts || [])
  const transactions = useSelector(state => state.finance?.transactions || [])

  // ✅ محاسبات
  const stats = useMemo(() => {
    const activeAccounts = accounts.filter(a => a.isActive)
    
    // ✅ موجودی کل (فقط IRR/IRT و معادل‌شون)
    const irrAccounts = activeAccounts.filter(a => a.currency === 'IRR' || a.currency === 'IRT')
    const totalBalance = irrAccounts.reduce((sum, a) => {
      const balance = a.balance || 0
      return sum + (a.currency === 'IRT' ? balance * 10 : balance)
    }, 0)

    // ✅ تراکنش‌های این ماه
    const now = new Date()
    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.date)
      return d.getFullYear() === now.getFullYear() &&
             (d.getMonth() + 1) === (now.getMonth() + 1)
    })

    const monthlyIncome = monthTxs
      .filter(tx => tx.type === 'income')
      .reduce((s, tx) => s + tx.amount, 0)

    const monthlyExpense = monthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((s, tx) => s + tx.amount, 0)

    // ✅ حساب‌های چند ارزی
    const byCurrency = {}
    activeAccounts.forEach(a => {
      if (!byCurrency[a.currency]) byCurrency[a.currency] = 0
      byCurrency[a.currency] += (a.balance || 0)
    })

    const multiCurrency = Object.entries(byCurrency)
      .filter(([cur]) => cur !== 'IRR')
      .map(([currency, total]) => ({ currency, total }))

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense,
      multiCurrency,
      hasData: activeAccounts.length > 0
    }
  }, [accounts, transactions])

  // ═══════════════════════════════════════════════
  // ✅ حالت خالی
  // ═══════════════════════════════════════════════
  if (!stats.hasData) {
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

  const isPositive = stats.monthlyNet >= 0

  // ═══════════════════════════════════════════════
  // ✅ حالت با داده
  // ═══════════════════════════════════════════════
  return (
    <div className="space-y-3">

      {/* موجودی کل */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <FiDollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('finance.accounts.balance')}
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {formatCompact(stats.totalBalance, isPersian)}
          </div>
          <div className="text-[10px] text-gray-400">
            {isPersian ? 'ریال' : 'IRR'}
          </div>
        </div>
      </div>

      {/* ✅ نمایش چند ارزی */}
      {stats.multiCurrency.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
          <div className="text-[10px] text-gray-400 mb-1">
            {isPersian ? 'سایر ارزها' : 'Other Currencies'}
          </div>
          {stats.multiCurrency.map(({ currency, total }) => (
            <div key={currency} className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {CURRENCY_META[currency]?.label || currency}
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatNumber(total, isPersian, CURRENCY_META[currency]?.decimals || 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ✅ خالص ماه */}
      <div className={`p-2.5 rounded-lg flex items-center justify-between ${
        isPositive
          ? 'bg-green-50 dark:bg-green-900/20'
          : 'bg-red-50 dark:bg-red-900/20'
      }`}>
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <FiTrendingUp size={12} className="text-green-600 dark:text-green-400" />
          ) : (
            <FiTrendingDown size={12} className="text-red-600 dark:text-red-400" />
          )}
          <span className={`text-xs font-medium ${
            isPositive 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {isPersian ? 'خالص ماه' : 'Monthly Net'}
          </span>
        </div>
        <span className={`text-xs font-bold ${
          isPositive 
            ? 'text-green-700 dark:text-green-300' 
            : 'text-red-700 dark:text-red-300'
        }`}>
          {isPositive ? '+' : '−'}{formatCompact(Math.abs(stats.monthlyNet), isPersian)}
        </span>
      </div>

      {/* ✅ دکمه مشاهده جزئیات */}
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