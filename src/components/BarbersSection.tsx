import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useTranslation } from 'react-i18next'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'
import type { Doc } from '../../convex/_generated/dataModel'
import { usePWA } from '../hooks/usePWA'

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
}

function BarberCard({ barber, index }: { barber: Doc<'barbers'>; index: number }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const formatTime = (time: string, isRTL: boolean) => {
    try {
      const parts = time.replace(/[^0-9:]/g, '').split(':')
      let hours = Number(parts[0])
      let mins = parts[1] || '00'
      
      let suffix = ''
      if (isRTL) {
        if (hours === 12 || (hours > 12 && hours < 18)) suffix = 'الظهر'
        else if (hours >= 18 && hours < 24) suffix = 'مساءً'
        else suffix = 'ليل'
      } else {
        suffix = hours >= 12 ? 'PM' : 'AM'
      }
      
      const hours12 = hours % 12 || 12
      return `${hours12}:${mins} ${suffix}`
    } catch {
      return time
    }
  }

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="group relative flex flex-col items-center text-center"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`relative w-48 h-48 mb-5 rounded-full overflow-hidden ring-2 transition-all duration-300 ${isInView ? 
        'ring-accent/40' : 'ring-white/10'} group-hover:ring-accent`}>
        <motion.img
          src={barber.photoUrl}
          alt={isRTL ? barber.nameAr : barber.nameEn}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-all duration-300 rounded-full" />
        {barber.isActive && (
          <motion.div
            className="absolute bottom-3 end-3 w-4 h-4 rounded-full bg-emerald-400 border-2 border-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      <h3 className={`text-white font-bold text-xl mb-1 group-hover:text-accent transition-colors duration-300 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        {isRTL ? barber.nameAr : barber.nameEn}
      </h3>
      <p className={`text-surface/40 text-sm mb-3 ${isRTL ? 'font-english' : 'font-arabic'}`}>
        {isRTL ? barber.nameEn : barber.nameAr}
      </p>
      <div className={`flex items-center gap-1.5 text-accent/70 text-sm ${isRTL ? 'font-arabic font-medium' : 'font-english'}`}>
        <span>🕐</span>
        <span dir="auto">{formatTime(barber.workingHours.start, isRTL)} – {formatTime(barber.workingHours.end, isRTL)}</span>
      </div>
      <motion.div
        className="h-[1px] bg-accent rounded-full mt-4"
        animate={isInView ? { width: '3rem', opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
      />
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-48 h-48 rounded-full bg-white/10" />
      <div className="h-5 w-32 bg-white/10 rounded-full" />
      <div className="h-3 w-20 bg-white/5 rounded-full" />
    </div>
  )
}

const fallbackBarbers: any[] = [
  {
    _id: '1',
    nameAr: 'عمرو صالح',
    nameEn: 'Amr Saleh',
    photoUrl: '/barber-1.jpeg',
    workingHours: { start: '13:00', end: '01:00' },
    isActive: true,
  },
  {
    _id: '2',
    nameAr: 'يوسف عمرو',
    nameEn: 'Youssef Amr',
    photoUrl: '/barber-2.jpeg',
    workingHours: { start: '13:00', end: '01:00' },
    isActive: true,
  },
];

export default function BarbersSection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const titleRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, { once: true, margin: '-60px' })
  const barbersQuery = useQuery(api.barbers.getBarbers)
  const barbers = barbersQuery || fallbackBarbers;
  const { installPWA, isStandalone } = usePWA()

  return (
    <section id="team" className="py-24 px-4 bg-gradient-to-b from-primary via-[#1a1a2e] to-[#13131f] relative overflow-hidden"
      aria-label={t('barbers.sectionTitle')}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={isTitleInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <p className={`text-accent text-sm tracking-[0.25em] uppercase mb-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('barbers.sectionLabel')}
          </p>
          <h2 className={`text-4xl sm:text-5xl font-bold text-white mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('barbers.sectionTitle')}
          </h2>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent w-24 mx-auto" />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-16 mb-16">
          {barbers.map((barber: any, index: number) => (
            <BarberCard key={barber._id} barber={barber} index={index} />
          ))}
        </div>

        {/* PWA Install Button (Centred at the bottom) */}
        {!isStandalone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center"
          >
            <button
              onClick={() => installPWA(isRTL)}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-all duration-300 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
              <div className="flex flex-col items-start">
                <span className={`text-white font-bold leading-tight ${isRTL ? 'font-arabic' : 'font-english'}`}>
                  {isRTL ? 'إضافة لتطبيقات الهاتف' : 'Add to phone apps'}
                </span>
                <span className={`text-accent/60 text-xs ${isRTL ? 'font-arabic' : 'font-english'}`}>
                  {isRTL ? 'لسهولة الحجز والمتابعة' : 'For easier booking'}
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
