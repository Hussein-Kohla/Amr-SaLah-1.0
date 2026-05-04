import { useTranslation } from 'react-i18next'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
}

const reviews = [
  {
    id: 1,
    nameAr: 'أحمد محمود',
    nameEn: 'Ahmed Mahmoud',
    textAr: 'أفضل حلاق جربته بصراحة، اهتمام بالتفاصيل ونظافة لا يعلى عليها. المكان مريح جداً والمعاملة راقية.',
    textEn: 'Best barber I have ever tried. Attention to detail and top-notch cleanliness. The place is very comfortable.',
    rating: 5,
  },
  {
    id: 2,
    nameAr: 'خالد عبد الله',
    nameEn: 'Khaled Abdallah',
    textAr: 'شغل احترافي جداً والأسعار ممتازة مقابل الجودة اللي بتاخدها. أنصح الجميع بتجربة صالون عمرو صالح.',
    textEn: 'Very professional work and excellent prices for the quality you get. I highly recommend Amr SaLah salon.',
    rating: 5,
  },
  {
    id: 3,
    nameAr: 'محمد سمير',
    nameEn: 'Mohamed Samir',
    textAr: 'الخدمة ممتازة والمكان راقي، حلاقة الشعر والدقن مظبوطة بالملي زي ما طلبت بالظبط. شكراً ليكم.',
    textEn: 'Excellent service and an elegant place. Hair and beard trim exactly as I asked. Thank you.',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 ${i < rating ? 'text-accent' : 'text-white/20'}`}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review, index, isRTL }: { review: any; index: number; isRTL: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="bg-surface/5 border border-white/5 p-8 rounded-2xl hover:border-accent/30 transition-colors duration-300 relative group"
    >
      <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary px-2 text-accent/20 group-hover:text-accent/40 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      <StarRating rating={review.rating} />
      
      <p className={`text-white/80 leading-relaxed mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        "{isRTL ? review.textAr : review.textEn}"
      </p>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg border border-accent/30">
          {(isRTL ? review.nameAr : review.nameEn).charAt(0)}
        </div>
        <div>
          <h4 className={`text-white font-bold ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? review.nameAr : review.nameEn}
          </h4>
          <p className={`text-surface/50 text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'عميل' : 'Customer'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewsSection() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const titleRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section id="reviews" className="py-24 px-4 bg-[#0f0f1a] relative overflow-hidden"
      aria-label={isRTL ? 'آراء العملاء' : 'Customer Reviews'}>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={isTitleInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <p className={`text-accent text-sm tracking-[0.25em] uppercase mb-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'ماذا يقولون عنا' : 'What they say about us'}
          </p>
          <h2 className={`text-4xl sm:text-5xl font-bold text-white mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'آراء العملاء' : 'Customer Reviews'}
          </h2>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent w-24 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} isRTL={isRTL} />
          ))}
        </div>
      </div>
    </section>
  )
}
