import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface DateStripProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

function getNext7Days(lang: string) {
  const days = []
  const today = new Date()
  const isAR = lang === 'ar'
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    
    // We use 'ar-EG' to get Arabic names, but we might need to handle the digits manually
    // or use the 'u-nu-latn' extension to force Latin (Western) digits.
    const locale = isAR ? 'ar-EG-u-nu-latn' : 'en-US'
    
    days.push({
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayName: d.toLocaleDateString(locale, { weekday: 'short' }),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString(locale, { month: 'short' }),
    })
  }
  return days
}

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const days = getNext7Days(i18n.language)
  const today = days[0].dateStr

  return (
    <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
      <div className="flex gap-3 min-w-max px-1">
        {days.map((day, idx) => {
          const isSelected = day.dateStr === selectedDate
          const isToday = day.dateStr === today
          return (
            <motion.button
              key={day.dateStr}
              id={`date-btn-${day.dateStr}`}
              onClick={() => onSelectDate(day.dateStr)}
              className={`
                relative flex flex-col items-center justify-center
                w-16 h-20 rounded-2xl border transition-colors duration-200
                ${isSelected
                  ? 'bg-accent border-accent text-primary'
                  : 'bg-white/5 border-white/10 text-surface/70 hover:border-accent/40 hover:bg-white/10'}
                cursor-pointer select-none
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              aria-label={day.dateStr}
              aria-pressed={isSelected}
            >
              {isToday && (
                <span className={`absolute -top-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${isSelected ? 'bg-primary text-accent' : 'bg-accent text-primary'}
                  ${isRTL ? 'font-arabic' : 'font-english'}`}
                >
                  {t('booking.today')}
                </span>
              )}
              <span className={`text-[11px] font-medium mb-1 ${isRTL ? 'font-arabic' : 'font-english'}`}>{day.dayName}</span>
              <span className={`text-2xl font-bold leading-none font-english ${isSelected ? 'text-primary' : 'text-white'}`}>
                {day.dayNum}
              </span>
              <span className={`text-[10px] mt-1 opacity-70 ${isRTL ? 'font-arabic' : 'font-english'}`}>{day.monthName}</span>
              {isSelected && (
                <motion.div layoutId="date-indicator" className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
