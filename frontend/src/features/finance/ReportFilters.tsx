import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiFilter, FiX } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormSelect from '../../components/ui/FormSelect'
import DatePicker from '../../components/ui/DatePicker'
import { getTodayStr, getLocalDateStr } from '../../utils/dateHelpers'
import type { Account, Categories } from '../../types/finance'

// ✅ FIX: اینترفیس برای فیلترها
export interface ReportFiltersState {
  preset: string
  from: string
  to: string
  type: string
  accountId: string
  categoryId: string
}

interface ReportFiltersProps {
  filters: ReportFiltersState
  onChange: (filters: ReportFiltersState) => void
  onReset: () => void
  accounts?: Account[]
  categories?: Categories
}

// ✅ helpers (بدون تغییر)
const addMonths = (date: Date, months: number) => { const d = new Date(date); d.setDate(1); d.setMonth(d.getMonth() + months); return d }
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)

const getPresetRange = (preset: string) => {
  const today = new Date(); const todayStr = getLocalDateStr(today)
  switch (preset) {
    case 'today': return { from: todayStr, to: todayStr }
    case 'thisWeek': { const day = today.getDay(); const persianDayIndex = (day + 1) % 7; const weekStart = new Date(today); weekStart.setDate(today.getDate() - persianDayIndex); return { from: getLocalDateStr(weekStart), to: todayStr } }
    case 'thisMonth': return { from: getLocalDateStr(startOfMonth(today)), to: todayStr }
    case 'lastMonth': { const lastMonth = addMonths(today, -1); return { from: getLocalDateStr(startOfMonth(lastMonth)), to: getLocalDateStr(endOfMonth(lastMonth)) } }
    case 'last3Months': { const threeMonthsAgo = addMonths(today, -2); return { from: getLocalDateStr(startOfMonth(threeMonthsAgo)), to: todayStr } }
    case 'thisYear': return { from: getLocalDateStr(new Date(today.getFullYear(), 0, 1)), to: todayStr }
    default: return null
  }
}

const PRESET_KEYS = ['today', 'thisWeek', 'thisMonth', 'lastMonth', 'last3Months', 'thisYear', 'custom']
const TYPE_KEYS = ['all', 'income', 'expense', 'transfer']

const ReportFilters = memo(({ filters, onChange, onReset, accounts = [], categories = { income: [], expense: [] } }: ReportFiltersProps) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const presetOptions = useMemo(() => PRESET_KEYS.map(key => ({ value: key, label: t(`finance.reports.filters.presets.${key}`) })), [t])
  const typeOptions = useMemo(() => TYPE_KEYS.map(key => ({ value: key, label: t(`finance.reports.filters.types.${key}`) })), [t])
  const accountOptions = useMemo(() => [{ value: '', label: t('finance.reports.filters.allAccounts') }, ...accounts.filter(a => a.isActive !== false).map(a => ({ value: a.id, label: a.name }))], [accounts, t])

  const categoryOptions = useMemo(() => {
    const baseOption = { value: '', label: t('finance.reports.filters.allCategories') }
    if (filters.type === 'transfer') return [baseOption]
    const income = (categories.income || []).map(c => ({ value: `income:${c.id}`, label: `↓ ${c.name}` }))
    const expense = (categories.expense || []).map(c => ({ value: `expense:${c.id}`, label: `↑ ${c.name}` }))
    if (filters.type === 'income') return [baseOption, ...income]
    if (filters.type === 'expense') return [baseOption, ...expense]
    return [baseOption, ...income, ...expense]
  }, [categories, filters.type, t])

  const handlePresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value
    const range = getPresetRange(preset)
    onChange({ ...filters, preset, ...(range || {}) })
  }, [filters, onChange])

  const handleFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, from: e.target.value, preset: 'custom' }), [filters, onChange])
  const handleToChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, to: e.target.value, preset: 'custom' }), [filters, onChange])
  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...filters, type: e.target.value, categoryId: '' }), [filters, onChange])
  const handleAccountChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...filters, accountId: e.target.value }), [filters, onChange])
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...filters, categoryId: e.target.value }), [filters, onChange])

  const activeCount = useMemo(() => {
    let n = 0
    if (filters.type && filters.type !== 'all') n++
    if (filters.accountId) n++
    if (filters.categoryId) n++
    if (filters.preset && filters.preset !== 'custom') n++
    return n
  }, [filters])

  const isCustom = filters.preset === 'custom'

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFilter size={16} className="text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('finance.reports.filters.title')}</h3>
          {activeCount > 0 && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{isPersian ? activeCount.toLocaleString('fa-IR') : activeCount}</span>}
        </div>
        <Button variant="ghost" size="small" onClick={onReset} disabled={activeCount === 0 && !isCustom}><FiX size={14} /><span>{t('finance.reports.filters.reset')}</span></Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormSelect label={t('finance.reports.filters.presetLabel')} value={filters.preset || 'thisMonth'} onChange={handlePresetChange} options={presetOptions} />
        <FormSelect label={t('finance.reports.filters.type')} value={filters.type || 'all'} onChange={handleTypeChange} options={typeOptions} />
        <FormSelect label={t('finance.reports.filters.account')} value={filters.accountId || ''} onChange={handleAccountChange} options={accountOptions} />
        <DatePicker label={t('finance.reports.filters.fromDate')} value={filters.from || ''} onChange={handleFromChange} max={filters.to || undefined} />
        <DatePicker label={t('finance.reports.filters.toDate')} value={filters.to || ''} onChange={handleToChange} min={filters.from || undefined} />
        <FormSelect label={t('finance.reports.filters.category')} value={filters.categoryId || ''} onChange={handleCategoryChange} options={categoryOptions} disabled={filters.type === 'transfer'} />
      </div>
    </Card>
  )
})
ReportFilters.displayName = 'ReportFilters'
export default ReportFilters