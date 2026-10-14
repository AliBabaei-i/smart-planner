import React, { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave, FiX, FiAlertTriangle, FiInfo, FiRefreshCw
} from 'react-icons/fi'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import FormSelect from '../../../components/ui/FormSelect'
import DatePicker from '../../../components/ui/DatePicker'
import FormTextarea from '../../../components/ui/FormTextarea'
import CurrencyInput from './CurrencyInput'
import { addPlan, updatePlan, deletePlan, PLAN_TYPES } from '../financeSlice'
import { getTodayStr } from '../../../utils/dateHelpers'
import { formatNumber } from './currencyHelpers'

const PERIODICITY_OPTIONS = [
  { value: 'daily', label: 'روزانه', labelEn: 'Daily' },
  { value: 'weekly', label: 'هفتگی', labelEn: 'Weekly' },
  { value: 'monthly', label: 'ماهانه', labelEn: 'Monthly' },
  { value: 'yearly', label: 'سالانه', labelEn: 'Yearly' }
]

const PlanForm = memo(({ plan = null, onClose }) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!plan

  const finance = useSelector(state => state.finance || {})
  const { accounts = [] } = finance

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

  const [lastEdited, setLastEdited] = useState(null)
  const [loading, setLoading] = useState(false)

  // ═══════════════════════════════════════════════
  // ✅ محاسبه خودکار بین totalAmount، installmentsCount، installmentAmount
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (!lastEdited) return

    const total = parseFloat(formData.totalAmount) || 0
    const count = parseInt(formData.installmentsCount) || 0
    const perInstallment = parseFloat(formData.installmentAmount) || 0

    // ✅ حالت ۱: کاربر total یا count رو تغییر داد → per رو حساب کن
    if (lastEdited === 'totalAmount' || lastEdited === 'installmentsCount') {
      if (total > 0 && count > 0) {
        // ✅ گرد شده به پایین (floor) — باقیمانده به قسط آخر می‌ره
        const calculated = Math.floor(total / count)
        
        if (calculated !== perInstallment) {
          setFormData(prev => ({
            ...prev,
            installmentAmount: calculated
          }))
        }
      }
      return
    }

    // ✅ حالت ۲: کاربر per رو تغییر داد → count رو حساب کن
    if (lastEdited === 'installmentAmount') {
      if (total > 0 && perInstallment > 0) {
        // ✅ گرد شده به بالا (ceil)
        const calculated = Math.ceil(total / perInstallment)
        
        if (calculated !== count && calculated > 0) {
          setFormData(prev => ({
            ...prev,
            installmentsCount: calculated
          }))
        }
      }
      return
    }
  }, [lastEdited, formData.totalAmount, formData.installmentsCount, formData.installmentAmount])

  // ✅ محاسبه باقیمانده (برای قسط آخر)
  const lastInstallmentInfo = useMemo(() => {
    const total = parseFloat(formData.totalAmount) || 0
    const count = parseInt(formData.installmentsCount) || 0
    const per = parseFloat(formData.installmentAmount) || 0

    if (total <= 0 || count <= 0 || per <= 0) return null

    const sumOfNormal = per * (count - 1)
    const remainder = total - sumOfNormal

    // ✅ اگه قسط آخر با بقیه فرق داره
    if (remainder !== per && remainder > 0) {
      return {
        amount: remainder,
        hasDifference: true
      }
    }

    return { amount: per, hasDifference: false }
  }, [formData.totalAmount, formData.installmentsCount, formData.installmentAmount])

  // ✅ هندلر تغییر فیلدها (با track کردن lastEdited)
  const handleFieldChange = useCallback((field, value) => {
    // ✅ اگه فیلد مالی بود، lastEdited رو آپدیت کن
    if (['totalAmount', 'installmentsCount', 'installmentAmount'].includes(field)) {
      setLastEdited(field)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleResetAutoCalc = useCallback(() => {
    setLastEdited(null)
    setFormData(prev => ({
      ...prev,
      installmentAmount: ''
    }))
  }, [])

  const planTypeOptions = useMemo(() =>
    Object.values(PLAN_TYPES).map(p => ({
      value: p.id,
      label: isPersian ? p.label : p.id
    })),
    [isPersian]
  )

  const accountOptions = useMemo(() =>
    accounts.filter(a => a.isActive).map(a => ({
      value: a.id,
      label: a.name
    })),
    [accounts]
  )

  const periodicityOptions = useMemo(() =>
    PERIODICITY_OPTIONS.map(p => ({
      value: p.value,
      label: isPersian ? p.label : p.labelEn
    })),
    [isPersian]
  )

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error(isPersian ? 'عنوان را وارد کن' : 'Enter a title', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error(isPersian ? 'مبلغ کل را وارد کن' : 'Enter total amount', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (!formData.installmentsCount || parseInt(formData.installmentsCount) < 1) {
      toast.error(isPersian ? 'تعداد اقساط باید حداقل ۱ باشد' : 'At least 1 installment', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        installmentsCount: parseInt(formData.installmentsCount) || 1,
        installmentAmount: formData.installmentAmount 
          ? parseFloat(formData.installmentAmount) 
          : null,
        lastInstallmentAmount: lastInstallmentInfo?.amount || null
      }

      if (isEdit) {
        dispatch(updatePlan({ id: plan.id, ...payload }))
        toast.success(isPersian ? 'پلن ذخیره شد' : 'Plan saved', {
          position: 'bottom-left', autoClose: 2500
        })
      } else {
        dispatch(addPlan(payload))
        toast.success(isPersian ? 'پلن ایجاد شد' : 'Plan created', {
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
  }, [formData, isEdit, plan, dispatch, isPersian, onClose, lastInstallmentInfo])

  const handleDelete = useCallback(() => {
    if (!plan) return
    if (!window.confirm(isPersian ? 'این پلن حذف شود؟' : 'Delete this plan?')) return

    dispatch(deletePlan(plan.id))
    toast.success(isPersian ? 'پلن حذف شد' : 'Plan deleted', {
      position: 'bottom-left', autoClose: 2500
    })
    onClose()
  }, [plan, dispatch, isPersian, onClose])

  const isDebt = formData.type === 'debt' || formData.type === 'loan' || formData.type === 'installment'

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="large"
      title={isEdit
        ? (isPersian ? 'ویرایش پلن' : 'Edit Plan')
        : (isPersian ? 'پلن جدید' : 'New Plan')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ═══════════════════════════════════ */}
        {/* نوع پلن */}
        {/* ═══════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(PLAN_TYPES).map(type => {
            const isActive = formData.type === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleFieldChange('type', type.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-1
                  ${isActive
                    ? 'border-transparent ring-2 ring-offset-2'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                `}
                style={isActive ? {
                  backgroundColor: `${type.color}15`,
                  // @ts-ignore
                  '--tw-ring-color': type.color
                } : {}}
              >
                <span className="text-xs font-medium"
                  style={isActive ? { color: type.color } : {}}>
                  {isPersian ? type.label : type.id}
                </span>
              </button>
            )
          })}
        </div>

        {/* ═══════════════════════════════════ */}
        {/* هشدار ربا */}
        {/* ═══════════════════════════════════ */}
        {isDebt && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
            <FiAlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {isPersian 
                ? 'اگه این وام یا بدهی شامل سود (ربا) است، توجه داشته باش که ربا در اسلام حرام است. برای جایگزین شرعی، با کارشناس تماس بگیر.'
                : 'If this loan/debt involves interest (riba), note that riba is forbidden in Islam.'}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* عنوان + طرف حساب */}
        {/* ═══════════════════════════════════ */}
        <Input
          label={isPersian ? 'عنوان' : 'Title'}
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder={isPersian ? 'مثلاً: وام مسکن بانک مسکن' : 'e.g., Bank loan'}
          required
          autoFocus
        />

        <Input
          label={isPersian ? 'طرف حساب (اختیاری)' : 'Counterparty (optional)'}
          value={formData.counterparty}
          onChange={(e) => handleFieldChange('counterparty', e.target.value)}
          placeholder={isPersian ? 'نام بانک یا شخص' : 'Bank or person name'}
        />

        {/* ═══════════════════════════════════ */}
        {/* مبلغ کل + تعداد اقساط + مبلغ هر قسط */}
        {/* ═══════════════════════════════════ */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isPersian ? 'مبالغ و اقساط' : 'Amounts & Installments'}
            </span>
            {lastEdited && (
              <button
                type="button"
                onClick={handleResetAutoCalc}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <FiRefreshCw size={10} />
                {isPersian ? 'بازنشانی محاسبه' : 'Reset auto-calc'}
              </button>
            )}
          </div>

          <CurrencyInput
            label={isPersian ? 'مبلغ کل' : 'Total Amount'}
            value={formData.totalAmount}
            onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
            currency={formData.currency}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isPersian ? 'تعداد اقساط' : 'Installments Count'} *
              </label>
              <input
                type="number"
                value={formData.installmentsCount}
                onChange={(e) => handleFieldChange('installmentsCount', e.target.value)}
                placeholder="12"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <CurrencyInput
              label={isPersian ? 'مبلغ هر قسط' : 'Per Installment'}
              value={formData.installmentAmount}
              onChange={(e) => handleFieldChange('installmentAmount', e.target.value)}
              currency={formData.currency}
            />
          </div>

          {/* ✅ نمایش اطلاعات باقیمانده */}
          {lastInstallmentInfo?.hasDifference && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
              <FiInfo size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {isPersian 
                  ? `توجه: مبلغ قسط آخر ${formatNumber(lastInstallmentInfo.amount, isPersian)} خواهد بود (باقیمانده)`
                  : `Note: Last installment will be ${formatNumber(lastInstallmentInfo.amount, isPersian)} (remainder)`}
              </p>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════ */}
        {/* دوره + تاریخ */}
        {/* ═══════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label={isPersian ? 'دوره پرداخت' : 'Periodicity'}
            value={formData.periodicity}
            onChange={(e) => handleFieldChange('periodicity', e.target.value)}
            options={periodicityOptions}
          />

          <DatePicker
            label={isPersian ? 'تاریخ شروع' : 'Start Date'}
            value={formData.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
          />
        </div>

        {/* ═══════════════════════════════════ */}
        {/* حساب مرتبط */}
        {/* ═══════════════════════════════════ */}
        <FormSelect
          label={isPersian ? 'حساب مرتبط (اختیاری)' : 'Related Account (optional)'}
          value={formData.accountId}
          onChange={(e) => handleFieldChange('accountId', e.target.value)}
          options={accountOptions}
          placeholder={isPersian ? 'انتخاب حساب' : 'Select account'}
        />

        {/* ═══════════════════════════════════ */}
        {/* توضیحات */}
        {/* ═══════════════════════════════════ */}
        <FormTextarea
          label={isPersian ? 'توضیحات (اختیاری)' : 'Description (optional)'}
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder={isPersian ? 'جزئیات بیشتر...' : 'More details...'}
          rows={2}
        />

        {/* ═══════════════════════════════════ */}
        {/* توجه در حالت ویرایش */}
        {/* ═══════════════════════════════════ */}
        {isEdit && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-2">
            <FiInfo size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              {isPersian 
                ? 'توجه: مبلغ کل، تعداد اقساط و دوره پرداخت بعد از ایجاد قابل تغییر نیستن. فقط عنوان، طرف حساب و حساب مرتبط قابل ویرایشه.'
                : 'Note: Total amount, installments count, and periodicity cannot be changed after creation.'}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* دکمه‌ها */}
        {/* ═══════════════════════════════════ */}
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

PlanForm.displayName = 'PlanForm'

export default PlanForm