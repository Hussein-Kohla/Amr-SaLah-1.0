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

function ReviewCard({ review, isRTL }: { review: any; isRTL: boolean }) {
  return (
    <div className="w-[140px] sm:w-[320px] flex-shrink-0 group mx-2 sm:mx-4">
      <div className="bg-white/[0.03] border border-white/5 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] backdrop-blur-md hover:border-accent/30 transition-all duration-300 relative">
        <div className="absolute top-2 right-3 text-accent/5 sm:top-4 sm:right-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[30px] sm:h-[30px]">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        <div className="flex gap-0.5 mb-2 sm:mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-2 h-2 sm:w-3 sm:h-3 ${i < review.rating ? 'text-accent' : 'text-white/10'}`}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        
        <p className={`text-white/80 text-[10px] sm:text-base leading-snug sm:leading-relaxed mb-4 sm:mb-6 line-clamp-4 min-h-[3rem] sm:min-h-[5rem] ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}>
          {isRTL ? review.textAr : review.textEn}
        </p>
        
        <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-[10px] sm:text-sm border border-accent/20">
            {(isRTL ? review.nameAr : review.nameEn).charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className={`text-white font-bold text-[10px] sm:text-sm truncate ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? review.nameAr : review.nameEn}
            </h4>
            <p className="text-accent/30 text-[7px] sm:text-[9px] tracking-widest uppercase truncate">
              {isRTL ? 'عميل' : 'Client'}
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

  const duplicatedReviews = [...reviews, ...reviews, ...reviews] // Triple for better flow

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-[#0f0f1a] relative overflow-hidden"
      aria-label={isRTL ? 'آراء العملاء' : 'Customer Reviews'}>
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-10 sm:mb-16 px-4">
          <p className={`text-accent text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-2 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'ماذا يقولون عنا' : 'Voices of Excellence'}
          </p>
          <h2 className={`text-3xl sm:text-5xl font-bold text-white mb-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'آراء العملاء' : 'Customer Reviews'}
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent w-20 mx-auto" />
        </div>

        <div className="relative flex overflow-hidden py-6 sm:py-10 mask-fade-edges min-h-[160px] sm:min-h-[300px]">
          <div 
            className="flex w-max marquee-content"
            style={{ 
              animation: `marquee 45s linear infinite`,
            }}
          >
            {duplicatedReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} isRTL={isRTL} />
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .marquee-content {
          display: flex;
          will-change: transform;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(${isRTL ? '33.3333%' : '-33.3333%'}); }
        }
        /* Ensure the starting position for RTL is correct so it can move positive without blanking */
        [dir="rtl"] .marquee-content {
          transform: translateX(-33.3333%);
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(-33.3333%); }
          100% { transform: translateX(0); }
        }
        [dir="rtl"] .marquee-content {
          animation: marquee-rtl 45s linear infinite !important;
        }
      `}} />
    </section>
  )
}
