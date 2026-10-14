import React, { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiPercent, FiInfo, FiCheckCircle, FiAlertCircle,
  FiSettings, FiDollarSign, FiPackage, FiSave,
  FiX, FiRefreshCw
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import DatePicker from '../../components/ui/DatePicker'
import Modal from '../../components/ui/Modal'
import FormTextarea from '../../components/ui/FormTextarea'
import CurrencyInput from './CurrencyInput'
import {
  updateIslamicSettings,
  payKhums,
  addTransaction,
  selectKhumsCalculation,
  selectZakatCalculation
} from './financeSlice''
import {
  calculateZakat,
  ZAKAT_NISAB
} from './islamicFinance'
import {
  formatNumber,
  formatCompact,
  parseFormattedNumber
} from './currencyHelpers'

// ═══════════════════════════════════════════════
// ✅ API سرویس قیمت طلا و نقره (بدون API Key)
// ═══════════════════════════════════════════════

const fetchGoldPrice = async () => {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU')
    if (!response.ok) throw new Error('Failed to fetch gold price')
    const data = await response.json()
    // data.price به دلار برای هر اونس
    // تبدیل به دلار برای هر گرم
    const pricePerGramUSD = data.price / 31.1034768
    return pricePerGramUSD
  } catch (error) {
    console.error('Gold price fetch error:', error)
    return null
  }
}

const fetchSilverPrice = async () => {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAG')
    if (!response.ok) throw new Error('Failed to fetch silver price')
    const data = await response.json()
    const pricePerGramUSD = data.price / 31.1034768
    return pricePerGramUSD
  } catch (error) {
    console.error('Silver price fetch error:', error)
    return null
  }
}

// ═══════════════════════════════════════════════
// ✅ Tabs
// ═══════════════════════════════════════════════
const INNER_TABS = [
  { id: 'khums', labelFa: 'خمس', labelEn: 'Khums', icon: FiPercent },
  { id: 'zakat', labelFa: 'زکات', labelEn: 'Zakat', icon: FiPackage },
  { id: 'settings', labelFa: 'تنظیمات', labelEn: 'Settings', icon: FiSettings }
]

// ═══════════════════════════════════════════════
// ✅ کارت توضیح فقهی
// ═══════════════════════════════════════════════
const FiqhNote = memo(({ title, children, variant = 'info' }) => {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
  }
  const Icon = variant === 'warning' ? FiAlertCircle : variant === 'success' ? FiCheckCircle : FiInfo

  return (
    <div className={`p-3 rounded-lg border text-xs leading-relaxed ${variants[variant]}`}>
      <div className="flex items-start gap-2">
        <Icon size={14} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <strong className="block mb-1">{title}</strong>}
          {children}
        </div>
      </div>
    </div>
  )
})
FiqhNote.displayName = 'FiqhNote'

// ═══════════════════════════════════════════════
// ✅ تب خمس
// ═══════════════════════════════════════════════
const KhumsTab = memo(({ isPersian }) => {
  const dispatch = useDispatch()
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

  const hasYearStart = !!settings.khumsYearStart

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
            ? 'برای محاسبه خمس، ابتدا باید تاریخ شروع سال خمسی رو در تب تنظیمات وارد کنی. سال خمسی معمولاً از تاریخ اولین درآمد پایدار شروع می‌شه.'
            : 'To calculate Khums, first set the Khums year start date in Settings.'}
        </FiqhNote>
      )}

      <FiqhNote title={isPersian ? 'خمس چیست؟' : 'What is Khums?'}>
        {isPersian 
          ? 'خمس یعنی یک‌پنجم (۲۰٪) از مازاد درآمد سالانه‌ات، بعد از کسر مخارج سال. این مبلغ به دو سهم مساوی تقسیم می‌شه: سهم امام (ع) و سهم سادات.'
          : 'Khums is one-fifth (20%) of your annual surplus income, after deducting annual expenses. It is divided equally into Sahm al-Imam and Sahm al-Sadat.'}
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
                ? 'مخارج سالانه‌ات بیشتر از درآمد بوده، پس خمس واجب نیست. الحمدلله.'
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
              <Button
                onClick={handlePayKhums}
                className="flex-1 !bg-teal-600 hover:!bg-teal-700"
              >
                <FiCheckCircle size={16} />
                <span>{isPersian ? 'ثبت پرداخت' : 'Record'}</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPayModal(false)}
                className="flex-1"
              >
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

// ═══════════════════════════════════════════════
// ✅ تب زکات
// ═══════════════════════════════════════════════
const ZakatTab = memo(({ isPersian }) => {
  const finance = useSelector(state => state.finance || {})
  const calculation = useSelector(selectZakatCalculation)

  const hasAssets = calculation.totalGold > 0 || calculation.totalSilver > 0

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiPackage className="text-amber-600" size={20} />
          <span>{isPersian ? 'محاسبه زکات' : 'Zakat Calculation'}</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {isPersian ? 'فقط طلا و نقره (سایر موارد نیاز به محاسبه دستی دارد)' : 'Gold and silver only'}
        </p>
      </div>

      <FiqhNote title={isPersian ? 'زکات به چه چیزهایی تعلق می‌گیرد؟' : 'What is Zakat on?'}>
        {isPersian 
          ? 'زکات فقط به ۹ چیز تعلق می‌گیرد: گوسفند، گاو، شتر، طلا، نقره، گندم، جو، خرما، کشمش. زکات به پول نقد تعلق نمی‌گیرد — به پول نقد فقط خمس تعلق می‌گیرد.'
          : 'Zakat applies to 9 items only: sheep, cattle, camels, gold, silver, wheat, barley, dates, raisins. Cash is not subject to Zakat.'}
      </FiqhNote>

      <Card className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {isPersian ? 'نصاب‌های شرعی' : 'Religious Thresholds'}
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-amber-700 dark:text-amber-300 font-medium">
              {isPersian ? 'نصاب طلا' : 'Gold Nisab'}
            </div>
            <div className="text-base font-bold text-amber-700 dark:text-amber-300 mt-1">
              {formatNumber(ZAKAT_NISAB.goldGrams, isPersian, 2)} {isPersian ? 'گرم' : 'g'}
            </div>
            <div className="text-amber-600 dark:text-amber-400 mt-0.5">
              {isPersian ? '(۲۰ دینار)' : '(20 Dinar)'}
            </div>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {isPersian ? 'نصاب نقره' : 'Silver Nisab'}
            </div>
            <div className="text-base font-bold text-gray-700 dark:text-gray-300 mt-1">
              {formatNumber(ZAKAT_NISAB.silverGrams, isPersian, 2)} {isPersian ? 'گرم' : 'g'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-0.5">
              {isPersian ? '(۲۰۰ درهم)' : '(200 Dirham)'}
            </div>
          </div>
        </div>
      </Card>

      {!hasAssets && (
        <FiqhNote variant="info" title={isPersian ? 'طلا یا نقره‌ای ثبت نشده' : 'No gold or silver found'}>
          {isPersian 
            ? 'برای محاسبه زکات، اول باید یک حساب از نوع «طلا» یا «نقره» بسازی و موجودی‌اش رو به گرم وارد کنی.'
            : 'To calculate Zakat, first create a gold or silver account with balance in grams.'}
        </FiqhNote>
      )}

      {hasAssets && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiPackage size={16} className="text-amber-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isPersian ? 'طلا' : 'Gold'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'موجودی' : 'Balance'}:</span>
                  <span className="font-medium">{formatNumber(calculation.totalGold, isPersian, 2)} {isPersian ? 'گرم' : 'g'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'به نصاب رسیده؟' : 'Meets Nisab?'}:</span>
                  <span className={calculation.goldMeetsNisab ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {calculation.goldMeetsNisab ? (isPersian ? 'بله' : 'Yes') : (isPersian ? 'خیر' : 'No')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">{isPersian ? 'زکات' : 'Zakat'}:</span>
                  <span className="font-bold text-amber-600">{formatNumber(calculation.zakatGold, isPersian)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiPackage size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isPersian ? 'نقره' : 'Silver'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'موجودی' : 'Balance'}:</span>
                  <span className="font-medium">{formatNumber(calculation.totalSilver, isPersian, 2)} {isPersian ? 'گرم' : 'g'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{isPersian ? 'به نصاب رسیده؟' : 'Meets Nisab?'}:</span>
                  <span className={calculation.silverMeetsNisab ? 'text-green-600 font-medium' : 'text-gray-400'}>
                    {calculation.silverMeetsNisab ? (isPersian ? 'بله' : 'Yes') : (isPersian ? 'خیر' : 'No')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">{isPersian ? 'زکات' : 'Zakat'}:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{formatNumber(calculation.zakatSilver, isPersian)}</span>
                </div>
              </div>
            </Card>
          </div>

          {calculation.total > 0 && (
            <Card className="p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
              <div className="text-center">
                <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">
                  {isPersian ? 'مجموع زکات واجب' : 'Total Zakat Due'}
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {formatNumber(calculation.total, isPersian)}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {isPersian ? 'ریال' : 'IRR'}
                </div>
              </div>
            </Card>
          )}

          {!calculation.goldMeetsNisab && !calculation.silverMeetsNisab && (
            <FiqhNote variant="success" title={isPersian ? 'زکات واجب نیست' : 'No Zakat Due'}>
              {isPersian 
                ? 'طلا یا نقره‌ات به نصاب نرسیده، پس زکات واجب نیست.'
                : 'Your gold or silver has not reached Nisab, so no Zakat is due.'}
            </FiqhNote>
          )}
        </>
      )}
    </div>
  )
})
ZakatTab.displayName = 'ZakatTab'

// ═══════════════════════════════════════════════
// ✅ تب تنظیمات
// ═══════════════════════════════════════════════
const SettingsTab = memo(({ isPersian }) => {
  const dispatch = useDispatch()
  const finance = useSelector(state => state.finance || {})
  const settings = finance.islamicSettings || {}
  const currencySettings = finance.currencySettings || {}

  const [localSettings, setLocalSettings] = useState({
    khumsYearStart: settings.khumsYearStart || '',
    goldPricePerGram: settings.goldPricePerGram || 5000000,
    silverPricePerGram: settings.silverPricePerGram || 80000,
    showKhumsWidget: settings.showKhumsWidget !== false,
    showZakatWidget: settings.showZakatWidget !== false,
    warnOnInterest: settings.warnOnInterest !== false
  })

  const [fetchingGold, setFetchingGold] = useState(false)
  const [fetchingSilver, setFetchingSilver] = useState(false)

  const handleChange = useCallback((field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }))
  }, [])

  // ✅ دریافت قیمت لحظه‌ای طلا
  const handleFetchGoldPrice = useCallback(async () => {
    setFetchingGold(true)
    try {
      const priceUSD = await fetchGoldPrice()
      if (priceUSD) {
        // ✅ تبدیل دلار/گرم به ریال/گرم
        const usdRate = currencySettings.rates?.USD || 600000
        const priceIRR = Math.round(priceUSD * usdRate)
        
        handleChange('goldPricePerGram', priceIRR)
        toast.success(
          isPersian 
            ? `قیمت طلا: ${formatNumber(priceIRR, true)} ریال/گرم ($${priceUSD.toFixed(2)})`
            : `Gold: $${priceUSD.toFixed(2)}/g → ${formatNumber(priceIRR, true)} IRR/g`,
          { position: 'bottom-left', autoClose: 4000 }
        )
      } else {
        toast.error(isPersian ? 'خطا در دریافت قیمت' : 'Failed to fetch price', {
          position: 'bottom-left', autoClose: 3000
        })
      }
    } finally {
      setFetchingGold(false)
    }
  }, [currencySettings.rates, isPersian, handleChange])

  // ✅ دریافت قیمت لحظه‌ای نقره
  const handleFetchSilverPrice = useCallback(async () => {
    setFetchingSilver(true)
    try {
      const priceUSD = await fetchSilverPrice()
      if (priceUSD) {
        const usdRate = currencySettings.rates?.USD || 600000
        const priceIRR = Math.round(priceUSD * usdRate)
        
        handleChange('silverPricePerGram', priceIRR)
        toast.success(
          isPersian 
            ? `قیمت نقره: ${formatNumber(priceIRR, true)} ریال/گرم`
            : `Silver: $${priceUSD.toFixed(2)}/g → ${formatNumber(priceIRR, true)} IRR/g`,
          { position: 'bottom-left', autoClose: 4000 }
        )
      } else {
        toast.error(isPersian ? 'خطا در دریافت قیمت' : 'Failed to fetch price', {
          position: 'bottom-left', autoClose: 3000
        })
      }
    } finally {
      setFetchingSilver(false)
    }
  }, [currencySettings.rates, isPersian, handleChange])

  const handleSave = useCallback(() => {
    dispatch(updateIslamicSettings(localSettings))
    toast.success(isPersian ? 'تنظیمات ذخیره شد' : 'Settings saved', {
      position: 'bottom-left', autoClose: 2500
    })
  }, [localSettings, dispatch, isPersian])

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiSettings className="text-gray-600" size={20} />
          <span>{isPersian ? 'تنظیمات محاسبات اسلامی' : 'Islamic Settings'}</span>
        </h3>
      </div>

      <Card className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {isPersian ? 'سال خمسی' : 'Khums Year'}
        </h4>

        <FiqhNote>
          {isPersian 
            ? 'سال خمسی از تاریخی شروع می‌شه که اولین درآمد پایدارت رو داشتی. مثلاً اگه اولین حقوقت رو اول فروردین گرفتی، سال خمسی‌ات از همون تاریخ شروع می‌شه و هر سال همون تاریخ باید خمس بدی.'
            : 'The Khums year starts from when you had your first stable income.'}
        </FiqhNote>

        <DatePicker
          label={isPersian ? 'تاریخ شروع سال خمسی' : 'Khums Year Start'}
          value={localSettings.khumsYearStart}
          onChange={(e) => handleChange('khumsYearStart', e.target.value)}
          placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
        />
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isPersian ? 'نرخ طلا و نقره' : 'Gold & Silver Prices'}
          </h4>
          <div className="flex gap-2">
            <Button
              onClick={handleFetchGoldPrice}
              loading={fetchingGold}
              size="small"
              variant="secondary"
            >
              <FiRefreshCw size={12} />
              <span>{isPersian ? 'قیمت طلا' : 'Gold'}</span>
            </Button>
            <Button
              onClick={handleFetchSilverPrice}
              loading={fetchingSilver}
              size="small"
              variant="secondary"
            >
              <FiRefreshCw size={12} />
              <span>{isPersian ? 'قیمت نقره' : 'Silver'}</span>
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isPersian 
            ? 'نرخ لحظه‌ای از بازار جهانی دریافت می‌شه و با نرخ دلار شما تبدیل می‌شه. می‌تونی دستی هم وارد کنی.'
            : 'Live rates from global market, converted with your USD rate. You can also enter manually.'}
        </p>

        <CurrencyInput
          label={isPersian ? 'قیمت هر گرم طلا (ریال)' : 'Gold Price per gram (IRR)'}
          value={localSettings.goldPricePerGram}
          onChange={(e) => handleChange('goldPricePerGram', e.target.value)}
          currency="IRR"
        />

        <CurrencyInput
          label={isPersian ? 'قیمت هر گرم نقره (ریال)' : 'Silver Price per gram (IRR)'}
          value={localSettings.silverPricePerGram}
          onChange={(e) => handleChange('silverPricePerGram', e.target.value)}
          currency="IRR"
        />
      </Card>

      <Card className="p-5 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {isPersian ? 'گزینه‌های نمایش' : 'Display Options'}
        </h4>

        <label className="flex items-center justify-between py-2 cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isPersian ? 'نمایش ویجت خمس در داشبورد' : 'Show Khums widget'}
          </span>
          <input
            type="checkbox"
            checked={localSettings.showKhumsWidget}
            onChange={(e) => handleChange('showKhumsWidget', e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600"
          />
        </label>

        <label className="flex items-center justify-between py-2 cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isPersian ? 'نمایش ویجت زکات در داشبورد' : 'Show Zakat widget'}
          </span>
          <input
            type="checkbox"
            checked={localSettings.showZakatWidget}
            onChange={(e) => handleChange('showZakatWidget', e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600"
          />
        </label>

        <label className="flex items-center justify-between py-2 cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isPersian ? 'هشدار ربا در ثبت تراکنش' : 'Interest (Riba) warning'}
          </span>
          <input
            type="checkbox"
            checked={localSettings.warnOnInterest}
            onChange={(e) => handleChange('warnOnInterest', e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600"
          />
        </label>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          <FiSave size={16} />
          <span>{isPersian ? 'ذخیره تنظیمات' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  )
})
SettingsTab.displayName = 'SettingsTab'

// ═══════════════════════════════════════════════
// ✅ IslamicPanel اصلی
// ═══════════════════════════════════════════════
const IslamicPanel = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [activeTab, setActiveTab] = useState('khums')

  return (
    <div className="space-y-5">
      <Card className="p-1">
        <div className="flex gap-1">
          {INNER_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium
                  transition-colors flex items-center justify-center gap-2
                  ${isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={14} />
                <span>{isPersian ? tab.labelFa : tab.labelEn}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        {activeTab === 'khums' && <KhumsTab isPersian={isPersian} />}
        {activeTab === 'zakat' && <ZakatTab isPersian={isPersian} />}
        {activeTab === 'settings' && <SettingsTab isPersian={isPersian} />}
      </Card>

      <FiqhNote>
        {isPersian 
          ? 'توجه: این محاسبات جنبه کمک‌کننده دارد و برای احکام دقیق شرعی، به رساله مرجع تقلید خود مراجعه کنید.'
          : 'Note: These calculations are helpers. For precise rulings, refer to your Marja\'s risalah.'}
      </FiqhNote>
    </div>
  )
})

IslamicPanel.displayName = 'IslamicPanel'

export default IslamicPanel