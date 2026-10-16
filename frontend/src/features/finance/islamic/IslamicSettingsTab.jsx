import React, { useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSettings, FiSave, FiRefreshCw
} from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DatePicker from '../../../components/ui/DatePicker'
import CurrencyInput from '../CurrencyInput'
import FiqhNote from './FiqhNote'
import { updateIslamicSettings } from '../financeSlice'
import { formatNumber, parseFormattedNumber } from '../currencyHelpers'

// ✅ API قیمت طلا (بدون API Key)
const fetchGoldPrice = async () => {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU')
    if (!response.ok) throw new Error('Failed to fetch gold price')
    const data = await response.json()
    return data.price / 31.1034768 // تبدیل اونس به گرم
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
    return data.price / 31.1034768
  } catch (error) {
    console.error('Silver price fetch error:', error)
    return null
  }
}

const IslamicSettingsTab = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

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

  const handleFetchGoldPrice = useCallback(async () => {
    setFetchingGold(true)
    try {
      const priceUSD = await fetchGoldPrice()
      if (priceUSD) {
        const usdRate = currencySettings.rates?.USD || 600000
        const priceIRR = Math.round(priceUSD * usdRate)
        handleChange('goldPricePerGram', priceIRR)
        toast.success(
          isPersian
            ? `قیمت طلا: ${formatNumber(priceIRR, true)} ریال/گرم`
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
            : `Silver: $${priceUSD.toFixed(2)}/g`,
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
            ? 'سال خمسی از تاریخی شروع می‌شه که اولین درآمد پایدارت رو داشتی. مثلاً اگه اولین حقوقت رو اول فروردین گرفتی، سال خمسی‌ات از همون تاریخ شروع می‌شه.'
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
            <Button onClick={handleFetchGoldPrice} loading={fetchingGold} size="small" variant="secondary">
              <FiRefreshCw size={12} />
              <span>{isPersian ? 'قیمت طلا' : 'Gold'}</span>
            </Button>
            <Button onClick={handleFetchSilverPrice} loading={fetchingSilver} size="small" variant="secondary">
              <FiRefreshCw size={12} />
              <span>{isPersian ? 'قیمت نقره' : 'Silver'}</span>
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isPersian
            ? 'نرخ لحظه‌ای از بازار جهانی دریافت می‌شه و با نرخ دلار شما تبدیل می‌شه. می‌تونی دستی هم وارد کنی.'
            : 'Live rates from global market, converted with your USD rate.'}
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