import { useTranslation } from 'react-i18next'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

const galleryItems = [
  { key: 'cut',      src: '/gallery-1.png', gridClass: 'md:col-span-2 md:row-span-1' },
  { key: 'interior', src: '/gallery-2.png', gridClass: 'md:col-span-1 md:row-span-2' },
  { key: 'tools',    src: '/gallery-3.png', gridClass: 'md:col-span-1 md:row-span-1' },
  { key: 'look',     src: '/gallery-4.png', gridClass: 'md:col-span-1 md:row-span-1' },
] as const

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

function GalleryCard({ item, index }: { item: typeof galleryItems[number]; index: number }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const caption = t(`gallery.captions.${item.key}`)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative overflow-hidden rounded-3xl cursor-pointer ${item.gridClass} min-h-[250px] md:min-h-0 bg-primary/50 border border-white/5`}
    >
      <div className="absolute inset-0 w-full h-full bg-[#0a0a14] z-[-1]" />
      <motion.img
        src={item.src}
        alt={caption}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        loading="lazy"
      />
      {/* Overlay: dark to warm/tinted on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow border on hover */}
      <div className="absolute inset-0 border-2 border-accent/0 group-hover:border-accent/40 rounded-3xl transition-colors duration-500 pointer-events-none" />

      {/* Caption Box */}
      <div className={`absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`h-[2px] bg-accent mb-3 w-12 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100 ${isRTL ? 'origin-right' : 'origin-left'}`} />
        <p className={`text-white font-bold text-lg md:text-xl tracking-wide ${isRTL ? 'font-arabic' : 'font-english'}`}>
          {caption}
        </p>
      </div>
    </motion.div>
  )
}

export default function GallerySection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const titleRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section id="gallery" className="py-24 px-4 bg-primary relative overflow-hidden"
      aria-label={t('gallery.sectionTitle')}>
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={isTitleInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <p className={`text-accent text-sm tracking-[0.25em] uppercase mb-3 font-semibold ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('gallery.sectionLabel')}
          </p>
          <h2 className={`text-4xl sm:text-5xl font-extrabold text-white mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('gallery.sectionTitle')}
          </h2>
          <div className="h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent w-24 mx-auto rounded-full" />
        </motion.div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 md:h-[600px]">
          {galleryItems.map((item, index) => (
            <GalleryCard key={item.key} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
