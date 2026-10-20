  import React, { useState, useMemo, useCallback, memo } from 'react'
  import { useDispatch, useSelector } from 'react-redux'
  import { useTranslation } from 'react-i18next'
  import { toast } from 'react-toastify'
  import { FiSave, FiX, FiTarget, FiFolder } from 'react-icons/fi'
  import Modal from '../../components/ui/Modal'
  import Button from '../../components/ui/Button'
  import DatePicker from '../../components/ui/DatePicker'
  import FormSelect from '../../components/ui/FormSelect'
  import CurrencyInput from './CurrencyInput'
  import { addBudget, updateBudget, deleteBudget, BUDGET_PERIODS } from './financeSlice'
  import { getTodayStr } from '../../utils/dateHelpers'
  import type { RootState, AppDispatch } from '../../app/store'
  import type { Budget, BudgetPeriod, CurrencyCode } from '../../types/finance'

  // ✅ helper
  const getEndDate = (startDate: string, period: BudgetPeriod | string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    switch (period) {
      case 'daily': end.setDate(start.getDate()); break
      case 'weekly': end.setDate(start.getDate() + 6); break
      case 'monthly': end.setMonth(start.getMonth() + 1); end.setDate(end.getDate() - 1); break
      case 'yearly': end.setFullYear(start.getFullYear() + 1); end.setDate(end.getDate() - 1); break
      default: end.setMonth(start.getMonth() + 1)
    }
    return end.toISOString().split('T')[0]
  }

  // ✅ FIX: تعریف دقیق فرم
  interface BudgetFormData {
    category: string
    amount: string | number
    currency: CurrencyCode
    period: BudgetPeriod
    startDate: string
    endDate: string
    rollover: boolean
    projectId: string | null
  }

  interface BudgetFormProps {
    budget?: Budget | null
    onClose: () => void
  }

  const BudgetForm = memo(({ budget = null, onClose }: BudgetFormProps) => {
    const { i18n } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
    const isEdit = !!budget

    const finance = useSelector((state: RootState) => state.finance)
    const { categories = { income: [], expense: [] } } = finance || {}
    const { projects = [] } = useSelector((state: RootState) => state.projects)

    const [formData, setFormData] = useState<BudgetFormData>({
      category: budget?.category || '',
      amount: budget?.amount || '',
      currency: (budget?.currency as CurrencyCode) || 'IRR',
      period: (budget?.period as BudgetPeriod) || 'monthly',
      startDate: budget?.startDate || getTodayStr(),
      endDate: budget?.endDate || getEndDate(getTodayStr(), 'monthly'),
      rollover: budget?.rollover || false,
      projectId: budget?.projectId || null
    })
    const [loading, setLoading] = useState(false)

    // ✅ FIX: پارامتر period دقیقاً از نوع BudgetPeriod است
    const handlePeriodChange = useCallback((period: BudgetPeriod) => {
      setFormData(prev => ({
        ...prev,
        period,
        endDate: getEndDate(prev.startDate, period)
      }))
    }, [])

    const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = e.target.value
      setFormData(prev => ({
        ...prev,
        startDate: newStart,
        endDate: getEndDate(newStart, prev.period)
      }))
    }, [])

    const handleChange = useCallback(<K extends keyof BudgetFormData>(field: K, value: BudgetFormData[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const categoryOptions = useMemo(() =>
      (categories.expense || []).map((c: any) => ({ value: c.id, label: isPersian ? c.name : c.id })),
      [categories.expense, isPersian]
    )

    const periodOptions = useMemo(() =>
      Object.values(BUDGET_PERIODS).map((p: any) => ({ value: p.id, label: isPersian ? p.label : p.id })),
      [isPersian]
    )

    const projectOptions = useMemo(() =>
      projects.map((p: any) => ({ value: p.id, label: p.name })),
      [projects]
    )

    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.category) return toast.error(isPersian ? 'دسته‌بندی را انتخاب کن' : 'Select a category')
      if (!formData.amount || parseFloat(String(formData.amount)) <= 0) return toast.error(isPersian ? 'مبلغ بودجه را وارد کن' : 'Enter a budget amount')

      setLoading(true)
      try {
        const payload = {
          ...formData,
          amount: parseFloat(String(formData.amount)) || 0,
          projectId: formData.projectId || null
        }
        if (isEdit && budget) {
          dispatch(updateBudget({ id: budget.id, ...payload }))
          toast.success(isPersian ? 'بودجه ذخیره شد' : 'Budget saved')
        } else {
          dispatch(addBudget(payload as any))
          toast.success(isPersian ? 'بودجه ایجاد شد' : 'Budget created')
        }
        onClose()
      } catch (error) {
        toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed')
      } finally {
        setLoading(false)
      }
    }, [formData, isEdit, budget, dispatch, isPersian, onClose])

    const handleDelete = useCallback(() => {
      if (!budget) return
      if (!window.confirm(isPersian ? 'این بودجه حذف شود؟' : 'Delete this budget?')) return
      dispatch(deleteBudget(budget.id))
      onClose()
    }, [budget, dispatch, isPersian, onClose])

    return (
      <Modal isOpen onClose={onClose} size="default" title={isEdit ? (isPersian ? 'ویرایش بودجه' : 'Edit Budget') : (isPersian ? 'بودجه جدید' : 'New Budget')}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSelect
            label={isPersian ? 'دسته‌بندی' : 'Category'}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            options={categoryOptions}
            placeholder={isPersian ? 'انتخاب دسته' : 'Select category'}
            required
          />

          {projects.length > 0 && (
            <FormSelect
              label={
                <span className="flex items-center gap-1.5">
                  <FiFolder size={12} />
                  {isPersian ? 'پروژه مرتبط (اختیاری)' : 'Related Project'}
                </span>
              }
              value={formData.projectId || ''}
              onChange={(e) => handleChange('projectId', e.target.value || null)}
              options={projectOptions}
              placeholder={isPersian ? 'بدون پروژه' : 'No project'}
            />
          )}

          <CurrencyInput
            label={isPersian ? 'سقف بودجه' : 'Budget Amount'}
            value={formData.amount}
            onChange={(e: any) => handleChange('amount', e.target.value)}
            currency={formData.currency}
            required
            size="large"
          />

          <FormSelect
            label={isPersian ? 'دوره' : 'Period'}
            value={formData.period}
            onChange={(e) => handlePeriodChange(e.target.value as BudgetPeriod)}
            options={periodOptions}
          />

          <DatePicker
            label={isPersian ? 'تاریخ شروع' : 'Start Date'}
            value={formData.startDate}
            onChange={handleStartDateChange}
            placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              {isPersian ? 'تاریخ پایان (خودکار)' : 'End Date (auto)'}
            </label>
            <input
              type="text"
              value={formData.endDate}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>

          <label className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rollover}
              onChange={(e) => handleChange('rollover', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600"
            />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong className="block mb-0.5">
                {isPersian ? 'انتقال باقیمانده' : 'Rollover remaining'}
              </strong>
              {isPersian
                ? 'اگر بودجه این دوره تموم نشه، به دوره بعد منتقل بشه'
                : 'If not spent, transfer to next period'}
            </div>
          </label>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={loading} className="flex-1 !bg-emerald-600 hover:!bg-emerald-700">
              <FiSave size={16} />
              <span>{isEdit ? (isPersian ? 'ذخیره' : 'Save') : (isPersian ? 'ایجاد' : 'Create')}</span>
            </Button>
            {isEdit && <Button type="button" variant="danger" onClick={handleDelete}>{isPersian ? 'حذف' : 'Delete'}</Button>}
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              <FiX size={16} />
              <span>{isPersian ? 'انصراف' : 'Cancel'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    )
  })

  BudgetForm.displayName = 'BudgetForm'
  export default BudgetForm