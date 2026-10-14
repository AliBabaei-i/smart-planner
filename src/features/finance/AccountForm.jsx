import React, { useState, useMemo, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave, FiX, FiCheckCircle, FiDollarSign,
  FiCreditCard, FiBriefcase, FiHome, FiTrendingUp,
  FiPackage, FiZap
} from 'react-icons/fi'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import FormSelect from '../../components/ui/FormSelect'
import {
  addAccount,
  updateAccount,
  deleteAccount,
  ACCOUNT_TYPES,
  CURRENCIES
} from './financeSlice'
import { formatNumber } from './currencyHelpers'

// ✅ رنگ‌های پیشنهادی برای حساب
const COLOR_OPTIONS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#14b8a6', '#f97316', '#a855f7', '#6b7280'
]

// ✅ آیکون‌های حساب
const ACCOUNT_ICONS = {
  bank: FiCreditCard,
  cash: FiDollarSign,
  gold: FiPackage,
  silver: FiPackage,
  crypto: FiZap,
  stock: FiTrendingUp,
  property: FiHome,
  other: FiBriefcase
}

const AccountForm = memo(({ account = null, onClose }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!account

  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: account?.type || 'bank',
    currency: account?.currency || 'IRR',
    balance: account?.balance || 0,
    color: account?.color || '#3b82f6'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error(isPersian ? 'نام حساب الزامی است' : 'Account name is required', {
        position: 'bottom-left',
        autoClose: 3000
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        balance: parseFloat(formData.balance) || 0
      }

      if (isEdit) {
        dispatch(updateAccount({ id: account.id, ...payload }))
        toast.success(isPersian ? 'حساب ذخیره شد' : 'Account saved', {
          position: 'bottom-left',
          autoClose: 2500
        })
      } else {
        dispatch(addAccount(payload))
        toast.success(isPersian ? 'حساب ایجاد شد' : 'Account created', {
          position: 'bottom-left',
          autoClose: 2500
        })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed', {
        position: 'bottom-left',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }, [formData, isEdit, account, dispatch, isPersian, onClose])

  const handleDelete = useCallback(() => {
    if (!account) return
    if (!window.confirm(isPersian 
      ? `حذف "${account.name}"؟ همه تراکنش‌های مربوطه هم حذف می‌شن.`
      : `Delete "${account.name}"? All related transactions will be deleted.`
    )) return

    dispatch(deleteAccount(account.id))
    toast.success(isPersian ? 'حساب حذف شد' : 'Account deleted', {
      position: 'bottom-left',
      autoClose: 2500
    })
    onClose()
  }, [account, dispatch, isPersian, onClose])

  const accountTypeOptions = useMemo(() => 
    Object.values(ACCOUNT_TYPES).map(t => ({
      value: t.id,
      label: isPersian ? t.label : t.id
    })),
    [isPersian]
  )

  const currencyOptions = useMemo(() =>
    Object.values(CURRENCIES).map(c => ({
      value: c.id,
      label: isPersian ? c.label : c.id
    })),
    [isPersian]
  )

  const SelectedIcon = ACCOUNT_ICONS[formData.type] || FiBriefcase

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="large"
      title={isEdit ? (isPersian ? 'ویرایش حساب' : 'Edit Account') : (isPersian ? 'حساب جدید' : 'New Account')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* نام حساب */}
        <Input
          label={isPersian ? 'نام حساب' : 'Account Name'}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={isPersian ? 'مثلاً: حساب جاری بانک ملی' : 'e.g., Bank Account'}
          required
          autoFocus
        />

        {/* نوع + ارز */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label={isPersian ? 'نوع حساب' : 'Account Type'}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={accountTypeOptions}
          />

          <FormSelect
            label={isPersian ? 'ارز' : 'Currency'}
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            options={currencyOptions}
          />
        </div>

        {/* موجودی اولیه */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isPersian ? 'موجودی اولیه' : 'Initial Balance'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.balance}
              onChange={(e) => handleChange('balance', e.target.value)}
              placeholder="0"
              step="any"
              className="w-full px-3 py-2 pe-16 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
            />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              {CURRENCIES[formData.currency]?.label || ''}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isPersian 
              ? 'می‌تونی بعداً با ثبت تراکنش تغییرش بدی' 
              : 'You can change this later with transactions'}
          </p>
        </div>

        {/* رنگ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isPersian ? 'رنگ' : 'Color'}
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                className={`
                  w-10 h-10 rounded-full transition-all
                  flex items-center justify-center
                  ${formData.color === color
                    ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110'
                    : 'hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color }}
              >
                {formData.color === color && (
                  <FiCheckCircle size={16} className="text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* پیش‌نمایش */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {isPersian ? 'پیش‌نمایش' : 'Preview'}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <SelectedIcon size={18} style={{ color: formData.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate">
                {formData.name || (isPersian ? 'نام حساب' : 'Account Name')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(formData.balance, isPersian)} {CURRENCIES[formData.currency]?.label}
              </div>
            </div>
          </div>
        </div>

        {/* دکمه‌ها */}
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
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              className="flex-shrink-0"
            >
              <span>{isPersian ? 'حذف' : 'Delete'}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className={isEdit ? 'flex-1' : 'flex-1'}
          >
            <FiX size={16} />
            <span>{isPersian ? 'انصراف' : 'Cancel'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
})

AccountForm.displayName = 'AccountForm'

export default AccountForm