import React, { useState, useRef, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiDownload, FiUpload, FiFileText, FiAlertTriangle,
  FiCheckCircle, FiTrash2, FiInfo, FiX
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { importFinanceData, resetFinance } from './financeSlice'
import { formatNumber } from './currencyHelpers'
import { getTodayStr } from '../../utils/dateHelpers'

const FinanceImportExport = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const {
    accounts = [],
    transactions = [],
    budgets = [],
    plans = [],
    planDues = [],
    categories = {},
    islamicSettings = {},
    currencySettings = {}
  } = finance

  const fileInputRef = useRef(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ✅ آمار
  const stats = {
    accounts: accounts.length,
    transactions: transactions.length,
    budgets: budgets.length,
    plans: plans.length,
    planDues: planDues.length
  }

  // ✅ Export JSON
  const handleExport = useCallback(() => {
    const data = {
      _meta: {
        app: 'Smart Planner',
        module: 'finance',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        language: i18n.language
      },
      accounts,
      transactions,
      budgets,
      plans,
      planDues,
      categories,
      islamicSettings,
      currencySettings
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `smart-planner-finance-${getTodayStr()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(
      isPersian ? 'پشتیبان‌گیری انجام شد' : 'Backup completed',
      { position: 'bottom-left', autoClose: 2500 }
    )
  }, [accounts, transactions, budgets, plans, planDues, categories, islamicSettings, currencySettings, i18n.language, isPersian])

  // ✅ Import JSON
  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)

        // ✅ اعتبارسنجی
        if (!data._meta || data._meta.module !== 'finance') {
          toast.error(
            isPersian 
              ? 'فایل معتبر نیست یا مربوط به بخش مالی نیست' 
              : 'Invalid file or not a finance module backup',
            { position: 'bottom-left', autoClose: 4000 }
          )
          return
        }

        // ✅ Import
        dispatch(importFinanceData({
          accounts: data.accounts || [],
          transactions: data.transactions || [],
          budgets: data.budgets || [],
          plans: data.plans || [],
          planDues: data.planDues || [],
          categories: data.categories,
          islamicSettings: data.islamicSettings,
          currencySettings: data.currencySettings
        }))

        toast.success(
          isPersian 
            ? `بازیابی انجام شد — ${data.transactions?.length || 0} تراکنش` 
            : `Import successful — ${data.transactions?.length || 0} transactions`,
          { position: 'bottom-left', autoClose: 3000 }
        )
      } catch (error) {
        console.error('Import error:', error)
        toast.error(
          isPersian ? 'خطا در خواندن فایل' : 'Failed to read file',
          { position: 'bottom-left', autoClose: 3000 }
        )
      }
    }
    reader.readAsText(file, 'UTF-8')

    // ✅ Reset input
    e.target.value = ''
  }, [dispatch, isPersian])

  const handleReset = useCallback(() => {
    dispatch(resetFinance())
    toast.success(
      isPersian ? 'همه داده‌های مالی پاک شد' : 'All finance data cleared',
      { position: 'bottom-left', autoClose: 2500 }
    )
    setShowResetConfirm(false)
  }, [dispatch, isPersian])

  const hasData = stats.transactions > 0 || stats.accounts > 0

  return (
    <div className="space-y-5">

      {/* ═══════════════════════════════════ */}
      {/* آمار */}
      {/* ═══════════════════════════════════ */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiInfo size={16} className="text-blue-600" />
          {isPersian ? 'خلاصه داده‌های فعلی' : 'Current Data Summary'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: isPersian ? 'حساب‌ها' : 'Accounts', value: stats.accounts, color: '#3b82f6' },
            { label: isPersian ? 'تراکنش‌ها' : 'Transactions', value: stats.transactions, color: '#10b981' },
            { label: isPersian ? 'بودجه‌ها' : 'Budgets', value: stats.budgets, color: '#f59e0b' },
            { label: isPersian ? 'پلن‌ها' : 'Plans', value: stats.plans, color: '#8b5cf6' }
          ].map((item, i) => (
            <div 
              key={i}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {formatNumber(item.value, isPersian)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════ */}
      {/* Export */}
      {/* ═══════════════════════════════════ */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <FiDownload size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {isPersian ? 'پشتیبان‌گیری' : 'Backup'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {isPersian 
                ? 'همه داده‌های مالی (حساب‌ها، تراکنش‌ها، بودجه‌ها، پلن‌ها، تنظیمات) در یه فایل JSON ذخیره می‌شه'
                : 'All financial data saved as a JSON file'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={!hasData}
          className="w-full !bg-blue-600 hover:!bg-blue-700"
        >
          <FiDownload size={16} />
          <span>{isPersian ? 'دانلود پشتیبان' : 'Download Backup'}</span>
        </Button>

        {!hasData && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            {isPersian ? 'داده‌ای برای پشتیبان‌گیری وجود ندارد' : 'No data to backup'}
          </p>
        )}
      </Card>

      {/* ═══════════════════════════════════ */}
      {/* Import */}
      {/* ═══════════════════════════════════ */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <FiUpload size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {isPersian ? 'بازیابی' : 'Restore'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {isPersian 
                ? 'یه فایل پشتیبان JSON بارگذاری کن. توجه: این کار داده‌های فعلی رو جایگزین می‌کنه.'
                : 'Upload a JSON backup. Warning: This replaces current data.'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
          <div className="flex items-start gap-2">
            <FiAlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {isPersian 
                ? 'قبل از بازیابی، از داده‌های فعلی پشتیبان بگیر'
                : 'Backup your current data before restoring'}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full !bg-emerald-600 hover:!bg-emerald-700"
        >
          <FiUpload size={16} />
          <span>{isPersian ? 'بارگذاری فایل پشتیبان' : 'Upload Backup File'}</span>
        </Button>
      </Card>

      {/* ═══════════════════════════════════ */}
      {/* Reset */}
      {/* ═══════════════════════════════════ */}
      <Card className="p-5 border-2 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <FiTrash2 size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-red-700 dark:text-red-400 text-sm">
              {isPersian ? 'منطقه خطر' : 'Danger Zone'}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 leading-relaxed">
              {isPersian 
                ? 'پاک کردن همه داده‌های مالی. این عملیات قابل بازگشت نیست!'
                : 'Delete all finance data. This action cannot be undone!'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowResetConfirm(true)}
          disabled={!hasData}
          variant="danger"
          className="w-full"
        >
          <FiTrash2 size={16} />
          <span>{isPersian ? 'پاک کردن همه داده‌ها' : 'Reset All Data'}</span>
        </Button>
      </Card>

      {/* Confirm Reset */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title={isPersian ? 'پاک کردن همه داده‌ها' : 'Reset All Data'}
        message={isPersian 
          ? `آیا مطمئنی می‌خوای همه ${stats.transactions} تراکنش، ${stats.accounts} حساب و همه بودجه‌ها و پلن‌ها رو پاک کنی؟ این کار قابل بازگشت نیست!`
          : `Delete all ${stats.transactions} transactions, ${stats.accounts} accounts, and all budgets/plans? This cannot be undone!`}
        confirmText={isPersian ? 'بله، پاک کن' : 'Yes, delete'}
        cancelText={isPersian ? 'انصراف' : 'Cancel'}
        variant="danger"
      />
    </div>
  )
})

FinanceImportExport.displayName = 'FinanceImportExport'

export default FinanceImportExport