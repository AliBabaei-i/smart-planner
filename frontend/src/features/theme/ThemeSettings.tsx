import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { FiSun, FiMoon, FiMonitor, FiCheck, FiRefreshCw } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import {
  PRIMARY_PRESETS,
  resetTheme,
  selectPrimaryColor,
  selectThemeMode,
  setPrimaryColor,
  setThemeMode,
  type PrimaryColorId,
  type ThemeMode,
} from './themeSlice'

// ═══════════════════════════════════════════════
// ✅ ThemeEffects: اعمال زنده تم و رنگ‌ها روی DOM
// باید یک بار در App.jsx یا Layout رندر شود.
// ═══════════════════════════════════════════════
export function ThemeEffects() {
  const mode = useSelector(selectThemeMode)
  const primaryColor = useSelector(selectPrimaryColor)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyMode = () => {
      const isDark = mode === 'dark' || (mode === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
      root.dataset.theme = isDark ? 'dark' : 'light'
      root.style.colorScheme = isDark ? 'dark' : 'light'
    }

    applyMode()
    if (mode !== 'system') return
    media.addEventListener('change', applyMode)
    return () => media.removeEventListener('change', applyMode)
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    const preset = PRIMARY_PRESETS[primaryColor] || PRIMARY_PRESETS.blue
    Object.entries(preset.shades).forEach(([shade, rgb]) => {
      root.style.setProperty(`--primary-${shade}`, rgb)
    })
  }, [primaryColor])

  return null
}

// ═══════════════════════════════════════════════
// ✅ ThemeSettings: رابط کاربری تنظیمات ظاهر
// ═══════════════════════════════════════════════
export default function ThemeSettings() {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch()

  const mode = useSelector(selectThemeMode)
  const primaryColor = useSelector(selectPrimaryColor)

  // لیست حالت‌های نمایش
  const MODES: { id: ThemeMode; icon: any; labelFa: string; labelEn: string }[] = [
    { id: 'light', icon: FiSun, labelFa: 'روشن', labelEn: 'Light' },
    { id: 'dark', icon: FiMoon, labelFa: 'تاریک', labelEn: 'Dark' },
    { id: 'system', icon: FiMonitor, labelFa: 'سیستم', labelEn: 'System' },
  ]

  // لیست رنگ‌های موجود از themeSlice
  const COLOR_IDS = Object.keys(PRIMARY_PRESETS) as PrimaryColorId[]

  return (
    <Card className="p-6 space-y-8">
      {/* هدر */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isPersian ? 'ظاهر برنامه' : 'Appearance'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isPersian ? 'حالت نمایش و رنگ اصلی را انتخاب کنید' : 'Choose display mode and primary color'}
        </p>
      </div>

      {/* حالت نمایش */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {isPersian ? 'حالت نمایش' : 'Display Mode'}
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map((item) => {
            const Icon = item.icon
            const isActive = mode === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => dispatch(setThemeMode(item.id))}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">
                  {isPersian ? item.labelFa : item.labelEn}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* رنگ اصلی */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {isPersian ? 'رنگ اصلی' : 'Primary Color'}
        </h4>
        <div className="flex flex-wrap gap-4">
          {COLOR_IDS.map((colorId) => {
            const preset = PRIMARY_PRESETS[colorId]
            const isActive = primaryColor === colorId

            return (
              <button
                key={colorId}
                type="button"
                title={colorId}
                onClick={() => dispatch(setPrimaryColor(colorId))}
                className={`relative h-12 w-12 rounded-full border-2 transition-all hover:scale-110 ${
                  isActive
                    ? 'border-gray-900 ring-2 ring-primary-500 ring-offset-2 dark:border-white dark:ring-offset-gray-900'
                    : 'border-white shadow-sm dark:border-gray-800'
                }`}
                style={{ backgroundColor: `rgb(${preset.shades[500]})` }}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <FiCheck size={20} strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {isPersian ? 'پیش‌نمایش دکمه' : 'Button Preview'}
          </span>
          <button className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors">
            {isPersian ? 'دکمه نمونه' : 'Sample Button'}
          </button>
        </div>
        <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-2 w-2/3 rounded-full bg-primary-500" />
        </div>
      </div>

      {/* بازنشانی */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => dispatch(resetTheme())}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-300 transition-colors"
        >
          <FiRefreshCw size={14} />
          {isPersian ? 'بازنشانی به حالت پیش‌فرض' : 'Reset to default'}
        </button>
      </div>
    </Card>
  )
}