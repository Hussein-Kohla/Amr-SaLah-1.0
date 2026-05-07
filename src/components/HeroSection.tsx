import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'
import BookNowButton from './BookNowButton'

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
}

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: 'easeOut' as const } },
}

const lineVariant: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.5 } },
}

export default function HeroSection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-15%'])

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      aria-label={t('hero.label')}
    >
      <motion.div
        className="absolute inset-0 w-[110%] h-[130%] -left-[5%] -top-[15%] bg-center bg-cover bg-no-repeat blur-sm will-change-transform"
        style={{ backgroundImage: 'url(/hero-bg.png)', y: bgY }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary" />

      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.p
            variants={fadeInVariant}
            className={`text-accent text-sm tracking-[0.3em] uppercase mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}
          >
            {t('hero.label')}
          </motion.p>

          <motion.h1
            variants={fadeUpVariant}
            className={`text-6xl sm:text-7xl md:text-8xl font-bold text-[#E8DECB] leading-tight mb-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${isRTL ? 'font-arabic' : 'font-english'}`}
          >
            {t('hero.titleMain')}
            <span className="text-accent drop-shadow-[0_0_15px_rgba(179,136,39,0.5)]">{t('hero.titleAccent')}</span>
          </motion.h1>

          <motion.div
            variants={lineVariant}
            className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent w-64 mx-auto my-6 origin-center"
          />

          <motion.p
            variants={fadeUpVariant}
            className={`text-surface/80 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed ${isRTL ? 'font-arabic' : 'font-english'}`}
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div variants={fadeUpVariant}>
            <BookNowButton size="large" />
          </motion.div>

          <motion.div
            variants={fadeInVariant}
            className="mt-16 flex flex-col items-center gap-2 opacity-50"
          >
            <span className={`text-surface/60 text-xs tracking-widest ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {t('hero.scrollHint')}
            </span>
            <motion.div
              className="w-[1px] h-8 bg-accent/60"
              animate={{ scaleY: [1, 0.3, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
