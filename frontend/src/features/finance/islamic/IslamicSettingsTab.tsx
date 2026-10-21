import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave, FiCalendar, FiPercent, FiPackage, FiInfo, FiTrendingUp,
  FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiClock,
} from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import MonthDayPicker from '../../../components/ui/MonthDayPicker'
import {
  updateIslamicSettings,
  updateCurrencyRates,
  selectKhumsCycleInfo,
} from '../financeSlice'
import { formatNumber, formatCompact } from '../currencyHelpers'
import { formatLongDateByLang } from '../../../utils/formatters'
import type { RootState, AppDispatch } from '../../../app/store'

interface LivePrices {
  gold: number
  silver: number
  usd: number
  fetchedAt: string
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api'

const IslamicSettingsTab: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch<AppDispatch>()

  const settings = useSelector((s: RootState) => s.finance.islamicSettings)
  const cycleInfo = useSelector(selectKhumsCycleInfo)

  // ✅ state محلی فرم
  const [localSettings, setLocalSettings] = useState({
    khumsYearMonthDay: (settings as any).khumsYearMonthDay || null,
    goldNisabGrams: settings.goldNisabGrams ?? 87.48,
    silverNisabGrams: settings.silverNisabGrams ?? 612.36,
    goldPricePerGram: settings.goldPricePerGram ?? 5000000,
    silverPricePerGram: settings.silverPricePerGram ?? 80000,
    showKhumsWidget: settings.showKhumsWidget ?? true,
    showZakatWidget: settings.showZakatWidget ?? true,
    warnOnInterest: settings.warnOnInterest ?? true,
  })

  // ✅ state قیمت زنده
  const [livePrices, setLivePrices] = useState<LivePrices | null>(null)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)

  // ✅ fetch قیمت لحظه‌ای
  const fetchLivePrices = useCallback(async () => {
    setLoadingPrices(true)
    setPriceError(null)
    try {
      const res = await fetch(`${API_BASE}/market/prices`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      // ✅ چند نسخه از پاسخ backend را پشتیبانی می‌کند
      const gold =
        Number(data.gold18kRial ?? data.gold_gram ?? data.geram18 ?? data.gold ?? 0) || 0
      const silver =
        Number(data.silverRial ?? data.silver_gram ?? data.silver_999 ?? data.silver ?? 0) || 0
      const usd =
        Number(data.usdRial ?? data.price_dollar_rl ?? data.usd ?? 0) || 0

      if (gold <= 0 && silver <= 0) {
        throw new Error('Empty prices')
      }

      setLivePrices({
        gold,
        silver,
        usd,
        fetchedAt: data.fetchedAt || new Date().toISOString(),
      })
    } catch (err: any) {
      console.warn('[market prices] fetch failed:', err)
      setPriceError(isPersian ? 'خطا در دریافت قیمت' : 'Failed to fetch prices')
    } finally {
      setLoadingPrices(false)
    }
  }, [isPersian])

  // ✅ fetch اولیه + هر ۵ دقیقه
  useEffect(() => {
    fetchLivePrices()
    const interval = setInterval(fetchLivePrices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchLivePrices])

  const handleChange = useCallback((field: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleUseLiveGold = useCallback(() => {
    if (!livePrices?.gold) return
    setLocalSettings((prev) => ({ ...prev, goldPricePerGram: livePrices.gold }))
    toast.success(
      isPersian ? 'قیمت طلا به‌روز شد' : 'Gold price updated',
      { position: 'bottom-left', autoClose: 2000 }
    )
  }, [livePrices, isPersian])

  const handleUseLiveSilver = useCallback(() => {
    if (!livePrices?.silver) return
    setLocalSettings((prev) => ({ ...prev, silverPricePerGram: livePrices.silver }))
    toast.success(
      isPersian ? 'قیمت نقره به‌روز شد' : 'Silver price updated',
      { position: 'bottom-left', autoClose: 2000 }
    )
  }, [livePrices, isPersian])

  const handleSave = useCallback(() => {
    try {
      dispatch(
        updateIslamicSettings({
          khumsYearMonthDay: localSettings.khumsYearMonthDay,
          goldNisabGrams: Number(localSettings.goldNisabGrams) || 87.48,
          silverNisabGrams: Number(localSettings.silverNisabGrams) || 612.36,
          goldPricePerGram: Number(localSettings.goldPricePerGram) || 0,
          silverPricePerGram: Number(localSettings.silverPricePerGram) || 0,
          showKhumsWidget: localSettings.showKhumsWidget,
          showZakatWidget: localSettings.showZakatWidget,
          warnOnInterest: localSettings.warnOnInterest,
        } as any)
      )

      dispatch(
        updateCurrencyRates({
          GOLD_GRAM: Number(localSettings.goldPricePerGram) || 0,
          SILVER_GRAM: Number(localSettings.silverPricePergramPlaceholder as any || localSettings.silverPricePerGram) || 0,
        })
      )

      toast.success(isPersian ? 'تنظیمات ذخیره شد' : 'Settings saved', {
        position: 'bottom-left',
        autoClose: 2500,
      })
    } catch (err) {
      console.error(err)
      toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed')
    }
  }, [localSettings, dispatch, isPersian])

  const lastFetchedText = useMemo(() => {
    if (!livePrices) return null
    try {
      return new Date(livePrices.fetchedAt).toLocaleTimeString(
        isPersian ? 'fa-IR' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      )
    } catch {
      return null
    }
  }, [livePrices, isPersian])

  return (
    <div className="space-y-5">
      {/* ═══ سال خمسی ═══ */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
            <FiCalendar size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
              {isPersian ? 'سال خمسی' : 'Khums Year'}
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
              {isPersian
                ? 'شروع هر سال خمسی، یک روز از سال شمسی است که هر سال تکرار می‌شود.'
                : 'Your Khums year starts on the same date each year.'}
            </p>
          </div>
        </div>

        <MonthDayPicker
          label={isPersian ? 'روز شروع سال خمسی' : 'Khums Year Start Date'}
          value={localSettings.khumsYearMonthDay}
          onChange={(v) => handleChange('khumsYearMonthDay', v)}
        />

        {cycleInfo.start && cycleInfo.end && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
              {isPersian ? 'چرخه‌ی جاری' : 'Current Cycle'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium flex-wrap">
              <FiCheckCircle size={12} />
              <span>{formatLongDateByLang(cycleInfo.start)}</span>
              <span className="text-gray-400">→</span>
              <span>{formatLongDateByLang(cycleInfo.end)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ نصاب شرعی ═══ */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <FiPackage size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
              {isPersian ? 'نصاب شرعی زکات' : 'Zakat Nisab'}
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
              {isPersian
                ? 'حداقل مقدار طلا/نقره برای تعلق زکات'
                : 'Minimum gold/silver required for Zakat'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isPersian ? 'نصاب طلا (گرم)' : 'Gold Nisab (grams)'}
            </label>
            <input
              type="number"
              value={localSettings.goldNisabGrams}
              onChange={(e) => handleChange('goldNisabGrams', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              {isPersian ? '۸۷.۴۸ گرم (۲۰ دینار)' : '87.48g (20 dinars)'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isPersian ? 'نصاب نقره (گرم)' : 'Silver Nisab (grams)'}
            </label>
            <input
              type="number"
              value={localSettings.silverNisabGrams}
              onChange={(e) => handleChange('silverNisabGrams', parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              {isPersian ? '۶۱۲.۳۶ گرم (۲۰۰ درهم)' : '612.36g (200 dirhams)'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ قیمت زنده‌ی طلا و نقره ═══ */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                {isPersian ? 'قیمت لحظه‌ای بازار' : 'Live Market Prices'}
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5 leading-relaxed">
                {isPersian
                  ? 'به‌روزرسانی خودکار هر ۵ دقیقه'
                  : 'Auto-updated every 5 minutes'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchLivePrices}
            disabled={loadingPrices}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 flex-shrink-0"
            title={isPersian ? 'به‌روزرسانی' : 'Refresh'}
          >
            <FiRefreshCw
              size={14}
              className={`text-blue-600 dark:text-blue-400 ${loadingPrices ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {priceError && !livePrices && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300">
            <FiAlertTriangle size={12} />
            <span>{priceError}</span>
          </div>
        )}

        {livePrices && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* طلا */}
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {isPersian ? 'طلای ۱۸ عیار (هر گرم)' : 'Gold 18K (per gram)'}
                </span>
                <FiCheckCircle size={10} className="text-green-500" />
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(livePrices.gold, isPersian)}
                <span className="text-[10px] font-normal text-gray-400 ms-1">
                  {isPersian ? 'ریال' : 'IRR'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseLiveGold}
                className="w-full mt-1 text-[10px] py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
              >
                {isPersian ? 'استفاده از این قیمت' : 'Use this price'}
              </button>
            </div>

            {/* نقره */}
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {isPersian ? 'نقره (هر گرم)' : 'Silver (per gram)'}
                </span>
                <FiCheckCircle size={10} className="text-green-500" />
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(livePrices.silver, isPersian)}
                <span className="text-[10px] font-normal text-gray-400 ms-1">
                  {isPersian ? 'ریال' : 'IRR'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseLiveSilver}
                className="w-full mt-1 text-[10px] py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
              >
                {isPersian ? 'استفاده از این قیمت' : 'Use this price'}
              </button>
            </div>
          </div>
        )}

        {lastFetchedText && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <FiClock size={9} />
            <span>
              {isPersian ? 'آخرین به‌روزرسانی:' : 'Last update:'} {lastFetchedText}
            </span>
          </div>
        )}
      </div>

      {/* ═══ قیمت‌های دستی (برای استفاده‌ی آفلاین) ═══ */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {isPersian ? 'قیمت مورد استفاده در محاسبات' : 'Prices Used in Calculations'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isPersian
              ? 'قیمت‌هایی که در محاسبه‌ی زکات و خمس استفاده می‌شوند'
              : 'Used for Zakat and Khums calculations'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isPersian ? 'قیمت طلا (ریال/گرم)' : 'Gold (IRR/gram)'}
            </label>
            <input
              type="number"
              value={localSettings.goldPricePerGram}
              onChange={(e) => handleChange('goldPricePerGram', parseFloat(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              {formatCompact(localSettings.goldPricePerGram, isPersian)} {isPersian ? 'ریال' : 'IRR'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isPersian ? 'قیمت نقره (ریال/گرم)' : 'Silver (IRR/gram)'}
            </label>
            <input
              type="number"
              value={localSettings.silverPricePerGram}
              onChange={(e) => handleChange('silverPricePerGram', parseFloat(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              {formatCompact(localSettings.silverPricePerGram, isPersian)} {isPersian ? 'ریال' : 'IRR'}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ نمایش ویجت‌ها ═══ */}
      <div className="space-y-2">
        <ToggleRow
          icon={<FiPercent size={16} className="text-teal-600" />}
          label={isPersian ? 'نمایش ویجت خمس' : 'Show Khums Widget'}
          description={isPersian ? 'در داشبورد نمایش داده شود' : 'Display on dashboard'}
          checked={localSettings.showKhumsWidget}
          onChange={(v) => handleChange('showKhumsWidget', v)}
        />
        <ToggleRow
          icon={<FiPackage size={16} className="text-amber-600" />}
          label={isPersian ? 'نمایش ویجت زکات' : 'Show Zakat Widget'}
          description={isPersian ? 'در داشبورد نمایش داده شود' : 'Display on dashboard'}
          checked={localSettings.showZakatWidget}
          onChange={(v) => handleChange('showZakatWidget', v)}
        />
        <ToggleRow
          icon={<FiAlertTriangle size={16} className="text-red-600" />}
          label={isPersian ? 'هشدار ربا' : 'Riba Warning'}
          description={isPersian ? 'هنگام ثبت تراکنش سود' : 'On interest transactions'}
          checked={localSettings.warnOnInterest}
          onChange={(v) => handleChange('warnOnInterest', v)}
        />
      </div>

      {/* ═══ دکمه ذخیره ═══ */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleSave} className="w-full !bg-emerald-600 hover:!bg-emerald-700">
          <FiSave size={16} />
          <span>{isPersian ? 'ذخیره تنظیمات' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* ═══ یادآوری فقهی ═══ */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-2">
        <FiInfo size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">
          {isPersian
            ? 'این محاسبات جنبه کمک‌کننده دارد. برای احکام دقیق، به رساله‌ی مرجع تقلید خود مراجعه کنید.'
            : "These are helper calculations. For precise rulings, consult your Marja's risalah."}
        </p>
      </div>
    </div>
  )
}

const ToggleRow: React.FC<{
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}> = ({ icon, label, description, checked, onChange }) => (
  <label className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
    <div className="flex items-start gap-2.5 flex-1 min-w-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  </label>
)

export default IslamicSettingsTab