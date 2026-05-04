import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Doc } from '../../convex/_generated/dataModel'

interface BarberSelectorProps {
  barbers: Doc<'barbers'>[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function BarberSelector({ barbers, selectedId, onSelect }: BarberSelectorProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
      <div className="flex gap-4 min-w-max px-1">
        {barbers.map((barber, idx) => {
          const isSelected = barber._id === selectedId

          return (
            <motion.button
              key={barber._id}
              id={`barber-btn-${barber._id}`}
              onClick={() => onSelect(barber._id)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-2xl border
                transition-colors duration-200 cursor-pointer select-none min-w-[90px]
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-white/10 bg-white/5 hover:border-accent/30 hover:bg-white/8'}
              `}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              aria-label={isRTL ? barber.nameAr : barber.nameEn}
              aria-pressed={isSelected}
            >
              {/* Photo */}
              <div className={`relative w-14 h-14 rounded-full overflow-hidden
                ring-2 transition-all duration-200
                ${isSelected ? 'ring-accent' : 'ring-white/10'}`}
              >
                <img
                  src={barber.photoUrl}
                  alt={isRTL ? barber.nameAr : barber.nameEn}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Name */}
              <span className={`text-xs font-medium text-center leading-tight
                ${isSelected ? 'text-accent' : 'text-surface/70'}
                ${isRTL ? 'font-arabic' : 'font-english'}`}
              >
                {isRTL ? barber.nameAr : barber.nameEn}
              </span>

              {/* Selected ring glow */}
              {isSelected && (
                <motion.div
                  layoutId="barber-indicator"
                  className="absolute inset-0 rounded-2xl border-2 border-accent/60"
                  style={{ boxShadow: '0 0 12px rgba(201,168,76,0.25)' }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
