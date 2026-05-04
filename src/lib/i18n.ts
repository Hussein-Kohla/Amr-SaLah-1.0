import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import arTranslations from '../locales/ar.json'
import enTranslations from '../locales/en.json'

const LANG_STORAGE_KEY = 'barberpro-lang'

// Read persisted language, default to Arabic
const savedLang = localStorage.getItem(LANG_STORAGE_KEY) ?? 'ar'

const resources = {
  ar: arTranslations,
  en: enTranslations,
}

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

// Apply direction + font to document whenever language changes
i18n.on('languageChanged', (lng) => {
  const isArabic = lng === 'ar'
  document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', lng)
  document.body.className = isArabic ? 'font-arabic' : 'font-english'
  localStorage.setItem(LANG_STORAGE_KEY, lng)
})

export default i18n
export { LANG_STORAGE_KEY }
