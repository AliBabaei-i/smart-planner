import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiCheck, FiGlobe, FiInfo } from 'react-icons/fi'
import { changeLanguage } from '../../i18n/config'
import Card from '../../components/ui/Card'

const LanguageSettings = () => {
  const { t, i18n } = useTranslation()

  const languages = [
    { 
      code: 'fa', 
      name: 'فارسی', 
      nativeName: 'فارسی',
      flag: '🇮🇷',
      dir: 'rtl',
      description: t('settings.language.persianDesc')
    },
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      dir: 'ltr',
      description: t('settings.language.englishDesc')
    }
  ]

  const handleChangeLanguage = async (code) => {
    await changeLanguage(code)
  }

  const currentLang = i18n.language
  const isRTL = currentLang === 'fa' || currentLang?.startsWith('fa')

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <FiGlobe size={20} className="text-blue-600 flex-shrink-0" />
        <span>{t('settings.language.title')}</span>
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {t('settings.language.description')}
      </p>

      {/* ✅ لیست زبان‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map(lang => {
          const isActive = currentLang === lang.code || currentLang?.startsWith(lang.code)
          
          return (
            <button
              key={lang.code}
              onClick={() => handleChangeLanguage(lang.code)}
              className={`
                flex items-center justify-between gap-4
                p-4 rounded-xl border-2 transition-all
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
            >
              {/* سمت چپ: پرچم + اطلاعات */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-3xl flex-shrink-0 leading-none">
                  {lang.flag}
                </div>
                <div className="text-start flex-1 min-w-0">
                  <div className={`font-semibold text-base ${
                    isActive 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {lang.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {lang.description}
                  </div>
                </div>
              </div>
              
              {/* سمت راست: چک */}
              <div className="flex-shrink-0">
                {isActive && (
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <FiCheck size={16} className="text-white" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ✅ پیش‌نمایش */}
      <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <FiInfo size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('settings.language.preview')}:
          </div>
        </div>
        
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          {t('settings.language.previewText')}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600">
          <span className="font-medium">
            {t('settings.language.direction')}:
          </span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            isRTL 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
          }`}>
            {isRTL ? 'RTL (→ ←)' : 'LTR (← →)'}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default LanguageSettings