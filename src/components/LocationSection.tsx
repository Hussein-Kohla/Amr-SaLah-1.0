import { useTranslation } from 'react-i18next'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

const slideVariant = (dir: 'left' | 'right'): Variants => ({
  hidden: { opacity: 0, x: dir === 'left' ? -50 : 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
})

const workingHoursKeys = [
  { dayKey: 'location.days.allWeek', hours: '1:00 PM – 1:00 AM' },
]

export default function LocationSection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="location" className="py-24 px-4 bg-primary relative overflow-hidden"
      aria-label={t('location.sectionTitle')}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute -bottom-32 start-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <p className={`text-accent text-sm tracking-[0.25em] uppercase mb-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('location.sectionLabel')}
          </p>
          <h2 className={`text-4xl sm:text-5xl font-bold text-white mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('location.sectionTitle')}
          </h2>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent w-24 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div
            variants={slideVariant('left')}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="rounded-2xl overflow-hidden border border-white/10 h-72 lg:h-96"
          >
            <iframe
              title={t('location.sectionTitle')}
              src="https://maps.google.com/maps?q=سوبر%20ماركت%20دكان%20الحي%2C%20بني%20سويف%2C%20مصر&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          <motion.div
            variants={slideVariant('right')}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex flex-col gap-5"
          >
            {/* Address */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">📍</span>
                <div>
                  <h3 className={`text-white font-semibold mb-1 ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('location.address')}</h3>
                  <p className={`text-surface/60 text-sm leading-relaxed ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('location.addressValue')}</p>
                </div>
              </div>
            </div>
            {/* Phone */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">📞</span>
                <div>
                  <h3 className={`text-white font-semibold mb-1 ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('location.phone')}</h3>
                  <a href="tel:+201000823374" className="text-accent font-english text-sm hover:underline" dir="ltr">010 00823374</a>
                </div>
              </div>
            </div>
            {/* Hours */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl mt-1">🕐</span>
                <div className="flex-1">
                  <h3 className={`text-white font-semibold mb-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>{t('location.hours')}</h3>
                  <div className="space-y-2">
                    {workingHoursKeys.map((wh) => (
                      <div key={wh.dayKey} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className={`text-surface/60 text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>{t(wh.dayKey)}</span>
                        <span className="text-accent text-sm font-english">
                          {isRTL ? wh.hours.replace(/PM/g, 'الظهر').replace(/AM/g, 'ليل') : wh.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
