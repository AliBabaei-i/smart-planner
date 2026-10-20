import React, { useState, useCallback, useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSettings, FiSave, FiRefreshCw, FiDownloadCloud, FiTrendingUp, FiDollarSign } from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DatePicker from '../../../components/ui/DatePicker'
import CurrencyInput from '../CurrencyInput'
import FiqhNote from './FiqhNote'
import { updateIslamicSettings, updateCurrencyRates } from '../financeSlice'
import { formatNumber } from '../currencyHelpers'
import { marketApi } from '../../../services/marketApi'
import type { RootState, AppDispatch } from '../../../app/store'
import type { IslamicSettings } from '../../../types/finance' // ✅ اضافه شد

const IslamicSettingsTab = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector((state: RootState) => state.finance)
  // ✅ FIX: کست کردن به تایپ دقیق
  const settings = (finance?.islamicSettings || {}) as IslamicSettings

  const [localSettings, setLocalSettings] = useState({
    khumsYearStart: settings.khumsYearStart || '',
    goldPricePerGram: settings.goldPricePerGram || 0,
    silverPricePerGram: settings.silverPricePerGram || 0,
    showKhumsWidget: settings.showKhumsWidget !== false,
    showZakatWidget: settings.showZakatWidget !== false,
    warnOnInterest: settings.warnOnInterest !== false
  })

  const [liveUsd, setLiveUsd] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoFetched, setAutoFetched] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const handleChange = useCallback((field: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }))
  }, [])

  const loadPrices = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = forceRefresh ? await marketApi.refresh() : await marketApi.getPrices()
      setLiveUsd(data.usdRial)
      setLocalSettings(prev => ({
        ...prev,
        goldPricePerGram: data.gold18kRial,
        silverPricePerGram: data.silverRial
      }))
      dispatch(updateCurrencyRates({ USD: data.usdRial }))
      setAutoFetched(true)
      return true
    } catch (error: any) {
      console.error('Market fetch failed:', error)
      setFetchError(error.message)
      setAutoFetched(true)
      return false
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    loadPrices(false)
  }, [])

  const handleManualRefresh = useCallback(async () => {
    const ok = await loadPrices(true)
    if (ok) {
      toast.success(isPersian ? 'قیمت‌ها به‌روز شد' : 'Prices updated')
    } else {
      toast.error(isPersian ? 'خطا در دریافت قیمت' : 'Server fetch failed')
    }
  }, [loadPrices, isPersian])

  const handleSave = useCallback(() => {
    dispatch(updateIslamicSettings(localSettings))
    toast.success(isPersian ? 'تنظیمات ذخیره شد' : 'Settings saved')
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

      <Card className="p-5 space-y-4">
        <h4 className="text-sm font-semibold">{isPersian ? 'سال خمسی' : 'Khums Year'}</h4>
        <FiqhNote>
          {isPersian ? 'سال خمسی از تاریخی شروع می‌شه که اولین درآمد پایدارت رو داشتی.' : 'The Khums year starts from your first stable income.'}
        </FiqhNote>
        <DatePicker
          label={isPersian ? 'تاریخ شروع سال خمسی' : 'Khums Year Start'}
          value={localSettings.khumsYearStart}
          onChange={(e) => handleChange('khumsYearStart', e.target.value)}
          placeholder={isPersian ? 'انتخاب تاریخ' : 'Select date'}
        />
      </Card>

      <Card className="p-5 space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <FiTrendingUp size={14} className="text-amber-600" />
          {isPersian ? 'نرخ طلا و نقره' : 'Gold & Silver'}
        </h4>

        {autoFetched && !fetchError && liveUsd && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-700">
            <FiDownloadCloud size={14} />
            <span>{isPersian ? 'قیمت‌های لحظه‌ای لود شد' : 'Live prices loaded'}</span>
          </div>
        )}

        {autoFetched && fetchError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <span>{isPersian ? `دریافت خودکار ناموفق (${fetchError}).` : `Auto-fetch failed (${fetchError}).`}</span>
          </div>
        )}

        <CurrencyInput label={isPersian ? 'قیمت هر گرم طلا' : 'Gold Price/g'} value={localSettings.goldPricePerGram} onChange={(e: any) => handleChange('goldPricePerGram', e.target.value)} currency="IRR" />
        <CurrencyInput label={isPersian ? 'قیمت هر گرم نقره' : 'Silver Price/g'} value={localSettings.silverPricePerGram} onChange={(e: any) => handleChange('silverPricePerGram', e.target.value)} currency="IRR" />

        {liveUsd && (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg text-xs text-gray-600">
            <FiDollarSign size={12} />
            <span>{isPersian ? `دلار: ${formatNumber(liveUsd, true)} ریال` : `USD: ${formatNumber(liveUsd, false)} IRR`}</span>
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-3">
        <h4 className="text-sm font-semibold">{isPersian ? 'گزینه‌های نمایش' : 'Display Options'}</h4>
        {[
          { key: 'showKhumsWidget', labelFa: 'نمایش ویجت خمس', labelEn: 'Show Khums widget' },
          { key: 'showZakatWidget', labelFa: 'نمایش ویجت زکات', labelEn: 'Show Zakat widget' },
          { key: 'warnOnInterest', labelFa: 'هشدار ربا', labelEn: 'Interest warning' }
        ].map(opt => (
          <label key={opt.key} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">{isPersian ? opt.labelFa : opt.labelEn}</span>
            <input
              type="checkbox"
              checked={(localSettings as any)[opt.key]}
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