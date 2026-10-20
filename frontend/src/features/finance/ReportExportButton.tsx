import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiChevronDown } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Button from '../../components/ui/Button'
import { getLocalDateStr } from '../../utils/dateHelpers'
import type { Transaction, Account, Categories } from '../../types/finance'

interface ReportExportButtonProps {
  transactions?: Transaction[]
  filters?: any
  accounts?: Account[]
  categories?: Categories
}

const ReportExportButton = memo(({ transactions = [], filters = {}, accounts = [], categories = { income: [], expense: [] } }: ReportExportButtonProps) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const [open, setOpen] = useState(false)

  const getFileName = (ext: string) => `finance-report_${filters.from || 'all'}_${filters.to || getLocalDateStr()}.${ext}`

  const downloadBlob = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url) }, 100)
  }

  const handleExportCSV = useCallback(() => {
    if (transactions.length === 0) return toast.warn(t('finance.reports.export.empty'))
    const accountMap: Record<string, string> = {}
    for (const a of accounts) accountMap[a.id] = a.name
    const categoryMap: Record<string, string> = {}
    for (const c of categories.income || []) categoryMap[`income:${c.id}`] = c.name
    for (const c of categories.expense || []) categoryMap[`expense:${c.id}`] = c.name

    const headers = [t('finance.reports.table.date'), t('finance.reports.table.description'), t('finance.reports.table.category'), t('finance.reports.table.account'), t('finance.reports.table.amount'), t('finance.reports.export.type')]
    const escape = (val: any) => { const str = String(val ?? ''); return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str }
    const rows = transactions.map(tx => [tx.date || '', tx.description || '', categoryMap[`${tx.type}:${tx.category}`] || tx.category || '', accountMap[tx.accountId] || '', tx.amount || 0, tx.type || ''].map(escape).join(','))

    const csv = '\uFEFF' + headers.map(escape).join(',') + '\n' + rows.join('\n')
    downloadBlob(csv, getFileName('csv'), 'text/csv')
    toast.success(t('finance.reports.export.success'))
    setOpen(false)
  }, [transactions, accounts, categories, filters, t])

  const handleExportJSON = useCallback(() => {
    if (transactions.length === 0) return toast.warn(t('finance.reports.export.empty'))
    const payload = { version: '2.0', exportedAt: new Date().toISOString(), filters, summary: { count: transactions.length, totalIncome: transactions.filter(x => x.type === 'income').reduce((s, x) => s + (Number(x.amount) || 0), 0), totalExpense: transactions.filter(x => x.type === 'expense').reduce((s, x) => s + (Number(x.amount) || 0), 0) }, transactions }
    downloadBlob(JSON.stringify(payload, null, 2), getFileName('json'), 'application/json')
    toast.success(t('finance.reports.export.success'))
    setOpen(false)
  }, [transactions, filters, t])

  return (
    <div className="relative inline-block">
      <Button variant="secondary" size="small" onClick={() => setOpen(o => !o)} disabled={transactions.length === 0}>
        <FiDownload size={14} />
        <span>{t('finance.reports.export.button')}</span>
        <FiChevronDown size={12} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 top-full mt-1 end-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]">
            <button type="button" onClick={handleExportCSV} className="w-full text-start px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('finance.reports.export.csv')}</button>
            <button type="button" onClick={handleExportJSON} className="w-full text-start px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('finance.reports.export.json')}</button>
          </div>
        </>
      )}
    </div>
  )
})
ReportExportButton.displayName = 'ReportExportButton'
export default ReportExportButton