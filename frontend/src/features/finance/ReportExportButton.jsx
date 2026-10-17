// frontend/src/features/finance/ReportExportButton.jsx
import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiChevronDown } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Button from '../../components/ui/Button'
import { getLocalDateStr } from '../../utils/dateHelpers'

const ReportExportButton = memo(({
  transactions = [],
  filters = {},
  accounts = [],
  categories = {}
}) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [open, setOpen] = useState(false)

  // ✅ ساخت نام فایل
  const getFileName = (ext) => {
    const from = filters.from || 'all'
    const to = filters.to || getLocalDateStr()
    return `finance-report_${from}_${to}.${ext}`
  }

  // ✅ دانلود Blob
  const downloadBlob = (content, fileName, mimeType) => {
    // ✅ BOM برای Excel + متن فارسی
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
  }

  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    if (transactions.length === 0) {
      toast.warn(t('finance.reports.export.empty'))
      setOpen(false)
      return
    }

    const accountMap = {}
    for (const a of accounts) accountMap[a.id] = a.name

    const categoryMap = {}
    for (const c of categories.income || []) categoryMap[`income:${c.id}`] = c.name
    for (const c of categories.expense || []) categoryMap[`expense:${c.id}`] = c.name

    const headers = [
      t('finance.reports.table.date'),
      t('finance.reports.table.description'),
      t('finance.reports.table.category'),
      t('finance.reports.table.account'),
      t('finance.reports.table.amount'),
      t('finance.reports.export.type')
    ]

    const escape = (val) => {
      const str = String(val ?? '')
      if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
      return str
    }

    const rows = transactions.map(tx => {
      const catKey = `${tx.type}:${tx.category}`
      return [
        tx.date || '',
        tx.description || '',
        categoryMap[catKey] || tx.category || '',
        accountMap[tx.accountId] || '',
        tx.amount || 0,
        tx.type || ''
      ].map(escape).join(',')
    })

    // ✅ BOM برای Excel
    const csv = '\uFEFF' + headers.map(escape).join(',') + '\n' + rows.join('\n')
    downloadBlob(csv, getFileName('csv'), 'text/csv')

    toast.success(t('finance.reports.export.success'))
    setOpen(false)
  }, [transactions, accounts, categories, filters, t])

  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    if (transactions.length === 0) {
      toast.warn(t('finance.reports.export.empty'))
      setOpen(false)
      return
    }

    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      filters,
      summary: {
        count: transactions.length,
        totalIncome: transactions
          .filter(x => x.type === 'income')
          .reduce((s, x) => s + (Number(x.amount) || 0), 0),
        totalExpense: transactions
          .filter(x => x.type === 'expense')
          .reduce((s, x) => s + (Number(x.amount) || 0), 0)
      },
      transactions
    }

    const json = JSON.stringify(payload, null, 2)
    downloadBlob(json, getFileName('json'), 'application/json')

    toast.success(t('finance.reports.export.success'))
    setOpen(false)
  }, [transactions, filters, t])

  return (
    <div className="relative inline-block">
      <Button
        variant="secondary"
        size="small"
        onClick={() => setOpen(o => !o)}
        disabled={transactions.length === 0}
      >
        <FiDownload size={14} />
        <span>{t('finance.reports.export.button')}</span>
        <FiChevronDown size={12} />
      </Button>

      {open && (
        <>
          {/* ✅ Backdrop برای بستن */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-40 top-full mt-1 end-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full text-start px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t('finance.reports.export.csv')}
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full text-start px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t('finance.reports.export.json')}
            </button>
          </div>
        </>
      )}
    </div>
  )
})

ReportExportButton.displayName = 'ReportExportButton'

export default ReportExportButton