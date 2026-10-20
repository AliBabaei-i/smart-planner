import React, { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSave, FiX, FiAlertTriangle, FiInfo, FiRefreshCw } from 'react-icons/fi'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import FormSelect from '../../components/ui/FormSelect'
import DatePicker from '../../components/ui/DatePicker'
import FormTextarea from '../../components/ui/FormTextarea'
import CurrencyInput from './CurrencyInput'
import { addPlan, updatePlan, deletePlan, PLAN_TYPES } from './financeSlice'
import { getTodayStr } from '../../utils/dateHelpers'
import { formatNumber } from './currencyHelpers'
import type { RootState, AppDispatch } from '../../app/store'
import type { Plan } from '../../types/finance'

const PERIODICITY_OPTIONS = [
  { value: 'daily', label: 'روزانه', labelEn: 'Daily' },
  { value: 'weekly', label: 'هفتگی', labelEn: 'Weekly' },
  { value: 'monthly', label: 'ماهانه', labelEn: 'Monthly' },
  { value: 'yearly', label: 'سالانه', labelEn: 'Yearly' }
]

// ✅ FIX: تعریف اینترفیس برای پراپ‌ها
interface PlanFormProps {
  plan?: Plan | null
  onClose: () => void
}

const PlanForm = memo(({ plan = null, onClose }: PlanFormProps) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!plan

  // ✅ FIX: استفاده از RootState
  const finance = useSelector((state: RootState) => state.finance)
  const { accounts = [] } = finance || {}

  const [formData, setFormData] = useState({
    type: plan?.type || 'debt',
    title: plan?.title || '',
    description: plan?.description || '',
    totalAmount: plan?.totalAmount || '',
    currency: plan?.currency || 'IRR',
    startDate: plan?.startDate || getTodayStr(),
    installmentsCount: plan?.installmentsCount || 12,
    installmentAmount: plan?.installmentAmount || '',
    periodicity: plan?.periodicity || 'monthly',
    accountId: plan?.accountId || '',
    counterparty: plan?.counterparty || ''
  })

  const [lastEdited, setLastEdited] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lastEdited) return
    const total = parseFloat(String(formData.totalAmount)) || 0
    const count = parseInt(String(formData.installmentsCount)) || 0
    const perInstallment = parseFloat(String(formData.installmentAmount)) || 0

    if (lastEdited === 'totalAmount' || lastEdited === 'installmentsCount') {
      if (total > 0 && count > 0) {
        const calculated = Math.floor(total / count)
        if (calculated !== perInstallment) setFormData(prev => ({ ...prev, installmentAmount: calculated }))
      }
      return
    }

    if (lastEdited === 'installmentAmount') {
      if (total > 0 && perInstallment > 0) {
        const calculated = Math.ceil(total / perInstallment)
        if (calculated !== count && calculated > 0) setFormData(prev => ({ ...prev, installmentsCount: calculated }))
      }
    }
  }, [lastEdited, formData.totalAmount, formData.installmentsCount, formData.installmentAmount])

  const lastInstallmentInfo = useMemo(() => {
    const total = parseFloat(String(formData.totalAmount)) || 0
    const count = parseInt(String(formData.installmentsCount)) || 0
    const per = parseFloat(String(formData.installmentAmount)) || 0
    if (total <= 0 || count <= 0 || per <= 0) return null
    const remainder = total - (per * (count - 1))
    if (remainder !== per && remainder > 0) return { amount: remainder, hasDifference: true }
    return { amount: per, hasDifference: false }
  }, [formData.totalAmount, formData.installmentsCount, formData.installmentAmount])

  const handleFieldChange = useCallback((field: string, value: any) => {
    if (['totalAmount', 'installmentsCount', 'installmentAmount'].includes(field)) setLastEdited(field)
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleResetAutoCalc = useCallback(() => {
    setLastEdited(null)
    setFormData(prev => ({ ...prev, installmentAmount: '' }))
  }, [])

  const planTypeOptions = useMemo(() => Object.values(PLAN_TYPES).map((p: any) => ({ value: p.id, label: isPersian ? p.label : p.id })), [isPersian])
  const accountOptions = useMemo(() => accounts.filter((a: any) => a.isActive).map((a: any) => ({ value: a.id, label: a.name })), [accounts])
  const periodicityOptions = useMemo(() => PERIODICITY_OPTIONS.map(p => ({ value: p.value, label: isPersian ? p.label : p.labelEn })), [isPersian])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return toast.error(isPersian ? 'عنوان را وارد کن' : 'Enter a title')
    if (!formData.totalAmount || parseFloat(String(formData.totalAmount)) <= 0) return toast.error(isPersian ? 'مبلغ کل را وارد کن' : 'Enter total amount')
    if (!formData.installmentsCount || parseInt(String(formData.installmentsCount)) < 1) return toast.error(isPersian ? 'تعداد اقساط باید حداقل ۱ باشد' : 'At least 1 installment')

    setLoading(true)
    try {
      const payload = {
        ...formData,
        totalAmount: parseFloat(String(formData.totalAmount)) || 0,
        installmentsCount: parseInt(String(formData.installmentsCount)) || 1,
        installmentAmount: formData.installmentAmount ? parseFloat(String(formData.installmentAmount)) : null,
        lastInstallmentAmount: lastInstallmentInfo?.amount || null
      }
      if (isEdit && plan) {
        dispatch(updatePlan({ id: plan.id, ...payload }))
        toast.success(isPersian ? 'پلن ذخیره شد' : 'Plan saved')
      } else {
        dispatch(addPlan(payload as any))
        toast.success(isPersian ? 'پلن ایجاد شد' : 'Plan created')
      }
      onClose()
    } catch (error) {
      toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed')
    } finally { setLoading(false) }
  }, [formData, isEdit, plan, dispatch, isPersian, onClose, lastInstallmentInfo])

  const handleDelete = useCallback(() => {
    if (!plan) return
    if (!window.confirm(isPersian ? 'این پلن حذف شود؟' : 'Delete this plan?')) return
    dispatch(deletePlan(plan.id))
    onClose()
  }, [plan, dispatch, isPersian, onClose])

  const isDebt = formData.type === 'debt' || formData.type === 'loan' || formData.type === 'installment'

  return (
    <Modal isOpen onClose={onClose} size="large" title={isEdit ? (isPersian ? 'ویرایش پلن' : 'Edit Plan') : (isPersian ? 'پلن جدید' : 'New Plan')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(PLAN_TYPES).map((type: any) => {
            const isActive = formData.type === type.id
            return (
              <button key={type.id} type="button" onClick={() => handleFieldChange('type', type.id)}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${isActive ? 'border-transparent ring-2 ring-offset-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                style={isActive ? { backgroundColor: `${type.color}15`, ['--tw-ring-color' as any]: type.color } : {}}>
                <span className="text-xs font-medium" style={isActive ? { color: type.color } : {}}>{isPersian ? type.label : type.id}</span>
              </button>
            )
          })}
        </div>

        {isDebt && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
            <FiAlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">{isPersian ? 'اگه این وام شامل سود (ربا) است، توجه داشته باش که ربا حرام است.' : 'If this involves interest (riba), note that riba is forbidden in Islam.'}</p>
          </div>
        )}

        <Input label={isPersian ? 'عنوان' : 'Title'} value={formData.title} onChange={(e) => handleFieldChange('title', e.target.value)} required autoFocus />
        <Input label={isPersian ? 'طرف حساب' : 'Counterparty'} value={formData.counterparty} onChange={(e) => handleFieldChange('counterparty', e.target.value)} />

        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{isPersian ? 'مبالغ و اقساط' : 'Amounts & Installments'}</span>
            {lastEdited && <button type="button" onClick={handleResetAutoCalc} className="text-xs text-emerald-600 flex items-center gap-1"><FiRefreshCw size={10} />{isPersian ? 'بازنشانی' : 'Reset'}</button>}
          </div>
          <CurrencyInput label={isPersian ? 'مبلغ کل' : 'Total Amount'} value={formData.totalAmount} onChange={(e: any) => handleFieldChange('totalAmount', e.target.value)} currency={formData.currency} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{isPersian ? 'تعداد اقساط' : 'Count'} *</label>
              <input type="number" value={formData.installmentsCount} onChange={(e) => handleFieldChange('installmentsCount', e.target.value)} min="1" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-center font-bold focus:ring-2 focus:ring-emerald-500" />
            </div>
            <CurrencyInput label={isPersian ? 'مبلغ هر قسط' : 'Per Installment'} value={formData.installmentAmount} onChange={(e: any) => handleFieldChange('installmentAmount', e.target.value)} currency={formData.currency} />
          </div>
          {lastInstallmentInfo?.hasDifference && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
              <FiInfo size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">{isPersian ? `قسط آخر: ${formatNumber(lastInstallmentInfo.amount, isPersian)} (باقیمانده)` : `Last: ${formatNumber(lastInstallmentInfo.amount, isPersian)}`}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label={isPersian ? 'دوره' : 'Periodicity'} value={formData.periodicity} onChange={(e) => handleFieldChange('periodicity', e.target.value)} options={periodicityOptions} />
          <DatePicker label={isPersian ? 'تاریخ شروع' : 'Start Date'} value={formData.startDate} onChange={(e) => handleFieldChange('startDate', e.target.value)} />
        </div>

        <FormSelect label={isPersian ? 'حساب مرتبط' : 'Account'} value={formData.accountId} onChange={(e) => handleFieldChange('accountId', e.target.value)} options={accountOptions} placeholder={isPersian ? 'انتخاب حساب' : 'Select account'} />
        <FormTextarea label={isPersian ? 'توضیحات' : 'Description'} value={formData.description} onChange={(e) => handleFieldChange('description', e.target.value)} rows={2} />

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" loading={loading} className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"><FiSave size={16} /><span>{isEdit ? (isPersian ? 'ذخیره' : 'Save') : (isPersian ? 'ایجاد' : 'Create')}</span></Button>
          {isEdit && <Button type="button" variant="danger" onClick={handleDelete}>{isPersian ? 'حذف' : 'Delete'}</Button>}
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1"><FiX size={16} /><span>{isPersian ? 'انصراف' : 'Cancel'}</span></Button>
        </div>
      </form>
    </Modal>
  )
})
PlanForm.displayName = 'PlanForm'
export default PlanForm