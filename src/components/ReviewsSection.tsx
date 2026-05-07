import { useTranslation } from 'react-i18next'
import {
  motion,
  useInView,
  type Variants,
  AnimatePresence,
} from 'framer-motion'

import { useRef, useState, useEffect } from 'react'

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}

const reviews = [
  { id: 1, nameAr: 'أحمد محمود', nameEn: 'Ahmed Mahmoud', textAr: 'أفضل حلاق جربته بصراحة، اهتمام بالتفاصيل ونظافة لا يعلى عليها. المكان مريح جداً والمعاملة راقية.', textEn: 'Best barber I have ever tried. Attention to detail and top-notch cleanliness. The place is very comfortable.', rating: 5 },
  { id: 2, nameAr: 'خالد عبد الله', nameEn: 'Khaled Abdallah', textAr: 'شغل احترافي جداً والأسعار ممتازة مقابل الجودة اللي بتاخدها. أنصح الجميع بتجربة صالون عمرو صلاح.', textEn: 'Very professional work and excellent prices for the quality you get. I highly recommend Amr Salah salon.', rating: 5 },
  { id: 3, nameAr: 'محمد سمير', nameEn: 'Mohamed Samir', textAr: 'الخدمة ممتازة والمكان راقي، حلاقة الشعر والدقن مظبوطة بالملي زي ما طلبت بالظبط. شكراً ليكم.', textEn: 'Excellent service and an elegant place. Hair and beard trim exactly as I asked. Thank you.', rating: 5 },
  { id: 4, nameAr: 'يوسف علي', nameEn: 'Youssef Ali', textAr: 'دقة في المواعيد واستقبال محترم جداً، تجربة ممتازة تستحق تكرار الزيارة.', textEn: 'Precise appointments and very respectful reception, excellent experience worth repeating.', rating: 5 },
  { id: 5, nameAr: 'عمر خطاب', nameEn: 'Omar Khattab', textAr: 'المكان شيك جداً والتعامل راقي، والنتيجة دايماً بتبسطني في كل مرة.', textEn: 'The place is very stylish and the treatment is classy, the result always makes me happy every time.', rating: 5 },
  { id: 6, nameAr: 'مصطفى كمال', nameEn: 'Mustafa Kamal', textAr: 'الحلاقين هنا فنانين مش مجرد حلاقين، بجد تسلم إيديهم على الشغل العالي ده.', textEn: 'The barbers here are artists, not just barbers. Well done on this high-end work.', rating: 5 },
  { id: 7, nameAr: 'حسن إبراهيم', nameEn: 'Hassan Ibrahim', textAr: 'أنصح أي حد عايز حلاقة نظيفة وتجربة مريحة يروح لعمرو صلاح من غير تفكير.', textEn: 'I advise anyone who wants a clean haircut and a comfortable experience to go to Amr Salah without hesitation.', rating: 5 },
  { id: 8, nameAr: 'محمود عادل', nameEn: 'Mahmoud Adel', textAr: 'اهتمام كبير بالتعقيم والنظافة، وده أهم حاجة بالنسبة لي بجانب احترافية الحلاقة.', textEn: 'Great attention to sterilization and cleanliness, which is the most important thing for me alongside professionalism.', rating: 5 },
  { id: 9, nameAr: 'علي زين', nameEn: 'Ali Zain', textAr: 'حلاقة الذقن بالموس هنا حكاية تانية خالص، احتراف بجد في تحديد أدق التفاصيل.', textEn: 'Shaving the beard with a razor here is a whole other story, real professionalism in defining the finest details.', rating: 5 },
  { id: 10, nameAr: 'إبراهيم فوزي', nameEn: 'Ibrahim Fawzy', textAr: 'تجربة 5 نجوم من أول ما تدخل لحد ما تخرج، ذوق في المعاملة وشغل فوق الخيال.', textEn: '5-star experience from the moment you enter until you leave. Tasteful treatment and work beyond imagination.', rating: 5 },
  { id: 11, nameAr: 'كريم منصور', nameEn: 'Karim Mansour', textAr: 'من أحسن الأماكن اللي زرتها، الاهتمام بالعميل واضح من أول لحظة.', textEn: 'One of the best places I have visited, care for the client is clear from the very first moment.', rating: 5 },
  { id: 12, nameAr: 'طارق سعيد', nameEn: 'Tarek Saeed', textAr: 'الشغل هنا بيتكلم عن نفسه، كل مرة بخرج وأنا راضي جداً عن النتيجة.', textEn: 'The work here speaks for itself, every time I leave very satisfied with the result.', rating: 5 },
  { id: 13, nameAr: 'رامي جمال', nameEn: 'Rami Gamal', textAr: 'مكان محترم بجد وأسعاره معقولة جداً مقارنة بالخدمة الممتازة اللي بتاخدها.', textEn: 'A truly respectable place with very reasonable prices compared to the excellent service you receive.', rating: 5 },
  { id: 14, nameAr: 'سامي وليد', nameEn: 'Sami Walid', textAr: 'الديكور شيك والجو مريح، وفوق ده كله الحلاقة بتطلع تحفة في كل مرة.', textEn: 'The decor is stylish and the atmosphere is comfortable, and on top of it all the haircut is perfect every time.', rating: 5 },
  { id: 15, nameAr: 'فارس حسام', nameEn: 'Fares Hossam', textAr: 'أول مرة أزور المكان ده ومش هتبقى الأخيرة، تجربة استثنائية من كل النواحي.', textEn: 'First time visiting this place and it will not be the last, an exceptional experience in every way possible.', rating: 5 },
  { id: 16, nameAr: 'زياد نبيل', nameEn: 'Ziad Nabil', textAr: 'الفريق محترف جداً وبيديك اهتمام كامل طول فترة الخدمة، ده مش طبيعي بجد.', textEn: 'The team is very professional and gives you full attention throughout the entire service, truly exceptional.', rating: 5 },
  { id: 17, nameAr: 'باسم رفعت', nameEn: 'Bassem Rafaat', textAr: 'نظافة ممتازة ودقة في الشغل، بيحسسك إنك في مكان راقي فعلاً مش بس شكل.', textEn: 'Excellent cleanliness and precision in work, makes you feel you are in a truly upscale place, not just aesthetically.', rating: 5 },
  { id: 18, nameAr: 'وليد شريف', nameEn: 'Walid Sherif', textAr: 'جربت أماكن كتير بس مكانش فيه زي عمرو صلاح، الفرق واضح من أول زيارة.', textEn: 'I tried many places but none was like Amr Salah, the difference is clear from the very first visit.', rating: 5 },
  { id: 19, nameAr: 'نادر حلمي', nameEn: 'Nader Helmy', textAr: 'خدمة على أعلى مستوى والنتيجة بتفوق التوقعات دايماً، أنصح بيه بشدة.', textEn: 'Service at the highest level and the result always exceeds expectations, highly and strongly recommended.', rating: 5 },
  { id: 20, nameAr: 'عادل فريد', nameEn: 'Adel Farid', textAr: 'من زمان بدور على حلاق يفهم اللي أنا عايزه بالظبط، ولقيته هنا أخيراً.', textEn: 'I have been looking for a barber who understands exactly what I want for a long time, and I finally found it here.', rating: 5 },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-1.5 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < rating ? '#D4AF37' : 'none'}
          stroke={i < rating ? '#D4AF37' : 'rgba(255,255,255,0.2)'}
          className="w-5 h-5 drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  isRTL,
  active,
}: {
  review: any
  isRTL: boolean
  active: boolean
}) {
  return (
    <div
      className={`
        relative
        w-[320px]
        sm:w-[450px]
        h-[450px]
        sm:h-[400px]
        rounded-[2.5rem]
        border
        transition-all
        duration-700
        ease-out
        ${
          active
            ? 'bg-white/[0.08] border-white/20 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] scale-100 opacity-100'
            : 'bg-white/[0.02] border-white/5 opacity-20 scale-75 blur-[2px] pointer-events-none'
        }
        p-10
        overflow-hidden
      `}
    >
      {/* Decorative Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`} />

      {/* Quote */}
      <div className="absolute top-6 left-8 text-accent/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <StarRating rating={review.rating} />

        <p className={`text-white text-xl sm:text-2xl leading-relaxed text-center mt-4 italic font-medium flex-grow flex items-center ${isRTL ? 'font-arabic' : 'font-english'}`}>
          "{isRTL ? review.textAr : review.textEn}"
        </p>

        <div className="mt-auto flex flex-col items-center pt-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40 flex items-center justify-center text-accent font-bold text-2xl shadow-[0_0_30px_rgba(201,168,76,0.3)]">
            {(isRTL ? review.nameAr : review.nameEn).charAt(0)}
          </div>

          <h3 className={`text-white font-bold text-xl mt-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? review.nameAr : review.nameEn}
          </h3>

          <span className="text-accent/60 text-[10px] tracking-[0.3em] uppercase mt-1 font-bold">
            VERIFIED CUSTOMER
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ReviewsSection() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const titleRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, {
    once: true,
    margin: '-100px',
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward (enters from right), -1 = backward (enters from left)

  // Next: card enters from the right side (positive x), exits to left (negative x)
  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  // Prev: card enters from the left side (negative x), exits to right (positive x)
  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 4000)
    return () => clearInterval(timer)
  }, [currentIndex])

  return (
    <section id="reviews" className="relative py-32 overflow-hidden bg-[#090910]">
      {/* Background Decor */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.05),transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          ref={titleRef}
          variants={titleVariants}
          initial="hidden"
          animate={isTitleInView ? 'visible' : 'hidden'}
          className="text-center mb-24"
        >
          <span className="text-accent tracking-[0.4em] uppercase text-xs border border-accent/20 px-5 py-2 rounded-full bg-accent/5 mb-6 inline-block">
            {isRTL ? 'آراء العملاء' : 'Testimonials'}
          </span>
          <h2 className={`text-white text-5xl sm:text-7xl font-bold ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'ماذا يقول عملاؤنا' : 'What Clients Say'}
          </h2>
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="relative w-full h-[600px] sm:h-[500px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                // Enter from the right on next (+x), from the left on prev (-x)
                // Exit to the left on next (-x), to the right on prev (+x)
                initial={{ opacity: 0, x: direction * 1000 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -1000 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="z-20 relative"
              >
                <ReviewCard review={reviews[currentIndex]} isRTL={isRTL} active={true} />
              </motion.div>
            </AnimatePresence>

            {/* Side ghost cards */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-10 opacity-10 hidden lg:flex">
              <div className="blur-sm scale-75 -translate-x-20">
                <ReviewCard review={reviews[(currentIndex - 1 + reviews.length) % reviews.length]} isRTL={isRTL} active={false} />
              </div>
              <div className="blur-sm scale-75 translate-x-20">
                <ReviewCard review={reviews[(currentIndex + 1) % reviews.length]} isRTL={isRTL} active={false} />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div
            className="flex flex-row items-center justify-center gap-10 mt-10"
            dir="ltr"
            style={{ direction: 'ltr' }}
          >
            {/* LEFT arrow → go to previous card */}
            <button
              type="button"
              onClick={isRTL ? prevSlide : nextSlide}
              className="order-1 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all duration-500 shadow-xl group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="order-2 flex gap-3">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1)
                    setCurrentIndex(i)
                  }}
                  className={`relative h-2 rounded-full transition-all duration-500 overflow-hidden ${
                    currentIndex === i
                      ? 'w-12 bg-white/10'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                >
                  {currentIndex === i && (
                    <motion.div
                      key={currentIndex}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4, ease: 'linear' }}
                      className="absolute inset-0 bg-accent"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* RIGHT arrow → go to next card */}
            <button
              type="button"
              onClick={isRTL ? nextSlide : prevSlide}
              className="order-3 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white hover:bg-accent hover:text-black transition-all duration-500 shadow-xl group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
