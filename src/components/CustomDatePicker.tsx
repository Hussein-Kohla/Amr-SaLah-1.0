import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface CustomDatePickerProps {
  selectedDate: string
  onSelect: (date: string) => void
  onClose: () => void
  isRTL: boolean
}

export default function CustomDatePicker({ selectedDate, onSelect, onClose, isRTL }: CustomDatePickerProps) {
  const { i18n } = useTranslation()
  const [viewDate, setViewDate] = useState(new Date(selectedDate))
  const [tempDate, setTempDate] = useState(new Date(selectedDate))

  const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const daysAr = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
  const daysEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const yr = viewDate.getFullYear()
  const mo = viewDate.getMonth()

  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const firstDay = new Date(yr, mo, 1).getDay()

  const handlePrevMonth = () => setViewDate(new Date(yr, mo - 1, 1))
  const handleNextMonth = () => setViewDate(new Date(yr, mo + 1, 1))

  const formatDate = (date: Date) => {
    const days = isRTL 
      ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = days[date.getDay()]
    const dayNum = date.getDate()
    const monthName = (isRTL ? monthsAr : monthsEn)[date.getMonth()]
    return isRTL ? `${dayName}، ${dayNum} ${monthName}` : `${dayName}, ${monthName} ${dayNum}`
  }

  const handleDayClick = (day: number) => {
    setTempDate(new Date(yr, mo, day))
  }

  const handleConfirm = () => {
    const y = tempDate.getFullYear()
    const m = String(tempDate.getMonth() + 1).padStart(2, '0')
    const d = String(tempDate.getDate()).padStart(2, '0')
    onSelect(`${y}-${m}-${d}`)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2rem] overflow-hidden w-full max-w-[320px] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#6750A4] p-5 text-white">
          <div className={`text-[10px] font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'اختيار التاريخ' : 'SELECT DATE'}
          </div>
          <div className={`text-2xl font-bold flex items-center justify-between ${isRTL ? 'flex-row-reverse font-arabic' : 'font-english'}`}>
            <span>{formatDate(tempDate)}</span>
            <button className="opacity-60 hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-4 bg-white text-black">
          {/* Month Nav */}
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-[#1C1B1F]">{(isRTL ? monthsAr : monthsEn)[mo]} {yr}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#49454F]"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={handlePrevMonth} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {(isRTL ? daysAr : daysEn).map(d => (
              <div key={d} className="text-center text-[11px] text-[#49454F] font-medium py-2">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected = tempDate.getFullYear() === yr && tempDate.getMonth() === mo && tempDate.getDate() === day
              const isToday = new Date().getFullYear() === yr && new Date().getMonth() === mo && new Date().getDate() === day

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`w-9 h-9 rounded-full text-sm flex items-center justify-center transition-all relative
                    ${isSelected ? 'bg-[#6750A4] text-white font-bold' : 'text-[#1C1B1F] hover:bg-black/5'}
                  `}
                >
                  {day}
                  {isToday && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#6750A4]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 flex gap-4 bg-white border-t border-black/5 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
          <button onClick={onClose} className="text-[#6750A4] font-bold text-sm px-4 py-2 hover:bg-[#6750A4]/5 rounded-lg transition-colors">
            {isRTL ? 'إلغاء' : 'CANCEL'}
          </button>
          <button onClick={handleConfirm} className="text-[#6750A4] font-bold text-sm px-4 py-2 hover:bg-[#6750A4]/5 rounded-lg transition-colors">
            {isRTL ? 'حسناً' : 'OK'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
