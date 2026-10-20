import React, { useState, useCallback, useMemo, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSave, FiX, FiCheckCircle, FiDollarSign, FiCreditCard, FiBriefcase, FiHome, FiTrendingUp, FiPackage, FiZap } from 'react-icons/fi'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import FormSelect from '../../components/ui/FormSelect'
import CurrencyInput from './CurrencyInput'
import { addAccount, updateAccount, deleteAccount, ACCOUNT_TYPES, CURRENCIES } from './financeSlice'
import { formatNumber } from './currencyHelpers'
import type { RootState, AppDispatch } from '../../app/store'
import type { Account, AccountType, CurrencyCode } from '../../types/finance'

interface AccountFormProps {
  account?: Account | null
  onClose: () => void
}

const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#14b8a6', '#f97316', '#a855f7', '#6b7280']
const ACCOUNT_ICONS: Record<string, any> = { bank: FiCreditCard, cash: FiDollarSign, gold: FiPackage, silver: FiPackage, crypto: FiZap, stock: FiTrendingUp, property: FiHome, other: FiBriefcase }

const AccountForm = memo(({ account = null, onClose }: AccountFormProps) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!account

  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: account?.type || 'bank',
    currency: account?.currency || 'IRR',
    balance: account?.balance ?? '',
    color: account?.color || '#3b82f6'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((field: string, value: any) => { setFormData(prev => ({ ...prev, [field]: value })) }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return toast.error(isPersian ? 'نام حساب الزامی است' : 'Account name is required')
    setLoading(true)
    try {
      const payload = { ...formData, balance: parseFloat(String(formData.balance)) || 0 }
      if (isEdit && account) {
        dispatch(updateAccount({ id: account.id, ...payload }))
        toast.success(isPersian ? 'حساب ذخیره شد' : 'Account saved')
      } else {
        dispatch(addAccount(payload as any))
        toast.success(isPersian ? 'حساب ایجاد شد' : 'Account created')
      }
      onClose()
    } catch (error) { toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed') } finally { setLoading(false) }
  }, [formData, isEdit, account, dispatch, isPersian, onClose])

  const handleDelete = useCallback(() => {
    if (!account) return
    if (!window.confirm(isPersian ? `حذف "${account.name}"؟` : `Delete "${account.name}"?`)) return
    dispatch(deleteAccount(account.id))
    onClose()
  }, [account, dispatch, isPersian, onClose])

  const accountTypeOptions = useMemo(() => Object.values(ACCOUNT_TYPES).map(t => ({ value: t.id, label: isPersian ? t.label : t.id })), [isPersian])
  const currencyOptions = useMemo(() => Object.values(CURRENCIES).map(c => ({ value: c.id, label: isPersian ? c.label : c.id })), [isPersian])
  const SelectedIcon = ACCOUNT_ICONS[formData.type] || FiBriefcase

  return (
    <Modal isOpen onClose={onClose} size="large" title={isEdit ? (isPersian ? 'ویرایش حساب' : 'Edit Account') : (isPersian ? 'حساب جدید' : 'New Account')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label={isPersian ? 'نام حساب' : 'Account Name'} value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required autoFocus />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect label={isPersian ? 'نوع حساب' : 'Account Type'} value={formData.type} onChange={(e) => handleChange('type', e.target.value)} options={accountTypeOptions} />
          <FormSelect label={isPersian ? 'ارز' : 'Currency'} value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} options={currencyOptions} />
        </div>
        <div>
          <CurrencyInput label={isPersian ? 'موجودی اولیه' : 'Initial Balance'} value={formData.balance} onChange={(e) => handleChange('balance', e.target.value)} currency={formData.currency} placeholder="" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{isPersian ? 'رنگ' : 'Color'}</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(color => (
              <button key={color} type="button" onClick={() => handleChange('color', color)} className={`w-10 h-10 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''}`} style={{ backgroundColor: color }}>
                {formData.color === color && <FiCheckCircle size={16} className="text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 mb-2">{isPersian ? 'پیش‌نمایش' : 'Preview'}</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${formData.color}20` }}><SelectedIcon size={18} style={{ color: formData.color }} /></div>
            <div className="flex-1 min-w-0"><div className="font-medium text-gray-900 dark:text-white truncate">{formData.name || (isPersian ? 'نام حساب' : 'Account Name')}</div><div className="text-xs text-gray-500">{formatNumber(Number(formData.balance), isPersian)} {CURRENCIES[formData.currency as CurrencyCode]?.label}</div></div>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" loading={loading} className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"><FiSave size={16} /><span>{isEdit ? (isPersian ? 'ذخیره' : 'Save') : (isPersian ? 'ایجاد' : 'Create')}</span></Button>
          {isEdit && <Button type="button" variant="danger" onClick={handleDelete}>{isPersian ? 'حذف' : 'Delete'}</Button>}
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1"><FiX size={16} /><span>{isPersian ? 'انصراف' : 'Cancel'}</span></Button>
        </div>
      </form>
    </Modal>
  )
})
AccountForm.displayName = 'AccountForm'
export default AccountForm