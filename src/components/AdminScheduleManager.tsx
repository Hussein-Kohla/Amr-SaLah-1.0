import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useTranslation } from 'react-i18next'
import type { Id } from '../../convex/_generated/dataModel'
import CustomDatePicker from './CustomDatePicker'

interface AdminScheduleManagerProps {
  selectedDate: string | null
  onDateChange: (date: string) => void
  isRTL: boolean
  onSnack: (type: 'success' | 'error', title: string, message: string) => void
}

export default function AdminScheduleManager({ selectedDate, onDateChange, isRTL, onSnack }: AdminScheduleManagerProps) {
  const { t } = useTranslation()
  const barbers = useQuery(api.barbers.getBarbers)
  const [selectedBarberId, setSelectedBarberId] = useState<Id<'barbers'> | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{ type: 'day' | 'slot'; barberId: Id<'barbers'>; slot?: string } | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const blocks = useQuery(api.blocks.getBlocks, selectedDate && selectedBarberId ? { date: selectedDate, barberId: selectedBarberId } : 'skip')
  const toggleBlock = useMutation(api.blocks.toggleBlock)
  const slots = useQuery(api.appointments.getSlots, selectedDate && selectedBarberId ? { date: selectedDate, barberId: selectedBarberId } : 'skip')

  const handleToggle = async (type: 'day' | 'slot', slot?: string) => {
    if (!selectedBarberId || !selectedDate) return

    const isCurrentlyBlocked = type === 'day' 
      ? blocks?.some(b => !b.timeSlot)
      : blocks?.some(b => b.timeSlot === slot)

    if (!isCurrentlyBlocked) {
      setConfirmTarget({ type, barberId: selectedBarberId, slot })
    } else {
      await doToggle(type, slot)
    }
  }

  const doToggle = async (type: 'day' | 'slot', slot?: string) => {
    if (!selectedBarberId || !selectedDate) return
    try {
      const res = await toggleBlock({
        barberId: selectedBarberId,
        date: selectedDate,
        timeSlot: type === 'slot' ? slot : undefined
      })
      onSnack(
        res.action === 'blocked' ? 'error' : 'success',
        isRTL ? (res.action === 'blocked' ? 'تم الإغلاق' : 'تم الإتاحة') : (res.action === 'blocked' ? 'Blocked' : 'Available'),
        isRTL ? 'تم تحديث الجدول الزمني بنجاح' : 'Schedule updated successfully'
      )
    } catch (e) {
      onSnack('error', 'Error', 'Failed to update schedule')
    }
    setConfirmTarget(null)
  }

  if (!selectedDate) return null

  const isDayBlocked = blocks?.some(b => !b.timeSlot)

  return (
    <div className="bg-[#16161f] border border-white/10 rounded-3xl p-5 w-full sm:w-72 mt-6 mx-auto lg:mx-0 shadow-2xl relative">
      <h3 className={`text-white font-bold text-sm mb-5 flex items-center gap-2 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        <span className="text-accent text-xl">🛡️</span>
        {isRTL ? 'إدارة المواعيد' : 'Schedule Guard'}
      </h3>

      <div className="space-y-4">
        {/* Custom Date Selector Trigger */}
        <div 
          onClick={() => setIsDatePickerOpen(true)}
          className="bg-white/5 rounded-2xl p-3 border border-white/5 group hover:border-accent/30 transition-all cursor-pointer"
        >
          <div className={`text-[10px] text-white/30 uppercase font-black tracking-wider mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'تغيير اليوم' : 'Change Date'}
          </div>
          <div className={`flex items-center justify-between text-white text-xs font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className={isRTL ? 'font-arabic' : 'font-english'}>{selectedDate}</span>
            <span className="text-accent/60">📅</span>
          </div>
        </div>

        <AnimatePresence>
          {isDatePickerOpen && (
            <CustomDatePicker 
              selectedDate={selectedDate}
              isRTL={isRTL}
              onSelect={onDateChange}
              onClose={() => setIsDatePickerOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Barber Select */}
        <div>
          <label className={`block text-white/40 text-[10px] uppercase font-black tracking-widest mb-2 ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}>
            {isRTL ? 'اختر الحلاق' : 'Select Barber'}
          </label>
          <div className="relative group">
            <select
              value={selectedBarberId || ''}
              onChange={(e) => setSelectedBarberId(e.target.value as Id<'barbers'> || null)}
              className={`w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none cursor-pointer ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-[#1a1a2e]">{isRTL ? '-- اختر حلاق --' : '-- Select --'}</option>
              {barbers?.map(b => (
                <option key={b._id} value={b._id} className="bg-[#1a1a2e]">{isRTL ? b.nameAr : b.nameEn}</option>
              ))}
            </select>
            <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-accent/40 ${isRTL ? 'left-4' : 'right-4'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 4 3 3 3-3"/></svg>
            </div>
          </div>
        </div>

        {selectedBarberId && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pt-2">
            {/* Block Whole Day */}
            <button
              onClick={() => handleToggle('day')}
              className={`w-full py-3 rounded-2xl border font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg
                ${isDayBlocked 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
            >
              <span className="text-lg">{isDayBlocked ? '🔓' : '🚫'}</span>
              {isDayBlocked ? (isRTL ? 'فتح اليوم كاملاً' : 'Unlock Day') : (isRTL ? 'إغلاق اليوم كاملاً' : 'Block Day')}
            </button>

            {/* Individual Slots */}
            {!isDayBlocked && (
              <div className="space-y-3">
                <label className={`block text-white/40 text-[10px] uppercase font-black tracking-widest mb-2 ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}>
                  {isRTL ? 'إغلاق ساعة معينة' : 'Individual Slots'}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar scroll-smooth">
                  {slots?.map(s => {
                    const isSlotBlocked = blocks?.some(b => b.timeSlot === s.time)
                    const isWaiting = s.time.startsWith('Waiting')
                    const isBooked = s.status === 'booked' || s.status === 'confirmed' || s.status === 'pending'
                    
                    return (
                      <button
                        key={s.time}
                        onClick={() => handleToggle('slot', s.time)}
                        disabled={isBooked}
                        className={`relative py-3 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1
                          ${isSlotBlocked 
                            ? 'bg-red-600/20 border-red-600/40 text-red-400 shadow-inner' 
                            : isBooked
                              ? 'bg-red-500/5 border-white/5 text-white/20 cursor-not-allowed opacity-50'
                              : isWaiting
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
                      >
                        <span className="truncate w-full px-1">
                          {isRTL ? (isWaiting ? s.time.replace('Waiting', 'انتظار') : s.time.replace(' AM','').replace(' PM','')) : s.time}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isSlotBlocked ? 'bg-red-500' :
                          isBooked ? 'bg-white/10' :
                          isWaiting ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        {isSlotBlocked && <span className="absolute top-1 right-1 text-[8px]">✕</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Inner Confirm Dialog - HIGHER Z-INDEX */}
      <AnimatePresence>
        {confirmTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="bg-[#0f0f1a] border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">⚠️</div>
              <h4 className={`text-white font-black text-xl mb-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                {isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}
              </h4>
              <p className={`text-white/50 text-sm leading-relaxed mb-8 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                {confirmTarget.type === 'day' 
                  ? (isRTL ? 'سيتم إيقاف جميع الحجوزات لهذا اليوم. هذا الإجراء سيمنع العملاء من اختيار أي ساعة.' : 'This will block all appointments for this day. Customers won\'t be able to book any slot.')
                  : (isRTL ? `سيتم إغلاق موعد ${confirmTarget.slot} ومنعه من الظهور للعملاء.` : `This will block the ${confirmTarget.slot} slot and hide it from customers.`)}
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmTarget(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all border border-white/10">
                  {isRTL ? 'تراجع' : 'Cancel'}
                </button>
                <button onClick={() => doToggle(confirmTarget.type, confirmTarget.slot)}
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-600/20">
                  {isRTL ? 'نعم، إغلاق' : 'Yes, Block'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
