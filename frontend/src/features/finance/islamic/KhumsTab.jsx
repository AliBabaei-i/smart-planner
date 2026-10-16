import React, { useState, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiPercent, FiCheckCircle, FiDollarSign, FiX
} from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import FormTextarea from '../../../components/ui/FormTextarea'
import CurrencyInput from '../CurrencyInput'
import FiqhNote from './FiqhNote'
import {
  payKhums,
  addTransaction,
  selectKhumsCalculation
} from '../financeSlice'
import { formatNumber, formatCompact, parseFormattedNumber } from '../currencyHelpers'

const KhumsTab = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const settings = finance.islamicSettings || {}
  const accounts = (finance.accounts || []).filter(a => a.isActive)
  const calculation = useSelector(selectKhumsCalculation)

  const [showPayModal, setShowPayModal] = useState(false)
  const [payAmount, setPayAmount] = useState('')
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
    const amount = parseFormattedNumber(payAmount)
    if (!amount || amount <= 0) {
      toast.error(isPersian ? 'مبلغ معتبر وارد کن' : 'Enter a valid amount', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }
    if (!payAccount) {
      toast.error(isPersian ? 'حساب را انتخاب کن' : 'Select an account', {
        position: 'bottom-left', autoClose: 3000
      })
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
      khumsRelevant: false
    }))

    dispatch(payKhums({ amount }))

    toast.success(isPersian ? 'پرداخت خمس ثبت شد' : 'Khums payment recorded', {
      position: 'bottom-left', autoClose: 2500
    })
    setShowPayModal(false)
  }, [payAmount, payAccount, payNotes, dispatch, isPersian])

  return (
    <div className="space-y-5">
      {/* هدر */}
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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isPersian ? 'درآمد سال' : 'Annual Income'}
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1.5">
                {formatCompact(calculation.totalIncome, isPersian)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isPersian ? 'مخارج سال' : 'Annual Expenses'}
              </div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1.5">
                {formatCompact(calculation.totalExpenses, isPersian)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isPersian ? 'مازاد' : 'Surplus'}
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1.5">
                {formatCompact(calculation.surplus, isPersian)}
              </div>
            </Card>
            <Card className="p-4 ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-900">
              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                {isPersian ? 'خمس واجب' : 'Khums Due'}
              </div>
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1.5">
                {formatCompact(calculation.khums, isPersian)}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {isPersian ? 'تفکیک سهم‌ها' : 'Share Breakdown'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {isPersian ? 'سهم امام (ع)' : 'Sahm al-Imam'}
                  </span>
                  <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {isPersian ? '۵۰٪' : '50%'}
                  </span>
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {formatNumber(calculation.sahmImam, isPersian)}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 leading-relaxed">
                  {isPersian
                    ? 'به مرجع تقلید یا وکیل ایشان پرداخت می‌شه'
                    : 'Paid to your Marja or their representative'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {isPersian ? 'سهم سادات' : 'Sahm al-Sadat'}
                  </span>
                  <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    {isPersian ? '۵۰٪' : '50%'}
                  </span>
                </div>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {formatNumber(calculation.sahmSadat, isPersian)}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 leading-relaxed">
                  {isPersian
                    ? 'به سید فقیر یا یتیم سید پرداخت می‌شه'
                    : 'Paid to poor Sayyids or orphan Sayyids'}
                </p>
              </div>
            </div>
          </Card>

          {totalPaid > 0 && (
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                    <FiCheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      {isPersian ? 'تا حالا پرداخت شده' : 'Already Paid'}
                    </div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {formatNumber(totalPaid, isPersian)}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {isPersian ? 'باقیمانده' : 'Remaining'}
                  </div>
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatNumber(remaining, isPersian)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {calculation.khums === 0 && (
            <FiqhNote variant="success" title={isPersian ? 'خمس واجب نیست' : 'No Khums Due'}>
              {isPersian
                ? 'مخارج سالانه‌ات بیشتر از درآمد بوده، پس خمس واجب نیست.'
                : 'Your annual expenses exceed your income, so no Khums is due.'}
            </FiqhNote>
          )}
        </>
      )}

      {showPayModal && (
        <Modal
          isOpen
          onClose={() => setShowPayModal(false)}
          size="default"
          title={isPersian ? 'ثبت پرداخت خمس' : 'Record Khums Payment'}
        >
          <div className="space-y-4">
            <CurrencyInput
              label={isPersian ? 'مبلغ پرداختی' : 'Payment Amount'}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              currency="IRR"
              size="large"
            />
            <p className="text-xs text-gray-400">
              {isPersian
                ? `پیشنهاد: ${formatNumber(remaining, isPersian)} (باقیمانده)`
                : `Suggested: ${formatNumber(remaining, isPersian)} (remaining)`}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isPersian ? 'از حساب' : 'From Account'}
              </label>
              <select
                value={payAccount}
                onChange={(e) => setPayAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">{isPersian ? 'انتخاب حساب' : 'Select account'}</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatCompact(a.balance, isPersian)})
                  </option>
                ))}
              </select>
            </div>

            <FormTextarea
              label={isPersian ? 'یادداشت (اختیاری)' : 'Notes (optional)'}
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder={isPersian ? 'مثلاً: پرداخت به دفتر مرجع' : 'e.g., Paid to...'}
              rows={2}
            />

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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