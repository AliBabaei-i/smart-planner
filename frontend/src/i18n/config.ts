import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import fa from './locales/fa.json'
import en from './locales/en.json'

const STORAGE_KEY = 'smart-planner-language'

const savedLang = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
})()

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: { translation: fa },
      en: { translation: en },
    },
    lng: savedLang || 'fa',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

const applyDirection = (lang: string) => {
  const isPersian = lang === 'fa' || lang.startsWith('fa')
  document.documentElement.setAttribute('lang', isPersian ? 'fa' : 'en')
  document.documentElement.setAttribute('dir', isPersian ? 'rtl' : 'ltr')
  console.log(`🌐 Language: ${lang} → ${isPersian ? 'RTL' : 'LTR'}`)
}

applyDirection(i18n.language || 'fa')
i18n.on('languageChanged', applyDirection)

// ═══════════════════════════════════════════════
// ✅ Helper export — استفاده در LanguageSwitcher و هر جای دیگر
// جهت و localStorage به‌صورت خودکار توسط i18next مدیریت می‌شود.
// ═══════════════════════════════════════════════
export const changeLanguage = async (lng: string): Promise<string> => {
  const normalized = lng?.startsWith('en') ? 'en' : 'fa'
  await i18n.changeLanguage(normalized)
  return normalized
}

export default i18n