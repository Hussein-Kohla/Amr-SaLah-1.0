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
  const adminCreateAppt = useMutation(api.admin.adminCreateAppointment)

  const [adminMode, setAdminMode] = useState<'cancel' | 'manual'>('cancel')
  const [manualBookingTarget, setManualBookingTarget] = useState<string | null>(null)
  const [manualForm, setManualForm] = useState({ name: '', age: '', phone: '', email: '' })
  const [isBooking, setIsBooking] = useState(false)

  const handleToggle = async (type: 'day' | 'slot', slot?: string) => {
    if (!selectedBarberId || !selectedDate) return

    if (adminMode === 'manual' && type === 'slot' && slot) {
      setManualBookingTarget(slot)
      return
    }

    const isCurrentlyBlocked = type === 'day' 
      ? blocks?.some(b => !b.timeSlot)
      : blocks?.some(b => b.timeSlot === slot)

    if (!isCurrentlyBlocked) {
      setConfirmTarget({ type, barberId: selectedBarberId, slot })
    } else {
      await doToggle(type, slot)
    }
  }

  const handleManualBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBarberId || !selectedDate || !manualBookingTarget) return
    setIsBooking(true)
    try {
      await adminCreateAppt({
        barberId: selectedBarberId,
        date: selectedDate,
        timeSlot: manualBookingTarget,
        customerName: manualForm.name.trim(),
        customerAge: Number(manualForm.age),
        customerPhone: manualForm.phone.trim(),
        customerEmail: manualForm.email.trim() || undefined,
      })
      onSnack('success', isRTL ? 'تم الحجز' : 'Booked', isRTL ? 'تم إضافة الحجز اليدوي بنجاح' : 'Manual booking added successfully')
      setManualBookingTarget(null)
      setManualForm({ name: '', age: '', phone: '', email: '' })
    } catch (err) {
      console.error('Manual booking error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      onSnack('error', isRTL ? 'خطأ' : 'Error', isRTL ? `فشل الحجز: ${msg}` : `Booking failed: ${msg}`)
    } finally {
      setIsBooking(false)
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

        {/* Mode Selector */}
        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setAdminMode('cancel')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
              ${adminMode === 'cancel' ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white/60'}`}
          >
            {isRTL ? 'الغاء مواعيد' : 'Cancel Slots'}
          </button>
          <button
            onClick={() => setAdminMode('manual')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
              ${adminMode === 'manual' ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white/60'}`}
          >
            {isRTL ? 'اضيف حجز يدوي' : 'Manual Booking'}
          </button>
        </div>

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
                        disabled={adminMode === 'cancel' && isBooked}
                        className={`relative py-3 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1
                          ${isSlotBlocked 
                            ? 'bg-red-600/20 border-red-600/40 text-red-500 shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]' 
                            : isBooked
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : isWaiting
                                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'}`}
                      >
                        <span className="truncate w-full px-1">
                          {isRTL ? (isWaiting ? s.time.replace('Waiting', 'انتظار') : s.time.replace(' AM','').replace(' PM','')) : s.time}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          isSlotBlocked ? 'bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.8)]' :
                          isBooked ? 'bg-red-400/60' :
                          isWaiting ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                        {isSlotBlocked && (
                          <>
                            <span className="absolute top-1 right-2 text-[8px] font-bold">✕</span>
                            <span className="absolute -bottom-0.5 inset-x-0 text-center text-[7px] font-bold text-red-500 uppercase">
                              {isRTL ? 'مغلق' : 'Blocked'}
                            </span>
                          </>
                        )}
                        {isBooked && (
                          <span className="absolute -bottom-0.5 inset-x-0 text-center text-[7px] font-bold text-red-400/60 uppercase">
                            {isRTL ? 'محجوز' : 'Booked'}
                          </span>
                        )}
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

      {/* Manual Booking Dialog */}
      <AnimatePresence>
        {manualBookingTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f0f1a] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
              <h4 className={`text-white font-black text-xl mb-1 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                {isRTL ? 'حجز يدوي جديد' : 'New Manual Booking'}
              </h4>
              <p className={`text-white/40 text-xs mb-8 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                {isRTL ? `الموعد: ${manualBookingTarget} - ${selectedDate}` : `Slot: ${manualBookingTarget} - ${selectedDate}`}
              </p>

              <form onSubmit={handleManualBook} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                    {isRTL ? 'اسم العميل' : 'Customer Name'}
                  </label>
                  <input
                    required
                    autoComplete="off"
                    value={manualForm.name}
                    onChange={e => setManualForm({...manualForm, name: e.target.value})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                      {isRTL ? 'العمر' : 'Age'}
                    </label>
                    <input
                      required
                      type="number"
                      autoComplete="off"
                      value={manualForm.age}
                      onChange={e => setManualForm({...manualForm, age: e.target.value})}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                      {isRTL ? 'رقم الهاتف' : 'Phone'}
                    </label>
                    <input
                      required
                      autoComplete="off"
                      value={manualForm.phone}
                      onChange={e => setManualForm({...manualForm, phone: e.target.value})}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                    {isRTL ? 'البريد (اختياري للتذكير)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    value={manualForm.email}
                    onChange={e => setManualForm({...manualForm, email: e.target.value})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setManualBookingTarget(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all border border-white/10">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={isBooking}
                    className="flex-1 py-4 rounded-2xl bg-accent text-primary font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-accent/20 disabled:opacity-50">
                    {isBooking ? (isRTL ? 'جاري...' : 'Booking...') : (isRTL ? 'تأكيد الحجز' : 'Confirm')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
