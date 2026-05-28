import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import Navbar from '../components/Navbar'
import DateStrip from '../components/DateStrip'
import BarberSelector from '../components/BarberSelector'
import SlotGrid from '../components/SlotGrid'
import BookingModal from '../components/BookingModal'
import MyBookingsModal from '../components/MyBookingsModal'
import { usePWA } from '../hooks/usePWA'

export default function BookingPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { installPWA, isStandalone } = usePWA()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // T-52: Load initial state from localStorage if available
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('barberpro_selected_date')
    return searchParams.get('date') ?? saved ?? todayStr
  })
  const [selectedBarberId, setSelectedBarberId] = useState<Id<'barbers'> | null>(() => {
    return (localStorage.getItem('barberpro_selected_barber_id') as Id<'barbers'>) ?? null
  })
  const [selectedTime, setSelectedTime] = useState<string | null>(() => {
    return localStorage.getItem('barberpro_selected_time') ?? null
  })
  const [isModalOpen, setIsModalOpen] = useState(() => {
    // Re-open modal if we have a saved time on refresh
    return !!localStorage.getItem('barberpro_selected_time')
  })
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false)

  const barbers = useQuery(api.barbers.getBarbers)
  
  const availableBarbers = barbers?.filter((b: any) => {
    if (b.startDate && selectedDate < b.startDate) return false;
    if (b.endDate && selectedDate > b.endDate) return false;
    
    if (!b.availableDays || b.availableDays.length === 0) return true;
    const [year, month, day] = selectedDate.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return b.availableDays.includes(dateObj.getDay());
  })

  const slots = useQuery(
    api.appointments.getSlots,
    selectedBarberId ? { barberId: selectedBarberId, date: selectedDate } : 'skip'
  )

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('barberpro_selected_date', selectedDate)
    // Update URL without full refresh to stay in sync
    const params = new URLSearchParams(window.location.search)
    params.set('date', selectedDate)
    window.history.replaceState(null, '', `?${params.toString()}`)
  }, [selectedDate])

  useEffect(() => {
    if (selectedBarberId) {
      localStorage.setItem('barberpro_selected_barber_id', selectedBarberId)
    }
  }, [selectedBarberId])

  useEffect(() => {
    if (selectedTime) {
      localStorage.setItem('barberpro_selected_time', selectedTime)
    } else {
      localStorage.removeItem('barberpro_selected_time')
    }
  }, [selectedTime])

  useEffect(() => {
    if (availableBarbers && availableBarbers.length > 0) {
      const isValid = availableBarbers.some((b: any) => b._id === selectedBarberId)
      if (!isValid && (!selectedBarberId || barbers?.some((b:any) => b._id === selectedBarberId))) {
        setSelectedBarberId(availableBarbers[0]._id)
        setSelectedTime(null)
      }
    }
  }, [availableBarbers, selectedBarberId, barbers])

  const handleDateChange = (date: string) => { 
    setSelectedDate(date)
    setSelectedTime(null) 
  }
  const handleBarberChange = (id: string) => { 
    setSelectedBarberId(id as Id<'barbers'>)
    setSelectedTime(null) 
  }
  const handleSlotClick = (time: string) => { 
    setSelectedTime(time)
    setIsModalOpen(true) 
  }

  const selectedBarber = barbers?.find((b: { _id: string }) => b._id === selectedBarberId)

  return (
    <div className="min-h-screen bg-primary text-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="pt-12 pb-6 px-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 text-surface/40 hover:text-accent transition-colors text-sm cursor-pointer ${isRTL ? 'font-arabic flex-row-reverse' : 'font-english'}`}
              aria-label={t('common.back')}
            >
              <span className={isRTL ? 'rotate-180 inline-block' : 'inline-block'}>←</span>
              {t('common.back')}
            </button>

            <div className="flex items-center gap-2">
              {/* PWA Install Button */}
              {!isStandalone && (
                <motion.button
                  onClick={() => installPWA(isRTL)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10
                             text-white/60 text-xs font-medium hover:text-white hover:bg-white/5
                             transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>📱</span>
                  <span className={isRTL ? 'font-arabic' : 'font-english'}>
                    {isRTL ? 'إضافة' : 'Add App'}
                  </span>
                </motion.button>
              )}

              {/* Language toggle (Matches Navbar style) */}
              <motion.button
                onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/40
                           text-accent text-xs font-medium hover:border-accent hover:bg-accent/10
                           transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm">{isRTL ? '🇬🇧' : '🇪🇬'}</span>
                <span className={isRTL ? 'font-english uppercase' : 'font-arabic'}>
                  {isRTL ? 'EN' : 'العربية'}
                </span>
              </motion.button>

              {/* My Bookings Button */}
              <motion.button
                onClick={() => setIsMyBookingsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/40
                           text-accent text-xs font-medium hover:bg-accent hover:text-primary
                           transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📅</span>
                <span className={isRTL ? 'font-arabic' : 'font-english'}>
                  {isRTL ? 'حجوزاتي' : 'My Bookings'}
                </span>
              </motion.button>
            </div>
          </div>
          <h1 className={`text-3xl font-bold text-white mb-1 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('booking.pageTitle')}
          </h1>
          <p className={`text-surface/40 text-sm ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('booking.pageSubtitle')}
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Step 1 */}
        <section aria-label={t('booking.step1')}>
          <h2 className={`text-xs font-semibold tracking-widest text-accent/70 uppercase mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('booking.step1')}
          </h2>
          <DateStrip selectedDate={selectedDate} onSelectDate={handleDateChange} />
        </section>

        {/* Step 2 */}
        <section aria-label={t('booking.step2')}>
          <h2 className={`text-xs font-semibold tracking-widest text-accent/70 uppercase mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {t('booking.step2')}
          </h2>
          {availableBarbers === undefined ? (
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                  <div className="w-16 h-3 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <BarberSelector barbers={availableBarbers} selectedId={selectedBarberId} onSelect={handleBarberChange} />
          )}
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Step 3 */}
        <section aria-label={t('booking.step3')}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xs font-semibold tracking-widest text-accent/70 uppercase ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {t('booking.step3')}
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-surface/40">
              <span className="flex items-center gap-1 font-english">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {t('booking.available')}
              </span>
              <span className="flex items-center gap-1 font-english">
                <span className="w-2 h-2 rounded-full bg-red-400/60 inline-block" />
                {t('booking.booked')}
              </span>
              <span className="flex items-center gap-1 font-english">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                {isRTL ? 'مغلق' : 'Blocked'}
              </span>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedBarberId}-${selectedDate}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SlotGrid slots={slots} onSlotClick={handleSlotClick} selectedTime={selectedTime} />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {selectedBarber && selectedTime && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedTime(null) }}
          barberId={selectedBarber._id}
          barberNameAr={selectedBarber.nameAr}
          barberNameEn={selectedBarber.nameEn}
          date={selectedDate}
          timeSlot={selectedTime}
          onConfirmed={() => {}}
        />
      )}

      <MyBookingsModal 
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
      />
    </div>
  )
}
