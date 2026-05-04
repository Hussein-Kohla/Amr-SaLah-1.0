import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (val) => {
      setScrolled(val > 40)
    })
    return unsubscribe
  }, [scrollY])

  const toggleLanguage = () => {
    // i18n.ts languageChanged listener handles dir/font/localStorage
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')
  }

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 transition-shadow duration-300"
      style={{ boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.5)' : 'none' }}
    >
      <motion.div
        className="absolute inset-0 bg-primary"
        style={{ opacity: bgOpacity }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-2 no-underline"
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          aria-label="BarberPro Home"
        >
          <img src="/logo2.jpg" alt="Amr SaLah Logo" className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-accent/20 hover:border-accent transition-colors" />
        </motion.a>

        {/* Language toggle */}
        <motion.button
          id="lang-toggle-btn"
          onClick={toggleLanguage}
          className="relative flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40
                     text-accent text-sm font-medium hover:border-accent hover:bg-accent/10
                     transition-all duration-200 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          aria-label={isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <span className="text-base">{isRTL ? '🇬🇧' : '🇸🇦'}</span>
          <span className={isRTL ? 'font-english' : 'font-arabic'}>
            {t('nav.langToggle')}
          </span>
        </motion.button>
      </div>
    </motion.header>
  )
}
