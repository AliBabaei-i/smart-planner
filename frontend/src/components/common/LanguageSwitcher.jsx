import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiGlobe, FiCheck } from 'react-icons/fi'
import { changeLanguage } from '../../i18n/config'

const LANGUAGES = [
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang =
    LANGUAGES.find(
      (l) => i18n.language === l.code || i18n.language?.startsWith(l.code)
    ) || LANGUAGES[0]

  const handleChange = async (code) => {
    await changeLanguage(code)
    setIsOpen(false)
  }

  const isLangActive = (code) =>
    i18n.language === code || i18n.language?.startsWith(code)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        title={currentLang.name}
      >
        <FiGlobe size={18} className="flex-shrink-0" />
        <span className="text-sm font-medium hidden sm:inline-block min-w-[28px] text-center">
          {currentLang.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute end-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
            {LANGUAGES.map((lang) => {
              const isActive = isLangActive(lang.code)
              return (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg flex-shrink-0">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  {isActive && (
                    <FiCheck
                      size={16}
                      className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher