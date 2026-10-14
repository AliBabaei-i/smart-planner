import React, { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave, FiX, FiTrendingUp, FiTrendingDown,
  FiRepeat, FiAlertTriangle
} from 'react-icons/fi'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import FormSelect from '../../../components/ui/FormSelect'
import FormTextarea from '../../../components/ui/FormTextarea'
import DatePicker from '../../../components/ui/DatePicker'
import CurrencyInput from './CurrencyInput'
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  TRANSACTION_TYPES,
  CURRENCIES
} from '../financeSlice'
import { getTodayStr } from '../../../utils/dateHelpers'

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${String(i).padStart(2, '0')}:00`,
  label: `${String(i).padStart(2, '0')}:۰۰`
}))

// دسته‌بندی‌هایی که ممکنه ربا باشن (هشدار)
const INTEREST_CATEGORIES = ['interest', 'riba', 'bank_interest']

const TransactionForm = memo(({ transaction = null, onClose, defaultType = 'expense' }) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!transaction

  const finance = useSelector(state => state.finance || {})
  const { accounts = [], categories = { income: [], expense: [] } } = finance

  const [formData, setFormData] = useState({
    accountId: transaction?.accountId || '',
    type: transaction?.type || defaultType,
    amount: transaction?.amount || '',
    currency: transaction?.currency || 'IRR',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || getTodayStr(),
    time: transaction?.time || '',
    toAccountId: transaction?.toAccountId || '',
    toAmount: transaction?.toAmount || '',
    khumsRelevant: transaction?.khumsRelevant !== false
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId || '',
        type: transaction.type || 'expense',
        amount: transaction.amount || '',
        currency: transaction.currency || 'IRR',
        category: transaction.category || '',
        description: transaction.description || '',
        date: transaction.date || getTodayStr(),
        time: transaction.time || '',
        toAccountId: transaction.toAccountId || '',
        toAmount: transaction.toAmount || '',
        khumsRelevant: transaction.khumsRelevant !== false
      })
    }
  }, [transaction])

  const activeAccounts = useMemo(
    () => accounts.filter(a => a.isActive),
    [accounts]
  )

  const categoryOptions = useMemo(() => {
    const cats = formData.type === 'income' 
      ? categories.income 
      : formData.type === 'expense'
        ? categories.expense
        : []
    return cats.map(c => ({
      value: c.id,
      label: isPersian ? c.name : c.id
    }))
  }, [formData.type, categories, isPersian])

  const accountOptions = useMemo(() =>
    activeAccounts.map(a => ({
      value: a.id,
      label: a.name
    })),
    [activeAccounts]
  )

  const selectedAccount = useMemo(
    () => activeAccounts.find(a => a.id === formData.accountId),
    [activeAccounts, formData.accountId]
  )

  useEffect(() => {
    if (selectedAccount && !isEdit) {
      setFormData(prev => ({ ...prev, currency: selectedAccount.currency }))
    }
  }, [selectedAccount, isEdit])

  const showInterestWarning = useMemo(
    () => INTEREST_CATEGORIES.includes(formData.category),
    [formData.category]
  )

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleTypeChange = useCallback((type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: '',
      toAccountId: '',
      toAmount: ''
    }))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    if (!formData.accountId) {
      toast.error(isPersian ? 'حساب را انتخاب کن' : 'Select an account', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(isPersian ? 'مبلغ را وارد کن' : 'Enter a valid amount', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (formData.type !== 'transfer' && !formData.category) {
      toast.error(isPersian ? 'دسته‌بندی را انتخاب کن' : 'Select a category', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (formData.type === 'transfer' && !formData.toAccountId) {
      toast.error(isPersian ? 'حساب مقصد را انتخاب کن' : 'Select destination account', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (formData.type === 'transfer' && formData.toAccountId === formData.accountId) {
      toast.error(isPersian ? 'حساب مبدأ و مقصد نباید یکی باشن' : 'Source and destination must differ', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        toAmount: formData.toAmount ? parseFloat(formData.toAmount) : null,
        category: formData.type === 'transfer' ? 'transfer' : formData.category
      }

      if (isEdit) {
        dispatch(updateTransaction({ id: transaction.id, ...payload }))
        toast.success(isPersian ? 'تراکنش ذخیره شد' : 'Transaction saved', {
          position: 'bottom-left', autoClose: 2500
        })
      } else {
        dispatch(addTransaction(payload))
        toast.success(isPersian ? 'تراکنش ثبت شد' : 'Transaction created', {
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
  }, [formData, isEdit, transaction, dispatch, isPersian, onClose])

  const handleDelete = useCallback(() => {
    if (!transaction) return
    if (!window.confirm(isPersian ? 'این تراکنش حذف شود؟' : 'Delete this transaction?')) return

    dispatch(deleteTransaction(transaction.id))
    toast.success(isPersian ? 'تراکنش حذف شد' : 'Transaction deleted', {
      position: 'bottom-left', autoClose: 2500
    })
    onClose()
  }, [transaction, dispatch, isPersian, onClose])

  if (activeAccounts.length === 0) {
    return (
      <Modal isOpen onClose={onClose} size="default" title={isPersian ? 'تراکنش جدید' : 'New Transaction'}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle size={32} className="text-amber-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {isPersian ? 'اول باید یک حساب بسازی' : 'Create an account first'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {isPersian 
              ? 'برای ثبت تراکنش، حداقل یک حساب لازم داری'
              : 'You need at least one account to record transactions'}
          </p>
          <Button onClick={onClose} variant="secondary">
            {isPersian ? 'بستن' : 'Close'}
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="large"
      title={isEdit 
        ? (isPersian ? 'ویرایش تراکنش' : 'Edit Transaction')
        : (isPersian ? 'تراکنش جدید' : 'New Transaction')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* نوع تراکنش */}
        <div className="grid grid-cols-3 gap-2">
          {Object.values(TRANSACTION_TYPES).map(type => {
            const isActive = formData.type === type.id
            const Icon = type.id === 'income' ? FiTrendingUp 
                       : type.id === 'expense' ? FiTrendingDown 
                       : FiRepeat
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5
                  ${isActive
                    ? 'border-transparent ring-2 ring-offset-2 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                `}
                style={isActive ? {
                  backgroundColor: `${type.color}15`,
                  // @ts-ignore
                  '--tw-ring-color': type.color
                } : {}}
              >
                <Icon size={18} style={isActive ? { color: type.color } : {}} 
                  className={isActive ? '' : 'text-gray-400'} />
                <span className={`text-xs font-medium ${
                  isActive ? '' : 'text-gray-600 dark:text-gray-400'
                }`} style={isActive ? { color: type.color } : {}}>
                  {isPersian ? type.label : type.id}
                </span>
              </button>
            )
          })}
        </div>

        {/* مبلغ */}
        <CurrencyInput
          label={isPersian ? 'مبلغ' : 'Amount'}
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          currency={selectedAccount?.currency || formData.currency}
          required
          size="large"
          autoFocus={isEdit}
        />

        {/* حساب + دسته‌بندی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label={isPersian ? 'از حساب' : 'From Account'}
            value={formData.accountId}
            onChange={(e) => handleChange('accountId', e.target.value)}
            options={accountOptions}
            placeholder={isPersian ? 'حساب را انتخاب کن' : 'Select account'}
            required
          />

          {formData.type === 'transfer' ? (
            <FormSelect
              label={isPersian ? 'به حساب' : 'To Account'}
              value={formData.toAccountId}
              onChange={(e) => handleChange('toAccountId', e.target.value)}
              options={accountOptions.filter(a => a.value !== formData.accountId)}
              placeholder={isPersian ? 'حساب مقصد' : 'Destination'}
              required
            />
          ) : (
            <FormSelect
              label={isPersian ? 'دسته‌بندی' : 'Category'}
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={categoryOptions}
              placeholder={isPersian ? 'دسته را انتخاب کن' : 'Select category'}
              required
            />
          )}
        </div>

        {/* مبلغ مقصد */}
        {formData.type === 'transfer' && formData.toAccountId && (
          <CurrencyInput
            label={isPersian ? 'مبلغ دریافتی در حساب مقصد (اختیاری)' : 'Amount received (optional)'}
            value={formData.toAmount}
            onChange={(e) => handleChange('toAmount', e.target.value)}
            currency={formData.currency}
          />
        )}

        {/* تاریخ + ساعت */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label={isPersian ? 'تاریخ' : 'Date'}
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
          />

          <FormSelect
            label={isPersian ? 'ساعت (اختیاری)' : 'Time (optional)'}
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            options={HOUR_OPTIONS}
            placeholder={isPersian ? 'ساعت را انتخاب کن' : 'Select time'}
          />
        </div>

        {/* توضیحات */}
        <FormTextarea
          label={isPersian ? 'توضیحات (اختیاری)' : 'Description (optional)'}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={isPersian ? 'جزئیات بیشتر...' : 'More details...'}
          rows={2}
        />

        {/* هشدار ربا */}
        {showInterestWarning && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <FiAlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong className="block mb-1">
                  {isPersian ? 'هشدار فقهی' : 'Religious Warning'}
                </strong>
                {isPersian 
                  ? 'دریافت یا پرداخت سود (ربا) در اسلام حرام است. اگر این تراکنش شامل سود وام یا قرض است، لطفاً با دقت بررسی کن. جایگزین‌های شرعی: مضاربه، مشارکت، مرابحه.'
                  : 'Interest (riba) is forbidden in Islam. Halal alternatives: Mudarabah, Musharakah, Murabahah.'}
              </div>
            </div>
          </div>
        )}

        {/* چک‌باکس خمس */}
        {formData.type === 'income' && (
          <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.khumsRelevant}
                onChange={(e) => handleChange('khumsRelevant', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <div className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
                <strong className="block mb-0.5">
                  {isPersian ? 'مشمول خمس' : 'Subject to Khums'}
                </strong>
                {isPersian 
                  ? 'اگر این درآمد از مخارج سالانه‌ات اضافه بیاد، مشمول خمس (۲۰٪) هست'
                  : 'If this income exceeds annual expenses, it is subject to Khums (20%)'}
              </div>
            </label>
          </div>
        )}

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            loading={loading}
            className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
          >
            <FiSave size={16} />
            <span>{isEdit ? (isPersian ? 'ذخیره' : 'Save') : (isPersian ? 'ثبت' : 'Record')}</span>
          </Button>

          {isEdit && (
            <Button type="button" variant="danger" onClick={handleDelete} className="flex-shrink-0">
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

TransactionForm.displayName = 'TransactionForm'

export default TransactionForm