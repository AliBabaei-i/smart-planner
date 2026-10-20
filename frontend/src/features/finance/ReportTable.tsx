import React, { memo, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiList } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { formatCompact, getTransactionColor, getTransactionSign } from './currencyHelpers'
import { toJalaali } from 'jalaali-js'
import type { Transaction, Account, Categories } from '../../types/finance'

interface ReportTableProps {
  transactions?: Transaction[]
  accounts?: Account[]
  categories?: Categories
}

const PAGE_SIZE = 20

const ReportTable = memo(({ transactions = [], accounts = [], categories = { income: [], expense: [] } }: ReportTableProps) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const [page, setPage] = useState(1)

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const a of accounts) map[a.id] = a.name
    return map
  }, [accounts])

  const categoryMap = useMemo(() => {
    const map: Record<string, any> = {}
    for (const c of categories.income || []) map[`income:${c.id}`] = c
    for (const c of categories.expense || []) map[`expense:${c.id}`] = c
    return map
  }, [categories])

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [transactions, page])

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    if (!isPersian) return dateStr
    try {
      const [y, m, d] = dateStr.split('-').map(Number)
      const j = toJalaali(y, m, d)
      return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`
    } catch {
      return dateStr
    }
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiList size={16} className="text-emerald-600 dark:text-emerald-400" />
          {t('finance.reports.table.title')}
        </h3>
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <FiList size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('finance.reports.table.empty')}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiList size={16} className="text-emerald-600 dark:text-emerald-400" />
          {t('finance.reports.table.title')}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isPersian ? `${transactions.length.toLocaleString('fa-IR')} تراکنش` : `${transactions.length} transactions`}
        </span>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm table-fixed min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-start text-xs font-semibold text-gray-500 py-2 w-24">{t('finance.reports.table.date')}</th>
              <th className="text-start text-xs font-semibold text-gray-500 py-2">{t('finance.reports.table.description')}</th>
              <th className="text-start text-xs font-semibold text-gray-500 py-2 w-32">{t('finance.reports.table.category')}</th>
              <th className="text-start text-xs font-semibold text-gray-500 py-2 w-32">{t('finance.reports.table.account')}</th>
              <th className="text-end text-xs font-semibold text-gray-500 py-2 w-32">{t('finance.reports.table.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(tx => {
              const catKey = `${tx.type}:${tx.category}`
              const cat = categoryMap[catKey]
              const accountName = accountMap[tx.accountId] || '—'
              const sign = getTransactionSign(tx.type)
              const colorClass = getTransactionColor(tx.type)

              return (
                <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-2.5 text-xs text-gray-500">{formatDate(tx.date)}</td>
                  <td className="py-2.5 text-xs text-gray-700 dark:text-gray-300 truncate">
                    {tx.description || <span className="text-gray-400 italic">{t('finance.reports.table.noDescription')}</span>}
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '20', color: cat?.color || '#6b7280' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                      {cat?.name || tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs text-gray-600 dark:text-gray-400 truncate">{accountName}</td>
                  <td className={`py-2.5 text-end text-xs font-semibold ${colorClass}`}>
                    {sign}{formatCompact(Number(tx.amount) || 0, isPersian)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
          >
            {isPersian ? 'قبلی' : 'Prev'}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isPersian ? `صفحه ${page.toLocaleString('fa-IR')} از ${totalPages.toLocaleString('fa-IR')}` : `Page ${page} of ${totalPages}`}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
          >
            {isPersian ? 'بعدی' : 'Next'}
          </button>
        </div>
      )}
    </Card>
  )
})

ReportTable.displayName = 'ReportTable'
export default ReportTable