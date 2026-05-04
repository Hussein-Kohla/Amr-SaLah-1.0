import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface Slot {
  time: string
  status: 'available' | 'booked' | 'blocked' | 'outside'
}

interface SlotGridProps {
  slots: Slot[] | undefined
  onSlotClick: (time: string) => void
  selectedTime?: string | null
}

function SlotSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  )
}

export default function SlotGrid({ slots, onSlotClick, selectedTime }: SlotGridProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (slots === undefined) return <SlotSkeleton />

  if (slots.length === 0) {
    return (
      <div className="text-center py-10 text-surface/40">
        <p className={isRTL ? 'font-arabic' : 'font-english'}>
          {isRTL ? 'لا توجد مواعيد متاحة' : 'No slots available'}
        </p>
      </div>
    )
  }

  const regularSlots = slots.filter(s => !s.time.startsWith('Waiting'))
  const waitingSlots = slots.filter(s => s.time.startsWith('Waiting'))

  const renderSlot = (slot: Slot, idx: number) => {
    const isAvailable = slot.status === 'available'
    const isBooked = slot.status === 'booked' || slot.status === 'blocked'
    const isSelected = slot.time === selectedTime
    const isWaiting = slot.time.startsWith('Waiting')

    return (
      <motion.button
        key={slot.time}
        id={`slot-btn-${slot.time.replace(':', '-')}`}
        onClick={() => isAvailable && onSlotClick(slot.time)}
        disabled={!isAvailable}
        className={`
          relative h-14 rounded-2xl text-base font-semibold transition-all duration-200
          flex items-center justify-center gap-2 font-english px-4
          ${isAvailable && !isSelected && !isWaiting
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-400/50 cursor-pointer'
            : ''}
          ${isAvailable && !isSelected && isWaiting
            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:border-amber-400/50 cursor-pointer'
            : ''}
          ${isSelected
            ? 'bg-accent border-2 border-accent text-primary font-bold cursor-pointer shadow-[0_0_15px_rgba(201,168,76,0.3)]'
            : ''}
          ${isBooked
            ? 'bg-red-500/10 border border-red-500/20 text-red-400/60 cursor-not-allowed'
            : ''}
        `}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ delay: idx * 0.02, duration: 0.25 }}
        whileHover={isAvailable ? { scale: 1.05 } : {}}
        whileTap={isAvailable ? { scale: 0.95 } : {}}
        aria-label={`${slot.time} - ${slot.status}`}
        aria-disabled={!isAvailable}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isSelected ? 'bg-primary' :
          isAvailable 
            ? (isWaiting ? 'bg-amber-400' : 'bg-emerald-400')
            : 'bg-red-400/60'
        }`} />
        {(() => {
          if (isRTL) {
            return isWaiting 
              ? slot.time.replace('Waiting', 'انتظار')
              : slot.time.replace(' AM', '').replace(' PM', '')
          }
          return slot.time
        })()}
        {isBooked && (
          <span className={`absolute -bottom-0.5 inset-x-0 text-center text-[9px] text-red-400/60 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'محجوز' : 'Booked'}
          </span>
        )}
      </motion.button>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {regularSlots.map((slot, idx) => renderSlot(slot, idx))}
        </AnimatePresence>
      </div>

      {waitingSlots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <h3 className={`text-amber-500/80 text-[10px] font-bold uppercase tracking-[0.2em] ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? 'قائمة الانتظار' : 'Waiting List'}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/20 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {waitingSlots.map((slot, idx) => renderSlot(slot, idx + 10))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
