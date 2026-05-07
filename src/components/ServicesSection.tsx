import { useTranslation } from 'react-i18next'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

interface Service {
  key: 'haircut' | 'beard' | 'facial' | 'royal'
  icon: React.ReactNode
}

const ScissorsIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    {/* Upper blade - curved */}
    <path d="M22 22 L36 5" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 22 Q28 14 36 5" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    {/* Lower blade */}
    <path d="M22 22 L36 39" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 22 Q28 30 36 39" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    {/* Central pivot */}
    <circle cx="22" cy="22" r="2.5" fill="#C9A84C" stroke="white" strokeWidth="0.8"/>
    {/* Upper handle ring */}
    <ellipse cx="12" cy="10" rx="7" ry="5.5" stroke="#C9A84C" strokeWidth="1.8" transform="rotate(-38 12 10)"/>
    <ellipse cx="12" cy="10" rx="3" ry="2" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" transform="rotate(-38 12 10)"/>
    {/* Lower handle ring */}
    <ellipse cx="12" cy="34" rx="7" ry="5.5" stroke="#C9A84C" strokeWidth="1.8" transform="rotate(38 12 34)"/>
    <ellipse cx="12" cy="34" rx="3" ry="2" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" transform="rotate(38 12 34)"/>
    {/* Connecting arms */}
    <line x1="17.5" y1="14" x2="21" y2="21" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="17.5" y1="30" x2="21" y2="23" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Highlight on blade */}
    <line x1="23" y1="21" x2="35" y2="6" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.3"/>
    <line x1="23" y1="23" x2="35" y2="38" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.3"/>
  </svg>
)

const BeardIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    <path
      d="M11 15V22C11 29.5 16 36 22 36C28 36 33 29.5 33 22V15"
      stroke="#C9A84C"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M14 25C14 25 18 21.5 22 24C26 21.5 30 25 30 25C30 25 26 27.5 22 26.5C18 27.5 14 25 14 25Z"
      fill="#C9A84C"
    />
    <path
      d="M17 28C17 28 19 34 22 34C25 34 27 28 27 28C24 30 20 30 17 28Z"
      fill="#C9A84C"
    />
  </svg>
)

const FacialIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    <circle cx="22" cy="22" r="13" stroke="#C9A84C" strokeWidth="2.5" />
    <circle cx="16.5" cy="19.5" r="3.5" stroke="#C9A84C" strokeWidth="2" />
    <circle cx="27.5" cy="19.5" r="3.5" stroke="#C9A84C" strokeWidth="2" />
    <circle cx="16.5" cy="19.5" r="1" fill="#C9A84C" />
    <circle cx="27.5" cy="19.5" r="1" fill="#C9A84C" />
    <path
      d="M19 27C21 29 23 29 25 27"
      stroke="#C9A84C"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M36 8L37 11L40 12L37 13L36 16L35 13L32 12L35 11L36 8Z"
      fill="#C9A84C"
    />
    <path
      d="M9 10L9.5 12L11.5 12.5L9.5 13L9 15L8.5 13L6.5 12.5L8.5 12L9 10Z"
      fill="#C9A84C"
    />
  </svg>
)

const CrownIcon = () => (
  <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    <path
      d="M9 30L9 14L15.5 22L22 8L28.5 22L35 14L35 30H9Z"
      stroke="#C9A84C"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect x="9" y="33" width="26" height="4" rx="1" fill="#C9A84C" />
    <circle cx="22" cy="5" r="2" fill="#C9A84C" />
    <circle cx="9" cy="11" r="2" fill="#C9A84C" />
    <circle cx="35" cy="11" r="2" fill="#C9A84C" />
  </svg>
)


const services: Service[] = [
  { key: 'haircut', icon: <ScissorsIcon /> },
  { key: 'beard',   icon: <BeardIcon /> },
  { key: 'facial',  icon: <FacialIcon /> },
  { key: 'royal',   icon: <CrownIcon /> },
]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="group relative bg-white/[0.03] border border-white/8 rounded-xl p-4 sm:p-7 cursor-default
                 hover:border-accent/30 hover:bg-white/[0.06] transition-all duration-400"
      whileHover={{ y: -3 }}
    >
      {/* Top accent line — grows on hover */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

      {/* Icon container */}
      <div className="mb-4 sm:mb-6 w-10 h-10 sm:w-14 sm:h-14 rounded-lg border border-accent/20 bg-accent/5
                      flex items-center justify-center transition-all duration-300
                      group-hover:border-accent/40 group-hover:bg-accent/10">
        <div className="scale-75 sm:scale-100">
          {service.icon}
        </div>
      </div>

      {/* Divider */}
      <motion.div
        className="h-[1px] w-0 bg-accent/60 rounded-full mb-3 sm:mb-5"
        animate={isInView ? { width: '1.5rem' } : { width: 0 }}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.35 }}
      />

      <h3 className={`text-white font-semibold text-sm sm:text-lg tracking-wide mb-1 sm:mb-2 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        {t(`services.items.${service.key}.name`)}
      </h3>
      <p className={`text-white/40 text-[10px] sm:text-sm leading-relaxed line-clamp-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        {t(`services.items.${service.key}.desc`)}
      </p>

      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 40px rgba(201,168,76,0.04)' }}
      />
    </motion.div>
  )
}

export default function ServicesSection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const titleRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section
      id="services"
      className="py-28 px-4 bg-primary relative overflow-hidden"
      aria-label={t('services.sectionTitle')}
    >
      {/* Background glows */}
      <div className="absolute -top-40 -start-40 w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={isTitleInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <p className={`text-accent text-xs tracking-[0.35em] uppercase mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('services.sectionLabel')}
          </p>
          <h2 className={`text-4xl sm:text-5xl font-bold text-white mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('services.sectionTitle')}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent/60" />
          </div>
        </motion.div>

        {/* Cards grid — 2×2 on mobile and md+ */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {services.map((service, index) => (
            <ServiceCard key={service.key} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
