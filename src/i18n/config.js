import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import fa from './locales/fa.json'
import en from './locales/en.json'

// ✅ تنظیم direction و lang روی HTML
const updateDocumentLang = (lng) => {
  const language = lng || 'fa'
  const isRTL = language === 'fa' || language.startsWith('fa')
  
  // ✅ فقط روی html تنظیم می‌کنیم (نه body)
  document.documentElement.setAttribute('lang', language)
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  
  // ✅ تنظیم فونت بر اساس زبان
  if (isRTL) {
    document.documentElement.style.fontFamily = "'Vazirmatn', 'Inter', system-ui, sans-serif"
  } else {
    document.documentElement.style.fontFamily = "'Inter', -apple-system, system-ui, sans-serif"
  }
  
  // ✅ لاگ برای debug
  console.log('🌐 Language:', language, '→', isRTL ? 'RTL' : 'LTR')
}

// ✅ راه‌اندازی i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: { translation: fa },
      en: { translation: en }
    },
    fallbackLng: 'fa',
    supportedLngs: ['fa', 'en'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smart-planner-language'
    },
    load: 'languageOnly',
    returnEmptyString: false,
    debug: false
  })

// ✅ اعمال اولیه
updateDocumentLang(i18n.language)

// ✅ اعمال هنگام تغییر زبان
i18n.on('languageChanged', (lng) => {
  updateDocumentLang(lng)
})

// ✅ توابع کمکی
export const getCurrentLanguage = () => i18n.language || 'fa'

export const isRTL = () => {
  const lang = i18n.language || 'fa'
  return lang === 'fa' || lang.startsWith('fa')
}

export const changeLanguage = async (lng) => {
  await i18n.changeLanguage(lng)
  updateDocumentLang(lng)
  return lng
}

export default i18n