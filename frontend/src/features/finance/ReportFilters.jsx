// frontend/src/features/finance/ReportFilters.jsx
import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiFilter, FiX } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormSelect from '../../components/ui/FormSelect'
import DatePicker from '../../components/ui/DatePicker'
import { getTodayStr, getLocalDateStr } from '../../utils/dateHelpers'

// ═══════════════════════════════════════════════
// ✅ Helpers — بازه‌های آماده
// ═══════════════════════════════════════════════

const addMonths = (date, months) => {
  const d = new Date(date)
  d.setDate(1) // جلوگیری از پرش ماه (مثل ۳۱ ژانویه → ۳ مارس)
  d.setMonth(d.getMonth() + months)
  return d
}

const startOfMonth = (date) => {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const endOfMonth = (date) => {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

const getPresetRange = (preset) => {
  const today = new Date()
  const todayStr = getLocalDateStr(today)

  switch (preset) {
    case 'today':
      return { from: todayStr, to: todayStr }

    case 'thisWeek': {
      const day = today.getDay() // 0=Sunday
      // هفته ایرانی: شنبه=0 ... جمعه=6
      const persianDayIndex = (day + 1) % 7
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - persianDayIndex)
      return { from: getLocalDateStr(weekStart), to: todayStr }
    }

    case 'thisMonth':
      return {
        from: getLocalDateStr(startOfMonth(today)),
        to: todayStr
      }

    case 'lastMonth': {
      const lastMonth = addMonths(today, -1)
      return {
        from: getLocalDateStr(startOfMonth(lastMonth)),
        to: getLocalDateStr(endOfMonth(lastMonth))
      }
    }

    case 'last3Months': {
      const threeMonthsAgo = addMonths(today, -2)
      return {
        from: getLocalDateStr(startOfMonth(threeMonthsAgo)),
        to: todayStr
      }
    }

    case 'thisYear':
      return {
        from: getLocalDateStr(new Date(today.getFullYear(), 0, 1)),
        to: todayStr
      }

    case 'custom':
    default:
      return null
  }
}

// ═══════════════════════════════════════════════
// ✅ Constants
// ═══════════════════════════════════════════════

const PRESET_KEYS = [
  'today',
  'thisWeek',
  'thisMonth',
  'lastMonth',
  'last3Months',
  'thisYear',
  'custom'
]

const TYPE_KEYS = ['all', 'income', 'expense', 'transfer']

// ═══════════════════════════════════════════════
// ✅ Component
// ═══════════════════════════════════════════════

const ReportFilters = memo(({
  filters,
  onChange,
  onReset,
  accounts = [],
  categories = {}
}) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ─────────────────────────────────────────────
  // ✅ Options
  // ─────────────────────────────────────────────
  const presetOptions = useMemo(
    () => PRESET_KEYS.map(key => ({
      value: key,
      label: t(`finance.reports.filters.presets.${key}`)
    })),
    [t]
  )

  const typeOptions = useMemo(
    () => TYPE_KEYS.map(key => ({
      value: key,
      label: t(`finance.reports.filters.types.${key}`)
    })),
    [t]
  )

  const accountOptions = useMemo(
    () => [
      { value: '', label: t('finance.reports.filters.allAccounts') },
      ...accounts
        .filter(a => a.isActive !== false)
        .map(a => ({ value: a.id, label: a.name }))
    ],
    [accounts, t]
  )

  // ✅ دسته‌بندی‌ها بر اساس نوع تراکنش انتخابی
  const categoryOptions = useMemo(() => {
    const baseOption = { value: '', label: t('finance.reports.filters.allCategories') }

    if (filters.type === 'transfer') {
      return [baseOption]
    }

    const income = (categories.income || []).map(c => ({
      value: `income:${c.id}`,
      label: `↓ ${c.name}`
    }))

    const expense = (categories.expense || []).map(c => ({
      value: `expense:${c.id}`,
      label: `↑ ${c.name}`
    }))

    if (filters.type === 'income') return [baseOption, ...income]
    if (filters.type === 'expense') return [baseOption, ...expense]

    // all → هر دو (با گروه‌بندی)
    return [baseOption, ...income, ...expense]
  }, [categories, filters.type, t])

  // ─────────────────────────────────────────────
  // ✅ Handlers
  // ─────────────────────────────────────────────
  const handlePresetChange = useCallback((e) => {
    const preset = e.target.value
    const range = getPresetRange(preset)
    onChange({
      ...filters,
      preset,
      ...(range || {})
    })
  }, [filters, onChange])

  const handleFromChange = useCallback((e) => {
    onChange({ ...filters, from: e.target.value, preset: 'custom' })
  }, [filters, onChange])

  const handleToChange = useCallback((e) => {
    onChange({ ...filters, to: e.target.value, preset: 'custom' })
  }, [filters, onChange])

  const handleTypeChange = useCallback((e) => {
    onChange({ ...filters, type: e.target.value, categoryId: '' })
  }, [filters, onChange])

  const handleAccountChange = useCallback((e) => {
    onChange({ ...filters, accountId: e.target.value })
  }, [filters, onChange])

  const handleCategoryChange = useCallback((e) => {
    onChange({ ...filters, categoryId: e.target.value })
  }, [filters, onChange])

  // ✅ تعداد فیلترهای فعال (برای نمایش روی badge)
  const activeCount = useMemo(() => {
    let n = 0
    if (filters.type && filters.type !== 'all') n++
    if (filters.accountId) n++
    if (filters.categoryId) n++
    if (filters.preset && filters.preset !== 'custom') n++
    return n
  }, [filters])

  const isCustom = filters.preset === 'custom'

  // ─────────────────────────────────────────────
  // ✅ Render
  // ─────────────────────────────────────────────
  return (
    <Card className="p-4 sm:p-5">
      {/* هدر */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFilter size={16} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('finance.reports.filters.title')}
          </h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              {isPersian
                ? activeCount.toLocaleString('fa-IR')
                : activeCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="small"
          onClick={onReset}
          disabled={activeCount === 0 && !isCustom}
        >
          <FiX size={14} />
          <span>{t('finance.reports.filters.reset')}</span>
        </Button>
      </div>

      {/* گرید فیلترها */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Preset */}
        <FormSelect
          label={t('finance.reports.filters.presetLabel')}
          value={filters.preset || 'thisMonth'}
          onChange={handlePresetChange}
          options={presetOptions}
        />

        {/* نوع تراکنش */}
        <FormSelect
          label={t('finance.reports.filters.type')}
          value={filters.type || 'all'}
          onChange={handleTypeChange}
          options={typeOptions}
        />

        {/* حساب */}
        <FormSelect
          label={t('finance.reports.filters.account')}
          value={filters.accountId || ''}
          onChange={handleAccountChange}
          options={accountOptions}
        />

        {/* از تاریخ */}
        <DatePicker
          label={t('finance.reports.filters.fromDate')}
          value={filters.from || ''}
          onChange={handleFromChange}
          max={filters.to || undefined}
        />

        {/* تا تاریخ */}
        <DatePicker
          label={t('finance.reports.filters.toDate')}
          value={filters.to || ''}
          onChange={handleToChange}
          min={filters.from || undefined}
        />

        {/* دسته‌بندی */}
        <FormSelect
          label={t('finance.reports.filters.category')}
          value={filters.categoryId || ''}
          onChange={handleCategoryChange}
          options={categoryOptions}
          disabled={filters.type === 'transfer'}
        />
      </div>
    </Card>
  )
})

ReportFilters.displayName = 'ReportFilters'

export default ReportFilters