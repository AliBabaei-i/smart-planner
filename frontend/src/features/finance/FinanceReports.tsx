import React, { memo, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FiBarChart2, FiInfo } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import Card from '../../components/ui/Card'
import ReportFilters from './ReportFilters'
import ReportSummary from './ReportSummary'
import ReportCategoryChart from './ReportCategoryChart'
import ReportTimelineChart from './ReportTimelineChart'
import ReportTable from './ReportTable'
import ReportExportButton from './ReportExportButton'
import { getLocalDateStr } from '../../utils/dateHelpers'
import { convertCurrency, CURRENCY_META } from './currencyHelpers'
import type { RootState } from '../../app/store'

const getDefaultFilters = () => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    preset: 'thisMonth',
    from: getLocalDateStr(startOfMonth),
    to: getLocalDateStr(today),
    type: 'all',
    accountId: '',
    categoryId: ''
  }
}

const FinanceReports = memo(() => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector((state: RootState) => state.finance)
  const {
    transactions = [],
    accounts = [],
    categories = { income: [], expense: [] },
    currencySettings
  } = finance

  const rates = currencySettings?.rates || {}
  const baseCurrency = currencySettings?.baseCurrency || 'IRR'
  const baseCurrencyMeta = CURRENCY_META[baseCurrency] || CURRENCY_META.IRR

  const [filters, setFilters] = useState(getDefaultFilters)

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  const handleReset = useCallback(() => {
    setFilters(getDefaultFilters())
  }, [])

  // ✅ مرحله ۱: فیلتر
  // ✅ مرحله ۲: تبدیل همه به ارز پایه برای نمایش یکسان در گزارش
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (filters.from && tx.date < filters.from) return false
        if (filters.to && tx.date > filters.to) return false
        if (filters.type && filters.type !== 'all' && tx.type !== filters.type) return false
        if (filters.accountId) {
          if (tx.accountId !== filters.accountId && tx.toAccountId !== filters.accountId) return false
        }
        if (filters.categoryId) {
          const [catType, catId] = filters.categoryId.split(':')
          if (tx.type !== catType) return false
          if (tx.category !== catId) return false
        }
        return true
      })
      .map(tx => {
        // ✅ حفظ مقادیر اصلی برای نمایش در جدول
        const originalAmount = Number(tx.amount) || 0
        const originalCurrency = tx.currency || 'IRR'
        // ✅ تبدیل به ارز پایه
        const convertedAmount =
          originalCurrency === baseCurrency
            ? originalAmount
            : convertCurrency(originalAmount, originalCurrency, baseCurrency, rates)

        return {
          ...tx,
          originalAmount,
          originalCurrency,
          amount: convertedAmount,
          currency: baseCurrency,
        }
      })
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date)
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      })
  }, [transactions, filters, baseCurrency, rates])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBarChart2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            {t('finance.reports.title')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('finance.reports.subtitle')}
          </p>
        </div>

        <ReportExportButton
          transactions={filteredTransactions}
          filters={filters}
          accounts={accounts}
          categories={categories}
        />
      </div>

      {/* ✅ هشدار تبدیل ارز */}
      <div className="flex items-start gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <FiInfo size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
          {isPersian
            ? `همه مبالغ در این گزارش به «${baseCurrencyMeta.label}» تبدیل شده‌اند تا با هم قابل مقایسه باشند.`
            : `All amounts are converted to ${baseCurrencyMeta.label} for comparison.`}
        </p>
      </div>

      <ReportFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
        accounts={accounts}
        categories={categories}
      />

      <ReportSummary transactions={filteredTransactions} currency={baseCurrency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCategoryChart transactions={filteredTransactions} categories={categories} />
        <ReportTimelineChart transactions={filteredTransactions} filters={filters} />
      </div>

      <ReportTable
        transactions={filteredTransactions}
        accounts={accounts}
        categories={categories}
      />
    </div>
  )
})

FinanceReports.displayName = 'FinanceReports'
export default FinanceReports