import React, { useState, useMemo, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSave, FiX, FiTarget, FiFolder } from 'react-icons/fi'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import DatePicker from '../../../components/ui/DatePicker'
import FormSelect from '../../../components/ui/FormSelect'
import CurrencyInput from './CurrencyInput'
import {
  addBudget,
  updateBudget,
  deleteBudget,
  BUDGET_PERIODS
} from '../financeSlice'
import { getTodayStr } from '../../../utils/dateHelpers'

// ✅ helper: تاریخ پایان بر اساس دوره
const getEndDate = (startDate, period) => {
  const start = new Date(startDate)
  const end = new Date(start)
  switch (period) {
    case 'daily':
      end.setDate(start.getDate())
      break
    case 'weekly':
      end.setDate(start.getDate() + 6)
      break
    case 'monthly':
      end.setMonth(start.getMonth() + 1)
      end.setDate(end.getDate() - 1)
      break
    case 'yearly':
      end.setFullYear(start.getFullYear() + 1)
      end.setDate(end.getDate() - 1)
      break
    default:
      end.setMonth(start.getMonth() + 1)
  }
  return end.toISOString().split('T')[0]
}

const BudgetForm = memo(({ budget = null, onClose }) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!budget

  const finance = useSelector(state => state.finance || {})
  const { categories = { expense: [] } } = finance
  const { projects = [] } = useSelector(state => state.projects)

  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount || '',
    currency: budget?.currency || 'IRR',
    period: budget?.period || 'monthly',
    startDate: budget?.startDate || getTodayStr(),
    endDate: budget?.endDate || getEndDate(getTodayStr(), 'monthly'),
    rollover: budget?.rollover || false,
    // ✅ پروژه مرتبط
    projectId: budget?.projectId || ''
  })
  const [loading, setLoading] = useState(false)

  // ✅ وقتی دوره یا تاریخ شروع عوض می‌شه، پایان رو محاسبه کن
  const handlePeriodChange = useCallback((period) => {
    setFormData(prev => ({
      ...prev,
      period,
      endDate: getEndDate(prev.startDate, period)
    }))
  }, [])

  const handleStartDateChange = useCallback((e) => {
    const newStart = e.target.value
    setFormData(prev => ({
      ...prev,
      startDate: newStart,
      endDate: getEndDate(newStart, prev.period)
    }))
  }, [])

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const categoryOptions = useMemo(() =>
    (categories.expense || []).map(c => ({
      value: c.id,
      label: isPersian ? c.name : c.id
    })),
    [categories.expense, isPersian]
  )

  const periodOptions = useMemo(() =>
    Object.values(BUDGET_PERIODS).map(p => ({
      value: p.id,
      label: isPersian ? p.label : p.id
    })),
    [isPersian]
  )

  const projectOptions = useMemo(() =>
    projects.map(p => ({
      value: p.id,
      label: p.name
    })),
    [projects]
  )

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    if (!formData.category) {
      toast.error(isPersian ? 'دسته‌بندی را انتخاب کن' : 'Select a category', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(isPersian ? 'مبلغ بودجه را وارد کن' : 'Enter a budget amount', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        projectId: formData.projectId || null
      }

      if (isEdit) {
        dispatch(updateBudget({ id: budget.id, ...payload }))
        toast.success(isPersian ? 'بودجه ذخیره شد' : 'Budget saved', {
          position: 'bottom-left', autoClose: 2500
        })
      } else {
        dispatch(addBudget(payload))
        toast.success(isPersian ? 'بودجه ایجاد شد' : 'Budget created', {
          position: 'bottom-left', autoClose: 2500
        })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed', {
        position: 'bottom-left', autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }, [formData, isEdit, budget, dispatch, isPersian, onClose])

  const handleDelete = useCallback(() => {
    if (!budget) return
    if (!window.confirm(isPersian ? 'این بودجه حذف شود؟' : 'Delete this budget?')) return

    dispatch(deleteBudget(budget.id))
    toast.success(isPersian ? 'بودجه حذف شد' : 'Budget deleted', {
      position: 'bottom-left', autoClose: 2500
    })
    onClose()
  }, [budget, dispatch, isPersian, onClose])

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="default"
      title={isEdit
        ? (isPersian ? 'ویرایش بودجه' : 'Edit Budget')
        : (isPersian ? 'بودجه جدید' : 'New Budget')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ✅ دسته‌بندی */}
        <FormSelect
          label={isPersian ? 'دسته‌بندی' : 'Category'}
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
          placeholder={isPersian ? 'انتخاب دسته' : 'Select category'}
          required
        />

        {/* ✅ پروژه مرتبط (اختیاری) */}
        {projects.length > 0 && (
          <FormSelect
            label={
              <span className="flex items-center gap-1.5">
                <FiFolder size={12} />
                {isPersian ? 'پروژه مرتبط (اختیاری)' : 'Related Project (optional)'}
              </span>
            }
            value={formData.projectId}
            onChange={(e) => handleChange('projectId', e.target.value)}
            options={projectOptions}
            placeholder={isPersian ? 'بدون پروژه' : 'No project'}
          />
        )}

        {/* ✅ مبلغ */}
        <CurrencyInput
          label={isPersian ? 'سقف بودجه' : 'Budget Amount'}
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          currency={formData.currency}
          required
          size="large"
        />

        {/* ✅ دوره */}
        <FormSelect
          label={isPersian ? 'دوره' : 'Period'}
          value={formData.period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          options={periodOptions}
        />

        {/* ✅ تاریخ شروع */}
        <DatePicker
          label={isPersian ? 'تاریخ شروع' : 'Start Date'}
          value={formData.startDate}
          onChange={handleStartDateChange}
          placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
        />

        {/* ✅ تاریخ پایان (خودکار) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isPersian ? 'تاریخ پایان (خودکار)' : 'End Date (auto)'}
          </label>
          <input
            type="text"
            value={formData.endDate}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
          />
        </div>

        {/* ✅ Rollover */}
        <label className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={formData.rollover}
            onChange={(e) => handleChange('rollover', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong className="block mb-0.5">
              {isPersian ? 'انتقال باقیمانده' : 'Rollover remaining'}
            </strong>
            {isPersian
              ? 'اگر بودجه این دوره تموم نشه، به دوره بعد منتقل بشه'
              : 'If not fully spent, remaining transfers to next period'}
          </div>
        </label>

        {/* ✅ دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            loading={loading}
            className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
          >
            <FiSave size={16} />
            <span>{isEdit ? (isPersian ? 'ذخیره' : 'Save') : (isPersian ? 'ایجاد' : 'Create')}</span>
          </Button>

          {isEdit && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              {isPersian ? 'حذف' : 'Delete'}
            </Button>
          )}

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