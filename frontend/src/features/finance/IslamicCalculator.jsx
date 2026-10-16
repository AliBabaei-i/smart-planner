import React, { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiPercent, FiPackage, FiInfo, FiCheckCircle,
  FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import CurrencyInput from './CurrencyInput'
import {
  formatNumber,
  formatCompact,
  toPersianDigits
} from './currencyHelpers'
import {
  calculateKhums,
  calculateZakat,
  ZAKAT_NISAB
} from './islamicFinance'

// ═══════════════════════════════════════════════
// ✅ Tabs
// ═══════════════════════════════════════════════
const CALC_TABS = [
  { id: 'khums', labelFa: 'خمس', labelEn: 'Khums', icon: FiPercent },
  { id: 'zakat', labelFa: 'زکات', labelEn: 'Zakat', icon: FiPackage }
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
  const Icon = variant === 'warning' ? FiAlertTriangle : variant === 'success' ? FiCheckCircle : FiInfo

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
// ✅ ماشین‌حساب خمس
// ═══════════════════════════════════════════════
const KhumsCalculator = memo(({ isPersian }) => {
  const { t } = useTranslation()
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')

  const result = useMemo(() => {
    const inc = parseFloat(income) || 0
    const exp = parseFloat(expenses) || 0
    return calculateKhums(inc, exp)
  }, [income, expenses])

  const reset = useCallback(() => {
    setIncome('')
    setExpenses('')
  }, [])

  const hasResult = result.totalIncome > 0

  return (
    <div className="space-y-4">
      <FiqhNote title={isPersian ? 'خمس چیست؟' : 'What is Khums?'}>
        {isPersian
          ? 'خمس یعنی یک‌پنجم (۲۰٪) از مازاد درآمد سالانه‌ات، بعد از کسر مخارج سال. این مبلغ به دو سهم مساوی تقسیم می‌شه: سهم امام (ع) و سهم سادات.'
          : 'Khums is one-fifth (20%) of your annual surplus income, after deducting annual expenses.'}
      </FiqhNote>

      <CurrencyInput
        label={isPersian ? 'کل درآمد سالانه' : 'Total Annual Income'}
        value={income}
        onChange={(e) => setIncome(e.target.value)}
        currency="IRR"
        size="large"
      />

      <CurrencyInput
        label={isPersian ? 'کل مخارج سالانه' : 'Total Annual Expenses'}
        value={expenses}
        onChange={(e) => setExpenses(e.target.value)}
        currency="IRR"
        size="large"
      />

      {hasResult && (
        <>
          {/* خلاصه */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {isPersian ? 'مازاد سالانه' : 'Annual Surplus'}
              </div>
              <div className="font-bold text-blue-600 dark:text-blue-400">
                {formatCompact(result.surplus, isPersian)}
              </div>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-gray-900">
              <div className="text-xs text-teal-600 dark:text-teal-400 mb-1 font-medium">
                {isPersian ? 'خمس واجب' : 'Khums Due'}
              </div>
              <div className="font-bold text-teal-700 dark:text-teal-300">
                {formatCompact(result.khums, isPersian)}
              </div>
            </div>
          </div>

          {/* تفکیک سهم‌ها */}
          {result.khums > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  {isPersian ? 'سهم امام (ع) ۵۰٪' : 'Sahm al-Imam 50%'}
                </div>
                <div className="font-bold text-blue-700 dark:text-blue-300">
                  {formatNumber(result.sahmImam, isPersian)}
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                  {isPersian ? 'سهم سادات ۵۰٪' : 'Sahm al-Sadat 50%'}
                </div>
                <div className="font-bold text-purple-700 dark:text-purple-300">
                  {formatNumber(result.sahmSadat, isPersian)}
                </div>
              </div>
            </div>
          )}

          {result.khums === 0 && (
            <FiqhNote variant="success" title={isPersian ? 'خمس واجب نیست' : 'No Khums Due'}>
              {isPersian
                ? 'مخارج سالانه‌ات بیشتر از درآمد بوده، پس خمس واجب نیست.'
                : 'Your annual expenses exceed your income, so no Khums is due.'}
            </FiqhNote>
          )}
        </>
      )}

      {(income || expenses) && (
        <div className="flex justify-end">
          <Button onClick={reset} variant="secondary" size="small">
            <FiRefreshCw size={12} />
            <span>{isPersian ? 'بازنشانی' : 'Reset'}</span>
          </Button>
        </div>
      )}
    </div>
  )
})
KhumsCalculator.displayName = 'KhumsCalculator'

// ═══════════════════════════════════════════════
// ✅ ماشین‌حساب زکات
// ═══════════════════════════════════════════════
const ZakatCalculator = memo(({ isPersian }) => {
  const { t } = useTranslation()
  const [goldGrams, setGoldGrams] = useState('')
  const [silverGrams, setSilverGrams] = useState('')
  const [goldPrice, setGoldPrice] = useState('')
  const [silverPrice, setSilverPrice] = useState('')

  const result = useMemo(() => {
    return calculateZakat(
      parseFloat(goldGrams) || 0,
      parseFloat(silverGrams) || 0,
      parseFloat(goldPrice) || 0,
      parseFloat(silverPrice) || 0
    )
  }, [goldGrams, silverGrams, goldPrice, silverPrice])

  const reset = useCallback(() => {
    setGoldGrams('')
    setSilverGrams('')
    setGoldPrice('')
    setSilverPrice('')
  }, [])

  const hasResult = result.totalGold > 0 || result.totalSilver > 0

  return (
    <div className="space-y-4">
      <FiqhNote title={isPersian ? 'زکات به چه چیزهایی تعلق می‌گیرد؟' : 'What is Zakat on?'}>
        {isPersian
          ? 'زکات فقط به ۹ چیز تعلق می‌گیرد: گوسفند، گاو، شتر، طلا، نقره، گندم، جو، خرما، کشمش. زکات به پول نقد تعلق نمی‌گیرد — به پول نقد فقط خمس تعلق می‌گیرد.'
          : 'Zakat applies to 9 items: sheep, cattle, camels, gold, silver, wheat, barley, dates, raisins. Cash is not subject to Zakat.'}
      </FiqhNote>

      {/* نصاب‌ها */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-center">
          <div className="text-amber-700 dark:text-amber-300">
            {isPersian ? 'نصاب طلا' : 'Gold Nisab'}
          </div>
          <div className="font-bold text-amber-700 dark:text-amber-300">
            {toPersianDigits(ZAKAT_NISAB.goldGrams)} {isPersian ? 'گرم' : 'g'}
          </div>
        </div>
        <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded text-center">
          <div className="text-gray-700 dark:text-gray-300">
            {isPersian ? 'نصاب نقره' : 'Silver Nisab'}
          </div>
          <div className="font-bold text-gray-700 dark:text-gray-300">
            {toPersianDigits(ZAKAT_NISAB.silverGrams)} {isPersian ? 'گرم' : 'g'}
          </div>
        </div>
      </div>

      {/* ورودی طلا */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-3">
        <div className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <FiPackage size={14} />
          {isPersian ? 'طلا' : 'Gold'}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {isPersian ? 'موجودی (گرم)' : 'Balance (g)'}
            </label>
            <input
              type="number"
              value={goldGrams}
              onChange={(e) => setGoldGrams(e.target.value)}
              placeholder="0"
              step="any"
              min="0"
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {isPersian ? 'قیمت هر گرم' : 'Price per g'}
            </label>
            <input
              type="number"
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value)}
              placeholder="0"
              step="any"
              min="0"
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {result.totalGold > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className={result.goldMeetsNisab ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {result.goldMeetsNisab
                ? (isPersian ? 'به نصاب رسیده ✓' : 'Meets Nisab ✓')
                : (isPersian ? 'به نصاب نرسیده' : 'Below Nisab')}
            </span>
            {result.zakatGold > 0 && (
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {formatNumber(result.zakatGold, isPersian)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ورودی نقره */}
      <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FiPackage size={14} />
          {isPersian ? 'نقره' : 'Silver'}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {isPersian ? 'موجودی (گرم)' : 'Balance (g)'}
            </label>
            <input
              type="number"
              value={silverGrams}
              onChange={(e) => setSilverGrams(e.target.value)}
              placeholder="0"
              step="any"
              min="0"
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {isPersian ? 'قیمت هر گرم' : 'Price per g'}
            </label>
            <input
              type="number"
              value={silverPrice}
              onChange={(e) => setSilverPrice(e.target.value)}
              placeholder="0"
              step="any"
              min="0"
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        {result.totalSilver > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className={result.silverMeetsNisab ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {result.silverMeetsNisab
                ? (isPersian ? 'به نصاب رسیده ✓' : 'Meets Nisab ✓')
                : (isPersian ? 'به نصاب نرسیده' : 'Below Nisab')}
            </span>
            {result.zakatSilver > 0 && (
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {formatNumber(result.zakatSilver, isPersian)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* مجموع */}
      {result.total > 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
          <div className="text-center">
            <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">
              {isPersian ? 'مجموع زکات واجب' : 'Total Zakat Due'}
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {formatNumber(result.total, isPersian)}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              {isPersian ? 'ریال' : 'IRR'}
            </div>
          </div>
        </Card>
      )}

      {hasResult && !result.goldMeetsNisab && !result.silverMeetsNisab && (
        <FiqhNote variant="success" title={isPersian ? 'زکات واجب نیست' : 'No Zakat Due'}>
          {isPersian
            ? 'طلا یا نقره‌ات به نصاب نرسیده، پس زکات واجب نیست.'
            : 'Your gold or silver has not reached Nisab.'}
        </FiqhNote>
      )}

      {(goldGrams || silverGrams || goldPrice || silverPrice) && (
        <div className="flex justify-end">
          <Button onClick={reset} variant="secondary" size="small">
            <FiRefreshCw size={12} />
            <span>{isPersian ? 'بازنشانی' : 'Reset'}</span>
          </Button>
        </div>
      )}
    </div>
  )
})
ZakatCalculator.displayName = 'ZakatCalculator'

// ═══════════════════════════════════════════════
// ✅ IslamicCalculator اصلی
// ═══════════════════════════════════════════════
const IslamicCalculator = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [activeTab, setActiveTab] = useState('khums')

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        {CALC_TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2 px-3 rounded-md text-sm font-medium
                transition-colors flex items-center justify-center gap-2
                ${isActive
                  ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon size={14} />
              <span>{isPersian ? tab.labelFa : tab.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* محتوا */}
      {activeTab === 'khums' && <KhumsCalculator isPersian={isPersian} />}
      {activeTab === 'zakat' && <ZakatCalculator isPersian={isPersian} />}

      {/* یادداشت پایین */}
      <FiqhNote>
        {isPersian
          ? 'توجه: این محاسبات جنبه کمک‌کننده دارد و برای احکام دقیق شرعی، به رساله مرجع تقلید خود مراجعه کنید.'
          : 'Note: These calculations are helpers. For precise rulings, refer to your Marja\'s risalah.'}
      </FiqhNote>
    </div>
  )
})

IslamicCalculator.displayName = 'IslamicCalculator'

export default IslamicCalculator