import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const reviews = [
  { id: 1, nameAr: 'أحمد محمود', nameEn: 'Ahmed Mahmoud', textAr: 'أفضل حلاق جربته بصراحة، اهتمام بالتفاصيل ونظافة لا يعلى عليها. المكان مريح جداً والمعاملة راقية.', textEn: 'Best barber I have ever tried. Attention to detail and top-notch cleanliness.', rating: 5 },
  { id: 2, nameAr: 'خالد عبد الله', nameEn: 'Khaled Abdallah', textAr: 'شغل احترافي جداً والأسعار ممتازة مقابل الجودة اللي بتاخدها. أنصح الجميع بتجربة صالون عمرو صلاح.', textEn: 'Very professional work and excellent prices for the quality you get.', rating: 5 },
  { id: 3, nameAr: 'محمد سمير', nameEn: 'Mohamed Samir', textAr: 'الخدمة ممتازة والمكان راقي، حلاقة الشعر والدقن مظبوطة بالملي زي ما طلبت بالظبط. شكراً ليكم.', textEn: 'Excellent service and an elegant place. Hair and beard trim exactly as I asked.', rating: 5 },
  { id: 4, nameAr: 'يوسف علي', nameEn: 'Youssef Ali', textAr: 'دقة في المواعيد واستقبال محترم جداً، تجربة ممتازة تستحق تكرار الزيارة.', textEn: 'Precise appointments and very respectful reception, excellent experience.', rating: 5 },
  { id: 5, nameAr: 'عمر خطاب', nameEn: 'Omar Khattab', textAr: 'المكان شيك جداً والتعامل راقي، والنتيجة دايماً بتبسطني في كل مرة.', textEn: 'The place is very stylish and the treatment is classy, the result always makes me happy.', rating: 5 },
  { id: 6, nameAr: 'مصطفى كمال', nameEn: 'Mustafa Kamal', textAr: 'الحلاقين هنا فنانين مش مجرد حلاقين، بجد تسلم إيديهم على الشغل العالي ده.', textEn: 'The barbers here are artists, not just barbers. Well done on this high-end work.', rating: 5 },
  { id: 7, nameAr: 'حسن إبراهيم', nameEn: 'Hassan Ibrahim', textAr: 'أنصح أي حد عايز حلاقة نظيفة وتجربة مريحة يروح لعمرو صلاح من غير تفكير.', textEn: 'I advise anyone who wants a clean haircut and a comfortable experience to go to Amr Salah.', rating: 5 },
  { id: 8, nameAr: 'محمود عادل', nameEn: 'Mahmoud Adel', textAr: 'اهتمام كبير بالتعقيم والنظافة، وده أهم حاجة بالنسبة لي بجانب احترافية الحلاقة.', textEn: 'Great attention to sterilization and cleanliness, which is the most important thing for me.', rating: 5 },
  { id: 9, nameAr: 'علي زين', nameEn: 'Ali Zain', textAr: 'حلاقة الذقن بالموس هنا حكاية تانية خالص، احتراف بجد في تحديد أدق التفاصيل.', textEn: 'Shaving the beard with a razor here is a whole other story, real professionalism.', rating: 5 },
  { id: 10, nameAr: 'إبراهيم فوزي', nameEn: 'Ibrahim Fawzy', textAr: 'تجربة 5 نجوم من أول ما تدخل لحد ما تخرج، ذوق في المعاملة وشغل فوق الخيال.', textEn: '5-star experience from the moment you enter until you leave, thank you.', rating: 5 },
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
          className={`w-3 h-3 ${i < rating ? 'text-accent' : 'text-white/10'}`}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review, isRTL, index }: { review: any; isRTL: boolean; index: number }) {
  const angle = (index * 360) / reviews.length
  const radius = 750 // Larger Ring radius

  return (
    <div 
      className="absolute w-[320px] sm:w-[400px] flex-shrink-0 group"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="bg-surface/5 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-xl hover:border-accent/40 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
        <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#0f0f1a] px-3 text-accent/10 group-hover:text-accent/40 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        <StarRating rating={review.rating} />
        
        <p className={`text-white/90 text-lg leading-relaxed mb-8 h-24 line-clamp-3 ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}>
          "{isRTL ? review.textAr : review.textEn}"
        </p>
        
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xl border border-accent/30 shadow-inner">
            {(isRTL ? review.nameAr : review.nameEn).charAt(0)}
          </div>
          <div>
            <h4 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? review.nameAr : review.nameEn}
            </h4>
            <p className={`text-accent/40 text-xs tracking-[0.2em] uppercase ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? 'عميل متميز' : 'Verified Client'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReviewsSection() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <section id="reviews" className="py-40 bg-[#0f0f1a] relative overflow-hidden"
      aria-label={isRTL ? 'آراء العملاء' : 'Customer Reviews'}>
      
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0f0f1a] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-32 px-4">
          <p className={`text-accent text-sm tracking-[0.3em] uppercase mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'ماذا يقولون عنا' : 'Voices of Excellence'}
          </p>
          <h2 className={`text-5xl sm:text-6xl font-bold text-white mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'آراء العملاء' : 'Customer Reviews'}
          </h2>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent w-32 mx-auto" />
        </div>

        {/* 3D Ring Carousel - Larger & Faster */}
        <div className="relative h-[500px] w-full flex items-center justify-center perspective-[3000px]">
          <motion.div 
            className="relative w-[400px] h-full"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{ 
              rotateY: [0, -360] 
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} isRTL={isRTL} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
