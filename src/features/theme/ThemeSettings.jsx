import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { 
  FiSun, 
  FiMoon, 
  FiMonitor, 
  FiRefreshCw,
  FiSliders,
  FiEye,
  FiZap
} from 'react-icons/fi'
import { setTheme, updateSettings, resetTheme } from './themeSlice'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const ThemeSettings = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { mode, settings } = useSelector(state => state.theme)

  const themeOptions = [
    { nameKey: 'theme.auto', value: 'auto', Icon: FiMonitor },
    { nameKey: 'theme.light', value: 'light', Icon: FiSun },
    { nameKey: 'theme.dark', value: 'dark', Icon: FiMoon }
  ]

  const accessibilityOptions = [
    {
      key: 'reducedMotion',
      labelKey: 'theme.reducedMotion',
      descKey: 'theme.reducedMotionDesc',
      Icon: FiZap
    },
    {
      key: 'highContrast',
      labelKey: 'theme.highContrast',
      descKey: 'theme.highContrastDesc',
      Icon: FiEye
    },
    {
      key: 'largeText',
      labelKey: 'theme.largeText',
      descKey: 'theme.largeTextDesc',
      Icon: FiSliders
    }
  ]

  const handleToggleSetting = (key, value) => {
    dispatch(updateSettings({ [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* انتخاب تم */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <FiSun size={20} className="text-blue-600 flex-shrink-0" />
          <span>{t('theme.title')}</span>
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(theme => {
            const IconComponent = theme.Icon
            const isActive = mode === theme.value
            
            return (
              <button
                key={theme.value}
                onClick={() => dispatch(setTheme(theme.value))}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <IconComponent 
                    size={24} 
                    className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} 
                  />
                </div>
                <div className={`font-medium text-sm ${
                  isActive 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t(theme.nameKey)}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* تنظیمات دسترسی */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <FiSliders size={20} className="text-purple-600 flex-shrink-0" />
          <span>{t('theme.accessibility')}</span>
        </h3>
        
        <div className="space-y-4">
          {accessibilityOptions.map(setting => {
            const isEnabled = settings[setting.key] || false
            const IconComponent = setting.Icon
            
            return (
              <div 
                key={setting.key} 
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {t(setting.labelKey)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t(setting.descKey)}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handleToggleSetting(setting.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isEnabled ? 'peer-checked:bg-blue-600' : ''}`}></div>
                </label>
              </div>
            )
          })}
        </div>
      </Card>

      {/* بازنشانی */}
      <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
        <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200 flex items-center gap-2">
          <FiRefreshCw size={20} />
          <span>{t('theme.reset')}</span>
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          {t('theme.resetDesc')}
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm(t('theme.reset') + '?')) {
              dispatch(resetTheme())
            }
          }}
        >
          <FiRefreshCw size={14} />
          <span>{t('theme.resetButton')}</span>
        </Button>
      </Card>
    </div>
  )
}

export default ThemeSettings