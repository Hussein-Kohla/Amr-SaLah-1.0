import { useTranslation } from 'react-i18next'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { useRef } from 'react'

const heroItems = [
  { key: 'img1', src: '/Gallery/1.jpg' },
  { key: 'gal7', src: '/Gallery/gal-7.jpg' },
] as const

/** مواضع ثابتة — 3×6 بدون فراغات في آخر السكشن */
const masonryItems = [
  { key: 'gal1', src: '/Gallery/gal-1.jpeg', col: '1 / span 2', row: '1 / span 2' },
  { key: 'gal2', src: '/Gallery/gal-2.jpeg', col: '3 / span 1', row: '1 / span 1' },
  { key: 'gal3', src: '/Gallery/gal-3.jpeg', col: '3 / span 1', row: '2 / span 1' },
  { key: 'gal4', src: '/Gallery/gal-4.jpeg', col: '1 / span 1', row: '3 / span 2' },
  { key: 'gal5', src: '/Gallery/gal-5.jpeg', col: '2 / span 1', row: '3 / span 1' },
  { key: 'gal6', src: '/Gallery/gal-6.jpeg', col: '3 / span 1', row: '3 / span 1' },
  { key: 'gal8', src: '/Gallery/gal-8.jpg', col: '2 / span 1', row: '4 / span 1' },
  { key: 'gal10', src: '/Gallery/gal-10.jpg', col: '3 / span 1', row: '4 / span 3' },
  { key: 'gal9', src: '/Gallery/gal-9.jpg', col: '1 / span 1', row: '5 / span 1' },
  { key: 'gal11', src: '/Gallery/gal-11.jpg', col: '2 / span 1', row: '5 / span 2' },
  { key: 'img2', src: '/Gallery/2.jpg', col: '1 / span 1', row: '6 / span 1' },
] as const

const MASONRY_GRID_STYLE = {
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(6, minmax(130px, 1fr))',
} as const

const IMG_HOVER =
  'transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100'

const VIEWPORT = { once: false, amount: 0.35, margin: '-4% 0px' as const }

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

const masonryTileVariants: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 32,
    x: i % 2 === 0 ? -16 : 16,
    scale: 0.92,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function GalleryImage({
  src,
  alt,
  eager,
}: {
  src: string
  alt: string
  eager?: boolean
}) {
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover select-none ${IMG_HOVER}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none
          opacity-70 group-hover:opacity-90 transition-opacity duration-300"
        aria-hidden
      />
      <div
        className="absolute inset-0 rounded-[inherit] border border-accent/0 group-hover:border-accent/20
          transition-colors duration-300 pointer-events-none"
        aria-hidden
      />
    </>
  )
}

function HeroTile({
  item,
  index,
  caption,
  reducedMotion,
}: {
  item: (typeof heroItems)[number]
  index: number
  caption: string
  reducedMotion: boolean
}) {
  return (
    <motion.figure
      custom={index}
      variants={heroVariants}
      initial="hidden"
      whileInView="visible"
      viewport={reducedMotion ? { once: true } : VIEWPORT}
      className="group relative h-full min-h-[220px] sm:min-h-[260px] overflow-hidden rounded-2xl md:rounded-3xl
        border border-white/10 bg-[#0a0a14] shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
    >
      <GalleryImage src={item.src} alt={caption} eager />
    </motion.figure>
  )
}

function MasonryTile({
  item,
  index,
  caption,
  reducedMotion,
}: {
  item: (typeof masonryItems)[number]
  index: number
  caption: string
  reducedMotion: boolean
}) {
  return (
    <motion.figure
      custom={index}
      variants={masonryTileVariants}
      initial="hidden"
      whileInView="visible"
      viewport={reducedMotion ? { once: true } : VIEWPORT}
      className="group relative min-h-0 overflow-hidden rounded-xl md:rounded-2xl
        border border-white/10 bg-[#0a0a14] shadow-[0_10px_32px_rgba(0,0,0,0.45)]"
      style={{ gridColumn: item.col, gridRow: item.row }}
    >
      <GalleryImage src={item.src} alt={caption} />
    </motion.figure>
  )
}

export default function GallerySection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const masonryRef = useRef<HTMLDivElement>(null)
  const masonryInView = useInView(masonryRef, { once: false, margin: '-5%', amount: 0.1 })

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-primary relative"
      aria-label={t('gallery.sectionTitle')}
    >
      <motion.div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      />

      <motion.header
        className="relative z-10 text-center mb-8 sm:mb-10 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-5%' }}
        transition={{ duration: 0.5 }}
      >
        <p
          className={`text-accent text-xs sm:text-sm tracking-[0.25em] uppercase mb-2 font-semibold ${isRTL ? 'font-arabic' : 'font-english'}`}
        >
          {t('gallery.sectionLabel')}
        </p>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-white ${isRTL ? 'font-arabic' : 'font-english'}`}
        >
          {t('gallery.sectionTitle')}
        </h2>
      </motion.header>

      <motion.div
        className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-5"
        initial={{ opacity: 0.6 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-4 h-[min(52vh,480px)] min-h-[240px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-8%' }}
          transition={{ duration: 0.5 }}
        >
          {heroItems.map((item, i) => (
            <HeroTile
              key={item.key}
              item={item}
              index={i}
              caption={t(`gallery.captions.${item.key}`)}
              reducedMotion={!!prefersReducedMotion}
            />
          ))}
        </motion.div>

        <motion.div
          ref={masonryRef}
          className="grid gap-3 sm:gap-4 w-full"
          style={{
            ...MASONRY_GRID_STYLE,
            gridTemplateRows: 'repeat(6, minmax(120px, 1fr))',
          }}
          animate={masonryInView ? { opacity: 1 } : { opacity: 0.92 }}
          transition={{ duration: 0.35 }}
        >
          {masonryItems.map((item, index) => (
            <MasonryTile
              key={item.key}
              item={item}
              index={index}
              caption={t(`gallery.captions.${item.key}`)}
              reducedMotion={!!prefersReducedMotion}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
