// frontend/src/features/finance/FinanceReports.jsx
import React, { memo, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FiBarChart2 } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import Card from '../../components/ui/Card'
import ReportFilters from './ReportFilters'
import ReportSummary from './ReportSummary'
import ReportCategoryChart from './ReportCategoryChart'
import ReportTimelineChart from './ReportTimelineChart'
import ReportTable from './ReportTable'
import ReportExportButton from './ReportExportButton'
import { getLocalDateStr } from '../../utils/dateHelpers'

// ═══════════════════════════════════════════════
// ✅ Default filters — این ماه
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// ✅ Component
// ═══════════════════════════════════════════════

const FinanceReports = memo(() => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const {
    transactions = [],
    accounts = [],
    categories = {}
  } = finance

  const [filters, setFilters] = useState(getDefaultFilters)

  // ✅ تغییر فیلتر
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  // ✅ ریست فیلترها
  const handleReset = useCallback(() => {
    setFilters(getDefaultFilters())
  }, [])

  // ✅ تراکنش‌های فیلترشده
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // بازه تاریخ
        if (filters.from && tx.date < filters.from) return false
        if (filters.to && tx.date > filters.to) return false

        // نوع
        if (filters.type && filters.type !== 'all' && tx.type !== filters.type) {
          return false
        }

        // حساب (from یا to)
        if (filters.accountId) {
          if (tx.accountId !== filters.accountId &&
              tx.toAccountId !== filters.accountId) {
            return false
          }
        }

        // دسته‌بندی با فرمت "type:id"
        if (filters.categoryId) {
          const [catType, catId] = filters.categoryId.split(':')
          if (tx.type !== catType) return false
          if (tx.category !== catId) return false
        }

        return true
      })
      .sort((a, b) => {
        // جدیدترین اول
        if (b.date !== a.date) return b.date.localeCompare(a.date)
        return (b.createdAt || '').localeCompare(a.createdAt || '')
      })
  }, [transactions, filters])

  return (
    <div className="space-y-5">
      {/* ═══════ هدر ═══════ */}
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

      {/* ═══════ فیلترها ═══════ */}
      <ReportFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
        accounts={accounts}
        categories={categories}
      />

      {/* ═══════ خلاصه ═══════ */}
      <ReportSummary
        transactions={filteredTransactions}
        currency="IRR"
      />

      {/* ═══════ نمودارها ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCategoryChart
          transactions={filteredTransactions}
          categories={categories}
        />
        <ReportTimelineChart
          transactions={filteredTransactions}
          filters={filters}
        />
      </div>

      {/* ═══════ جدول ═══════ */}
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