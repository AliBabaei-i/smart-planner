import React, { useState, useCallback, useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSettings, FiSave, FiRefreshCw, FiDownloadCloud,
  FiTrendingUp, FiDollarSign
} from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DatePicker from '../../../components/ui/DatePicker'
import CurrencyInput from '../CurrencyInput'
import FiqhNote from './FiqhNote'
import { updateIslamicSettings, updateCurrencyRates } from '../financeSlice'
import { formatNumber } from '../currencyHelpers'
import { marketApi } from '../../../services/marketApi'

const IslamicSettingsTab = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const settings = finance.islamicSettings || {}

  const [localSettings, setLocalSettings] = useState({
    khumsYearStart: settings.khumsYearStart || '',
    goldPricePerGram: settings.goldPricePerGram || 0,
    silverPricePerGram: settings.silverPricePerGram || 0,
    showKhumsWidget: settings.showKhumsWidget !== false,
    showZakatWidget: settings.showZakatWidget !== false,
    warnOnInterest: settings.warnOnInterest !== false
  })

  const [liveUsd, setLiveUsd] = useState(null)
  const [loading, setLoading] = useState(false)
  const [autoFetched, setAutoFetched] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const handleChange = useCallback((field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }))
  }, [])

  const loadPrices = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = forceRefresh
        ? await marketApi.refresh()
        : await marketApi.getPrices()

      setLiveUsd(data.usdRial)

      setLocalSettings(prev => ({
        ...prev,
        goldPricePerGram: data.gold18kRial,
        silverPricePerGram: data.silverRial
      }))

      // ✅ به‌روزرسانی نرخ دلار در تنظیمات ارز
      dispatch(updateCurrencyRates({ USD: data.usdRial }))

      setAutoFetched(true)
      return true
    } catch (error) {
      console.error('Market fetch failed:', error)
      setFetchError(error.message)
      setAutoFetched(true)
      return false
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // ✅ Auto-fetch روی mount
  useEffect(() => {
    loadPrices(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleManualRefresh = useCallback(async () => {
    const ok = await loadPrices(true)
    if (ok) {
      toast.success(isPersian ? 'قیمت‌ها به‌روز شد' : 'Prices updated', {
        position: 'bottom-left', autoClose: 2500
      })
    } else {
      toast.error(
        isPersian ? 'خطا در دریافت قیمت — از سرور' : 'Server fetch failed',
        { position: 'bottom-left', autoClose: 3000 }
      )
    }
  }, [loadPrices, isPersian])

  const handleSave = useCallback(() => {
    dispatch(updateIslamicSettings(localSettings))
    toast.success(isPersian ? 'تنظیمات ذخیره شد' : 'Settings saved', {
      position: 'bottom-left', autoClose: 2500
    })
  }, [localSettings, dispatch, isPersian])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiSettings className="text-gray-600" size={20} />
          <span>{isPersian ? 'تنظیمات محاسبات اسلامی' : 'Islamic Settings'}</span>
        </h3>
        <Button onClick={handleManualRefresh} loading={loading} size="small" variant="secondary">
          <FiRefreshCw size={12} />
          <span>{isPersian ? 'به‌روزرسانی' : 'Refresh'}</span>
        </Button>
      </div>

      {/* سال خمسی */}
      <Card className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {isPersian ? 'سال خمسی' : 'Khums Year'}
        </h4>
        <FiqhNote>
          {isPersian
            ? 'سال خمسی از تاریخی شروع می‌شه که اولین درآمد پایدارت رو داشتی.'
            : 'The Khums year starts from your first stable income.'}
        </FiqhNote>
        <DatePicker
          label={isPersian ? 'تاریخ شروع سال خمسی' : 'Khums Year Start'}
          value={localSettings.khumsYearStart}
          onChange={(e) => handleChange('khumsYearStart', e.target.value)}
          placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
        />
      </Card>

      {/* نرخ طلا و نقره */}
      <Card className="p-5 space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiTrendingUp size={14} className="text-amber-600" />
          {isPersian ? 'نرخ طلا و نقره (بازار ایران)' : 'Gold & Silver (Iran Market)'}
        </h4>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isPersian
            ? 'قیمت‌ها از TGJU (بازار ایران) از طریق سرور شما دریافت می‌شن. قابل ویرایش دستی هم هستن.'
            : 'Prices fetched from TGJU via your server. Manually editable too.'}
        </p>

        {autoFetched && !fetchError && liveUsd && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
            <FiDownloadCloud size={14} />
            <span>
              {isPersian
                ? `قیمت‌های لحظه‌ای لود شد`
                : `Live prices loaded`}
            </span>
          </div>
        )}

        {autoFetched && fetchError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-300">
            <span>
              {isPersian
                ? `دریافت خودکار ناموفق (${fetchError}). مقادیر دستی زیر استفاده می‌شن.`
                : `Auto-fetch failed (${fetchError}). Manual values used.`}
            </span>
          </div>
        )}

        <CurrencyInput
          label={isPersian ? 'قیمت هر گرم طلا (ریال)' : 'Gold Price/g (IRR)'}
          value={localSettings.goldPricePerGram}
          onChange={(e) => handleChange('goldPricePerGram', e.target.value)}
          currency="IRR"
        />

        <CurrencyInput
          label={isPersian ? 'قیمت هر گرم نقره (ریال)' : 'Silver Price/g (IRR)'}
          value={localSettings.silverPricePerGram}
          onChange={(e) => handleChange('silverPricePerGram', e.target.value)}
          currency="IRR"
        />

        {liveUsd && (
          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
            <FiDollarSign size={12} />
            <span>
              {isPersian
                ? `دلار بازار آزاد: ${formatNumber(liveUsd, true)} ریال`
                : `USD: ${formatNumber(liveUsd, false)} IRR`}
            </span>
          </div>
        )}
      </Card>

      {/* گزینه‌های نمایش */}
      <Card className="p-5 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {isPersian ? 'گزینه‌های نمایش' : 'Display Options'}
        </h4>

        {[
          { key: 'showKhumsWidget', labelFa: 'نمایش ویجت خمس در داشبورد', labelEn: 'Show Khums widget' },
          { key: 'showZakatWidget', labelFa: 'نمایش ویجت زکات در داشبورد', labelEn: 'Show Zakat widget' },
          { key: 'warnOnInterest', labelFa: 'هشدار ربا در ثبت تراکنش', labelEn: 'Interest (Riba) warning' }
        ].map(opt => (
          <label key={opt.key} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isPersian ? opt.labelFa : opt.labelEn}
            </span>
            <input
              type="checkbox"
              checked={localSettings[opt.key]}
              onChange={(e) => handleChange(opt.key, e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600"
            />
          </label>
        ))}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="!bg-emerald-600 hover:!bg-emerald-700">
          <FiSave size={16} />
          <span>{isPersian ? 'ذخیره تنظیمات' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  )
})

IslamicSettingsTab.displayName = 'IslamicSettingsTab'

export default IslamicSettingsTab