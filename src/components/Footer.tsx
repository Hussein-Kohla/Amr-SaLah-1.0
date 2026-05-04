import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const socialLinks = [
  { icon: <FacebookIcon />, label: 'Facebook', href: 'https://facebook.com/Umrsalah1' },
  { icon: <WhatsAppIcon />, label: 'WhatsApp', href: 'https://wa.me/201000823374' },
]

const footerLinks = [
  { href: '#services', key: 'footer.links.services' },
  { href: '#team',     key: 'footer.links.team' },
  { href: '#gallery',  key: 'footer.links.gallery' },
  { href: '#location', key: 'footer.links.location' },
]

export default function Footer() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const year = new Date().getFullYear()
  const navigate = useNavigate()

  return (
    <footer id="footer" className="bg-[#0f0f1a] border-t border-white/5 pt-14 pb-8 px-4"
      aria-label={isRTL ? 'تذييل الصفحة' : 'Footer'}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'}`} dir="ltr">
              <span className="text-white font-bold text-xl sm:text-2xl tracking-wide font-english">{t('nav.logo')}</span>
              <img src="/logo.jpg" alt="Amr SaLah Logo" className="w-12 h-12 rounded-full object-cover shadow-md bg-white p-0.5" />
            </div>
            <p className={`text-surface/40 text-sm leading-relaxed max-w-xs ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {t('footer.tagline')}
            </p>
            {/* Hidden admin gear – bottom-right of brand block */}
            <button
              onClick={() => navigate('/admin')}
              title="Admin"
              className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-6 h-6 text-surface/20 hover:text-accent transition-colors cursor-pointer flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
          {/* Links */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h4 className={`text-white font-semibold mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}
                    className={`text-surface/50 hover:text-accent text-sm transition-colors duration-200 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h4 className={`text-white font-semibold mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('footer.contact')}</h4>
            <a href="tel:+201000823374" className={`block text-accent text-sm font-english mb-2 hover:underline ${isRTL ? 'text-right' : 'text-left'}`} dir="ltr">
              010 00823374
            </a>
            <p className={`text-surface/40 text-sm mb-5 ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('footer.city')}</p>
            <div className={`flex items-center gap-3 flex-wrap ${isRTL ? 'justify-start' : 'justify-start'}`}>
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-base
                             hover:border-accent/50 hover:bg-accent/10 transition-all duration-200"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 relative">
          <p className={`text-surface/30 text-xs ${isRTL ? 'font-arabic' : 'font-english'}`}>
            © {year} Amr SaLah. {t('footer.rights')}.
          </p>
          

          <span className="text-surface/20 text-xs font-english">Made with ❤️ for great hair</span>
        </div>
      </div>
    </footer>
  )
}
