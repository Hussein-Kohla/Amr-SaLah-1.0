import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useEffect, useState } from 'react'

interface DateStripProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

function getNext7Days(lang: string, serverTimeMs?: number) {
  const days = []
  const now = serverTimeMs ? new Date(serverTimeMs) : new Date()
  const isAR = lang === 'ar'
  
  for (let i = 0; i < 7; i++) {
    const targetMs = now.getTime() + (i * 24 * 60 * 60 * 1000);
    const d = new Date(targetMs);
    
    const locale = isAR ? 'ar-EG-u-nu-latn' : 'en-US'
    
    // Get MM/DD/YYYY in Cairo timezone
    const cairoDateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
    
    const [month, day, year] = cairoDateStr.split('/');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayName = new Intl.DateTimeFormat(locale, { timeZone: 'Africa/Cairo', weekday: 'short' }).format(d);
    const dayNum = parseInt(day, 10);
    const monthName = new Intl.DateTimeFormat(locale, { timeZone: 'Africa/Cairo', month: 'short' }).format(d);
    
    days.push({
      dateStr,
      dayName,
      dayNum,
      monthName,
    })
  }
  return days
}

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const serverTime = useQuery(api.appointments.getServerTime)
  const days = getNext7Days(i18n.language, serverTime ?? undefined)
  const today = days[0].dateStr

  // Automatically select today's date if selectedDate is not in the list (e.g. if it was a past date from before the fix)
  useEffect(() => {
    if (days.length > 0 && !days.find(d => d.dateStr === selectedDate)) {
      onSelectDate(today)
    }
  }, [days, selectedDate, onSelectDate, today])

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
