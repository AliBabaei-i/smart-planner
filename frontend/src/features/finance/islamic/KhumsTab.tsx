import React, { useState, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiPercent, FiCheckCircle, FiDollarSign, FiX } from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormTextarea from '../../../components/ui/FormTextarea'
import CurrencyInput from '../CurrencyInput'
import FiqhNote from './FiqhNote'
import { payKhums, addTransaction, selectKhumsCalculation } from '../financeSlice'
import { formatNumber, formatCompact, parseFormattedNumber } from '../currencyHelpers'
import type { RootState, AppDispatch } from '../../../app/store'
import type { IslamicSettings } from '../../../types/finance' // ✅ اضافه شد

const KhumsTab = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector((state: RootState) => state.finance)
  // ✅ FIX: کست کردن به تایپ دقیق
  const settings = (finance?.islamicSettings || {}) as IslamicSettings
  const accounts = (finance?.accounts || []).filter(a => a.isActive)
  const calculation = useSelector(selectKhumsCalculation)

  const [showPayModal, setShowPayModal] = useState(false)
  const [payAmount, setPayAmount] = useState<string | number>('')
  const [payAccount, setPayAccount] = useState('')
  const [payNotes, setPayNotes] = useState('')

  const totalPaid = settings.khumsPaid || 0
  const remaining = Math.max(0, calculation.khums - totalPaid)
  const hasYearStart = !!settings.khumsYearStart

  const handleOpenPayModal = useCallback(() => {
    setPayAmount(remaining)
    setPayAccount(accounts[0]?.id || '')
    setPayNotes('')
    setShowPayModal(true)
  }, [remaining, accounts])

  const handlePayKhums = useCallback(() => {
    const amount = typeof payAmount === 'string' ? parseFormattedNumber(payAmount) : payAmount
    if (!amount || amount <= 0) {
      toast.error(isPersian ? 'مبلغ معتبر وارد کن' : 'Enter a valid amount')
      return
    }
    if (!payAccount) {
      toast.error(isPersian ? 'حساب را انتخاب کن' : 'Select an account')
      return
    }

    dispatch(addTransaction({
      accountId: payAccount,
      type: 'expense',
      amount,
      currency: 'IRR',
      category: 'khums',
      description: payNotes || (isPersian ? 'پرداخت خمس' : 'Khums payment'),
      date: new Date().toISOString().split('T')[0],
      khumsRelevant: false,
      tags: [],
      zakatRelevant: false
    } as any))

    dispatch(payKhums({ amount }))
    toast.success(isPersian ? 'پرداخت خمس ثبت شد' : 'Khums payment recorded')
    setShowPayModal(false)
  }, [payAmount, payAccount, payNotes, dispatch, isPersian])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiPercent className="text-teal-600" size={20} />
            <span>{isPersian ? 'محاسبه خمس' : 'Khums Calculation'}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isPersian ? 'یک‌پنجم مازاد درآمد سالانه' : 'One-fifth of annual surplus income'}
          </p>
        </div>
        {hasYearStart && remaining > 0 && (
          <Button onClick={handleOpenPayModal} className="!bg-teal-600 hover:!bg-teal-700">
            <FiDollarSign size={14} />
            <span>{isPersian ? 'ثبت پرداخت' : 'Record Payment'}</span>
          </Button>
        )}
      </div>

      {!hasYearStart && (
        <FiqhNote variant="warning" title={isPersian ? 'سال خمسی تنظیم نشده' : 'Khums year not set'}>
          {isPersian
            ? 'برای محاسبه خمس، ابتدا باید تاریخ شروع سال خمسی رو در تب تنظیمات وارد کنی.'
            : 'To calculate Khums, first set the Khums year start date in Settings.'}
        </FiqhNote>
      )}

      <FiqhNote title={isPersian ? 'خمس چیست؟' : 'What is Khums?'}>
        {isPersian
          ? 'خمس یعنی یک‌پنجم (۲۰٪) از مازاد درآمد سالانه‌ات، بعد از کسر مخارج سال. این مبلغ به دو سهم مساوی تقسیم می‌شه: سهم امام (ع) و سهم سادات.'
          : 'Khums is one-fifth (20%) of your annual surplus income, after deducting annual expenses.'}
      </FiqhNote>

      {hasYearStart && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="text-xs text-gray-500">{isPersian ? 'درآمد سال' : 'Annual Income'}</div>
              <div className="text-lg font-bold text-green-600 mt-1.5">{formatCompact(calculation.totalIncome, isPersian)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-gray-500">{isPersian ? 'مخارج سال' : 'Annual Expenses'}</div>
              <div className="text-lg font-bold text-red-600 mt-1.5">{formatCompact(calculation.totalExpenses, isPersian)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-gray-500">{isPersian ? 'مازاد' : 'Surplus'}</div>
              <div className="text-lg font-bold text-blue-600 mt-1.5">{formatCompact(calculation.surplus, isPersian)}</div>
            </Card>
            <Card className="p-4 ring-2 ring-teal-500">
              <div className="text-xs text-teal-600 font-medium">{isPersian ? 'خمس واجب' : 'Khums Due'}</div>
              <div className="text-lg font-bold text-teal-600 mt-1.5">{formatCompact(calculation.khums, isPersian)}</div>
            </Card>
          </div>

          <Card className="p-5">
            <h4 className="text-sm font-semibold mb-4">{isPersian ? 'تفکیک سهم‌ها' : 'Share Breakdown'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">{isPersian ? 'سهم امام (ع)' : 'Sahm al-Imam'}</span>
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">۵۰٪</span>
                </div>
                <div className="text-xl font-bold text-blue-700">{formatNumber(calculation.sahmImam, isPersian)}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">{isPersian ? 'سهم سادات' : 'Sahm al-Sadat'}</span>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">۵۰٪</span>
                </div>
                <div className="text-xl font-bold text-purple-700">{formatNumber(calculation.sahmSadat, isPersian)}</div>
              </div>
            </div>
          </Card>

          {totalPaid > 0 && (
            <Card className="p-4 bg-green-50 border border-green-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-700">{isPersian ? 'پرداخت‌شده' : 'Already Paid'}</div>
                    <div className="text-lg font-bold text-green-700">{formatNumber(totalPaid, isPersian)}</div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-green-600">{isPersian ? 'باقیمانده' : 'Remaining'}</div>
                  <div className="text-lg font-bold text-green-700">{formatNumber(remaining, isPersian)}</div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {showPayModal && (
        <Modal isOpen onClose={() => setShowPayModal(false)} title={isPersian ? 'ثبت پرداخت خمس' : 'Record Khums Payment'}>
          <div className="space-y-4">
            <CurrencyInput
              label={isPersian ? 'مبلغ پرداختی' : 'Payment Amount'}
              value={payAmount}
              onChange={(e: any) => setPayAmount(e.target.value)}
              currency="IRR"
            />
            <div>
              <label className="block text-sm font-medium mb-1">{isPersian ? 'از حساب' : 'From Account'}</label>
              <select
                value={payAccount}
                onChange={(e) => setPayAccount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="">{isPersian ? 'انتخاب حساب' : 'Select account'}</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCompact(a.balance, isPersian)})</option>
                ))}
              </select>
            </div>
            <FormTextarea
              label={isPersian ? 'یادداشت' : 'Notes'}
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              rows={2}
            />
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handlePayKhums} className="flex-1 !bg-teal-600 hover:!bg-teal-700">
                <FiCheckCircle size={16} />
                <span>{isPersian ? 'ثبت پرداخت' : 'Record'}</span>
              </Button>
              <Button variant="secondary" onClick={() => setShowPayModal(false)} className="flex-1">
                <FiX size={16} />
                <span>{isPersian ? 'انصراف' : 'Cancel'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
})

KhumsTab.displayName = 'KhumsTab'
export default KhumsTab