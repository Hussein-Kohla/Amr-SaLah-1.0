import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface BookNowButtonProps {
  size?: 'default' | 'large'
  className?: string
}

export default function BookNowButton({ size = 'default', className = '' }: BookNowButtonProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleClick = () => {
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    navigate(`/booking?date=${today}`)
  }

  const sizeClasses = size === 'large' ? 'px-10 py-4 text-lg' : 'px-8 py-3 text-base'

  return (
    <motion.button
      id="book-now-cta-btn"
      onClick={handleClick}
      className={`
        relative overflow-hidden ${sizeClasses}
        bg-accent text-primary font-bold rounded-full
        ${isRTL ? 'font-arabic' : 'font-english'}
        cursor-pointer select-none ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      aria-label={t('common.bookNow')}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-accent"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />
      <span className="relative z-10">{t('common.bookNow')}</span>
    </motion.button>
  )
}
