import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Id } from '../../convex/_generated/dataModel'
import AdminScheduleManager from '../components/AdminScheduleManager'
import AdminBlacklistManager from '../components/AdminBlacklistManager'
import AdminBarberManager from '../components/AdminBarberManager'

// ─── Types ───────────────────────────────────────────────────────────────────
type SnackType = 'success' | 'error'
interface SnackItem { id: number; type: SnackType; title: string; message: string }
interface ConfirmTarget { id: Id<'bookings'>; label: string; action: 'cancel' | 'delete' }

// ─── Snackbar ────────────────────────────────────────────────────────────────
function Snackbar({ item, onClose }: { item: SnackItem; onClose: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(item.id), 4000)
    return () => clearTimeout(t)
  }, [item.id, onClose])

  const cfg = item.type === 'success'
    ? { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', icon: '✓' }
    : { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  icon: '✕' }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{    opacity: 0, x: 80, scale: 0.92 }}
      className="relative w-72 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="px-4 py-3 flex items-start gap-3 pr-10">
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold mt-0.5 text-white"
          style={{ background: cfg.color }}>
          {cfg.icon}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{item.title}</p>
          <p className="text-white/55 text-xs mt-0.5">{item.message}</p>
        </div>
      </div>
      <button onClick={() => onClose(item.id)}
        className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors text-xl leading-none">×</button>
      <motion.div className="absolute bottom-0 left-0 h-0.5"
        style={{ background: cfg.color }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }} />
    </motion.div>
  )
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({ label, isRTL, onConfirm, onCancel }: {
  label: string; isRTL: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <div className="px-6 pt-6 pb-5 flex items-start gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-white mt-0.5"
              style={{ background: '#ef4444' }}>✕</div>
            <div>
              <p className="font-bold text-white text-base">{isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}</p>
              <p className="text-white/55 text-sm mt-1">{label}</p>
            </div>
          </div>
          <div className="flex gap-3 px-6 pb-5" dir={isRTL ? 'rtl' : 'ltr'}>
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
              {isRTL ? 'تراجع' : 'Cancel'}
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors"
              style={{ background: '#ef4444' }}>
              {isRTL ? 'نعم، إلغاء الحجز' : 'Yes, Remove'}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#ef4444' }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Mini Calendar ───────────────────────────────────────────────────────────
function MiniCalendar({ dates, selected, onSelect, isRTL }: {
  dates: string[]; selected: string | null; onSelect: (d: string | null) => void; isRTL: boolean
}) {
  const now = new Date()
  const [yr, setYr] = useState(now.getFullYear())
  const [mo, setMo] = useState(now.getMonth())

  const monthsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const daysAr = ['أح','إث','ث','أر','خ','ج','س']
  const daysEn = ['Su','Mo','Tu','We','Th','Fr','Sa']

  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const firstDay    = new Date(yr, mo, 1).getDay()

  const fmt = (d: number) => `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const prevMo = () => { if (mo === 0) { setMo(11); setYr(y=>y-1) } else setMo(m=>m-1) }
  const nextMo = () => { if (mo === 11) { setMo(0); setYr(y=>y+1) } else setMo(m=>m+1) }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full sm:w-64 flex-shrink-0 self-center lg:self-start lg:sticky lg:top-6 mx-auto lg:mx-0">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMo} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg">‹</button>
        <span className="text-white font-semibold text-sm">{(isRTL ? monthsAr : monthsEn)[mo]} {yr}</span>
        <button onClick={nextMo} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg">›</button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {(isRTL ? daysAr : daysEn).map(d => (
          <div key={d} className="text-center text-white/30 text-[10px] py-1">{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const ds  = fmt(day)
          const has = dates.includes(ds)
          const sel = selected === ds
          const tod = now.getFullYear()===yr && now.getMonth()===mo && now.getDate()===day
          return (
            <button key={day} onClick={() => onSelect(sel ? null : ds)}
              className={`relative mx-auto w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all font-medium
                ${sel ? 'bg-accent text-white shadow-lg shadow-accent/30' : ''}
                ${!sel && has ? 'text-white hover:bg-accent/20' : ''}
                ${!sel && !has ? 'text-white/30 hover:bg-white/5' : ''}
                ${tod && !sel ? 'ring-1 ring-accent/60' : ''}
              `}>
              {day}
              {has && !sel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />}
            </button>
          )
        })}
      </div>
      {selected && (
        <button onClick={() => onSelect(null)}
          className="mt-3 w-full text-xs text-accent/70 hover:text-accent transition-colors text-center py-1">
          {isRTL ? '← عرض كل الأيام' : '← Show all days'}
        </button>
      )}
    </div>
  )
}

// ─── Time sort helper ─────────────────────────────────────────────────────────
function parseTime(slot: string): number {
  if (!slot) return Infinity
  const s = slot.trim().toUpperCase()
  if (s.includes('WAIT') || s.includes('انتظار')) return 2000 // Push waiting to end

  // Try to find AM/PM
  const isPM = s.includes('PM')
  const isAM = s.includes('AM')

  // Extract digits
  const timeMatch = s.match(/(\d{1,2}):(\d{2})/)
  if (!timeMatch) return Infinity

  let h = parseInt(timeMatch[1])
  const m = parseInt(timeMatch[2])

  if (isPM && h !== 12) h += 12
  if (isAM && h === 12) h = 0

  return h * 60 + m
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [snacks, setSnacks]         = useState<SnackItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`
  })
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'booked' | 'blacklist' | 'barbers' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'phone' | 'email' | 'age' | 'barber' | ''>('')

  const loginMutation = useMutation(api.admin.login)
  const appointments  = useQuery(api.admin.getAppointments, isAuthenticated ? {} : 'skip')
  const barbers       = useQuery(api.barbers.getBarbers)
  const updateStatus  = useMutation(api.admin.updateAppointmentStatus)
  const deleteAppt    = useMutation(api.admin.deleteAppointment)
  const updateAppt    = useMutation(api.admin.updateAppointment)

  const [editingAppt, setEditingAppt] = useState<{
    id: Id<'bookings'>;
    barberId: Id<'barbers'>;
    name: string;
    age: number;
    phone: string;
    email?: string;
    status: string;
  } | null>(null)

  const addSnack = useCallback((type: SnackType, title: string, message: string) => {
    const id = Date.now()
    setSnacks(prev => [...prev, { id, type, title, message }])
  }, [])

  const removeSnack = useCallback((id: number) => {
    setSnacks(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setIsLoggingIn(true)
    try {
      const ok = await loginMutation({ password })
      if (ok) { sessionStorage.setItem('adminAuth','true'); setIsAuthenticated(true) }
      else setError(isRTL ? 'كلمة المرور غير صحيحة' : 'Invalid password')
    } catch {
      setError(isRTL ? 'حدث خطأ أثناء تسجيل الدخول' : 'Login error')
    } finally { setIsLoggingIn(false) }
  }

  const handleLogout = () => { sessionStorage.removeItem('adminAuth'); setIsAuthenticated(false); navigate('/') }

  const handleConfirm = async (id: Id<'bookings'>) => {
    await updateStatus({ id, status: 'confirmed' })
    addSnack('success', isRTL ? 'تم التأكيد ✓' : 'Confirmed ✓', isRTL ? 'تم تأكيد الحجز بنجاح' : 'Appointment confirmed successfully')
  }

  const handleCancel = (id: Id<'bookings'>, name: string) => {
    setConfirmTarget({ id, label: isRTL ? `هل تريد إلغاء حجز "${name}"؟` : `Cancel "${name}"'s appointment?`, action: 'cancel' })
  }

  const handlePermanentDelete = (id: Id<'bookings'>, name: string) => {
    setConfirmTarget({ id, label: isRTL ? `هل أنت متأكد من الحذف النهائي لحجز "${name}"؟ لا يمكن التراجع عن هذه الخطوة.` : `Permanently delete "${name}"'s appointment? This cannot be undone.`, action: 'delete' })
  }

  const doDelete = async () => {
    if (!confirmTarget) return
    if (confirmTarget.action === 'cancel') {
      await updateStatus({ id: confirmTarget.id, status: 'cancelled' })
      addSnack('error', isRTL ? 'تم الإلغاء' : 'Cancelled', isRTL ? 'تم إلغاء الحجز بنجاح' : 'Appointment has been cancelled')
    } else {
      await deleteAppt({ id: confirmTarget.id })
      addSnack('error', isRTL ? 'تم الحذف' : 'Deleted', isRTL ? 'تم حذف الحجز نهائياً' : 'Appointment has been permanently deleted')
    }
    setConfirmTarget(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAppt) return
    try {
      await updateAppt({
        id: editingAppt.id,
        barberId: editingAppt.barberId,
        customerName: editingAppt.name,
        customerAge: editingAppt.age,
        customerPhone: editingAppt.phone,
        customerEmail: editingAppt.email || undefined
      })
      if (editingAppt.status === 'cancelled') {
        await updateStatus({ id: editingAppt.id, status: 'booked' })
        addSnack('success', isRTL ? 'تم الاستعادة' : 'Restored', isRTL ? 'تم استعادة الحجز بنجاح' : 'Appointment restored successfully')
      } else {
        addSnack('success', isRTL ? 'تم التحديث' : 'Updated', isRTL ? 'تم تحديث بيانات الحجز بنجاح' : 'Appointment updated successfully')
      }
      setEditingAppt(null)
    } catch (err) {
      addSnack('error', 'Error', 'Failed to update appointment')
    }
  }

  // ── Login screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
          <h2 className={`text-2xl font-bold text-center text-white mb-8 ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'تسجيل دخول الإدارة' : 'Admin Login'}
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={isRTL ? 'كلمة المرور' : 'Password'} autoFocus
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="text-red-400 text-sm text-center">{error}</motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={isLoggingIn || !password}
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoggingIn ? (isRTL ? 'جاري التحقق...' : 'Logging in...') : (isRTL ? 'دخول' : 'Login')}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard Logic ──
  const allDates = appointments ? [...new Set(appointments.map(a => a.date))].sort() : []
  
  // 1. Basic Filter by Date
  const dateFiltered = selectedDate ? (appointments ?? []).filter(a => a.date === selectedDate) : (appointments ?? [])

  // 2. Filter by Tab (Status)
  const tabFiltered = dateFiltered.filter(a => {
    if (activeTab === 'confirmed') return a.status === 'confirmed'
    if (activeTab === 'booked') return a.status === 'booked' || a.status === 'pending'
    if (activeTab === 'cancelled') return a.status === 'cancelled'
    if (activeTab === 'all') return a.status !== 'cancelled' // Hide cancelled from 'All' tab to avoid clutter
    return true
  })

  // 3. Search Query (Name, Phone, Email, Barber)
  const searched = tabFiltered.filter(a => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    
    if (sortBy === 'name') return a.customerName.toLowerCase().includes(q)
    if (sortBy === 'phone') return a.customerPhone.includes(q)
    if (sortBy === 'email') return a.customerEmail?.toLowerCase().includes(q)
    if (sortBy === 'age') return a.customerAge.toString().includes(q)
    if (sortBy === 'barber') {
      return (a.barber?.nameAr.toLowerCase().includes(q)) || (a.barber?.nameEn.toLowerCase().includes(q))
    }

    return (
      a.customerName.toLowerCase().includes(q) ||
      a.customerPhone.includes(q) ||
      (a.customerEmail?.toLowerCase().includes(q)) ||
      (a.barber?.nameAr.toLowerCase().includes(q)) ||
      (a.barber?.nameEn.toLowerCase().includes(q))
    )
  })

  // Stats from dateFiltered (regardless of search/sort)
  const stats = {
    total: dateFiltered.length,
    confirmed: dateFiltered.filter((a) => a.status === "confirmed").length,
    waiting: dateFiltered.filter((a) => a.status === "booked").length,
  }

  const byDate = searched.reduce((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = []
    acc[appt.date].push(appt)
    return acc
  }, {} as Record<string, typeof searched>)

  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // 4. Sorting logic for each group
  const sortAppts = (list: typeof searched) => {
    return [...list].sort((a, b) => {
      let diff = 0
      if (sortBy === 'name') diff = a.customerName.localeCompare(b.customerName)
      else if (sortBy === 'phone') diff = a.customerPhone.localeCompare(b.customerPhone)
      else if (sortBy === 'email') diff = (a.customerEmail || '').localeCompare(b.customerEmail || '')
      else if (sortBy === 'age') diff = b.customerAge - a.customerAge
      else if (sortBy === 'barber') {
        const nameA = isRTL ? a.barber?.nameAr : a.barber?.nameEn
        const nameB = isRTL ? b.barber?.nameAr : b.barber?.nameEn
        diff = (nameA || '').localeCompare(nameB || '')
      }
      
      // Tie-breaker or default: sort by Time
      if (diff === 0) {
        return parseTime(a.timeSlot) - parseTime(b.timeSlot)
      }
      return diff
    })
  }

  const finalGrouped = Object.fromEntries(
    sortedDates.map(date => [date, sortAppts(byDate[date])])
  )

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Snackbar stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" dir="ltr">
        <AnimatePresence mode="popLayout">
          {snacks.map(s => <Snackbar key={s.id} item={s} onClose={removeSnack} />)}
        </AnimatePresence>
      </div>

      {/* Custom Confirm Dialog */}
      {confirmTarget && (
        <ConfirmDialog
          label={confirmTarget.label}
          isRTL={isRTL}
          onConfirm={doDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      {/* Edit Dialog */}
      <AnimatePresence>
        {editingAppt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#16161f] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
              <h4 className={`text-white font-black text-xl mb-8 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                {isRTL ? 'تعديل بيانات الحجز' : 'Edit Appointment'}
              </h4>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                    {isRTL ? 'اسم العميل' : 'Customer Name'}
                  </label>
                  <input
                    required
                    value={editingAppt.name}
                    onChange={e => setEditingAppt({...editingAppt, name: e.target.value})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                  />
                </div>

                {/* Barber Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                    {isRTL ? 'الحلاق' : 'Barber'}
                  </label>
                  <select
                    value={editingAppt.barberId}
                    onChange={e => setEditingAppt({...editingAppt, barberId: e.target.value as Id<'barbers'>})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                    style={{ colorScheme: 'dark' }}
                  >
                    {barbers?.map(b => (
                      <option key={b._id} value={b._id}>{isRTL ? b.nameAr : b.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                      {isRTL ? 'العمر' : 'Age'}
                    </label>
                    <input
                      required
                      type="number"
                      value={editingAppt.age}
                      onChange={e => setEditingAppt({...editingAppt, age: Number(e.target.value)})}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                      {isRTL ? 'رقم الهاتف' : 'Phone'}
                    </label>
                    <input
                      required
                      value={editingAppt.phone}
                      onChange={e => setEditingAppt({...editingAppt, phone: e.target.value})}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-white font-bold uppercase tracking-widest px-1 block">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editingAppt.email || ''}
                    onChange={e => setEditingAppt({...editingAppt, email: e.target.value})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-accent/50 transition-all shadow-inner"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setEditingAppt(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all border border-white/10 cursor-pointer">
                    {isRTL ? 'تراجع' : 'Cancel'}
                  </button>
                  <button type="submit"
                    className={`flex-1 py-4 rounded-2xl text-primary font-black text-sm hover:brightness-110 transition-all shadow-lg cursor-pointer
                      ${editingAppt.status === 'cancelled' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-accent shadow-accent/20'}`}>
                    {editingAppt.status === 'cancelled' 
                      ? (isRTL ? 'استعادة الحجز' : 'Restore') 
                      : (isRTL ? 'حفظ التعديلات' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-8">
        {/* Header */}
        <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="text-white/40 text-sm mt-1">{isRTL ? 'إدارة الحجوزات والبيانات' : 'Manage appointments and data'}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Language toggle (Matches Navbar style) */}
            <motion.button
              onClick={toggleLanguage}
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

            <div className="flex gap-2">
              <button onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm">
                {isRTL ? 'زيارة الموقع' : 'Visit Site'}
              </button>
              <button onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm">
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto flex flex-col gap-6">
          {appointments === undefined ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
            </div>
          ) : (
            <>
              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#16161f] to-[#1c1c28] border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c8a050] to-transparent" />
                  <div className="text-3xl font-black text-[#c8a050]">{stats.total}</div>
                  <div className="text-xs text-white/40 font-medium mt-1">{isRTL ? 'إجمالي اليوم' : 'Total Today'}</div>
                </div>
                <div className="bg-gradient-to-br from-[#16161f] to-[#1c1c28] border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4caf80] to-transparent" />
                  <div className="text-3xl font-black text-[#4caf80]">{stats.confirmed}</div>
                  <div className="text-xs text-white/40 font-medium mt-1">{isRTL ? 'مؤكد' : 'Confirmed'}</div>
                </div>
                <div className="bg-gradient-to-br from-[#16161f] to-[#1c1c28] border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#e09030] to-transparent" />
                  <div className="text-3xl font-black text-[#e09030]">{stats.waiting}</div>
                  <div className="text-xs text-white/40 font-medium mt-1">{isRTL ? 'انتظار' : 'Waiting'}</div>
                </div>
                <div className="bg-gradient-to-br from-[#16161f] to-[#1c1c28] border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ef4444] to-transparent" />
                  <div className="text-3xl font-black text-[#ef4444]">{dateFiltered.filter(a => a.status === 'cancelled').length}</div>
                  <div className="text-xs text-white/40 font-medium mt-1">{isRTL ? 'ملغية' : 'Cancelled'}</div>
                </div>
              </div>

              {/* Advanced Controls: Search & Sort */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#16161f]/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 shadow-xl">
                {/* Search */}
                <div className="lg:col-span-8 relative group">
                  <div className={`absolute top-1/2 -translate-y-1/2 text-accent/40 group-focus-within:text-accent transition-colors ${isRTL ? 'right-4' : 'left-4'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRTL ? 'ابحث عن عميل بالاسم، الهاتف، أو الايميل...' : 'Search by name, phone, or email...'}
                    className={`w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 text-sm text-white placeholder:text-white/20 focus:border-accent/50 focus:bg-black/60 transition-all outline-none shadow-inner ${isRTL ? 'pr-12 pl-4 text-right font-arabic' : 'pl-12 pr-4 text-left font-english'}`}
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="lg:col-span-4 flex items-center gap-3">
                  <div className="relative w-full">
                    <div className={`absolute top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none ${isRTL ? 'left-4' : 'right-4'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`w-full appearance-none bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-sm text-white focus:border-accent/50 focus:bg-black/60 transition-all outline-none cursor-pointer shadow-inner ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}`}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className="bg-[#1a1a2e]">{isRTL ? 'التصنيف الافتراضي' : 'Default Sort'}</option>
                      <option value="name" className="bg-[#1a1a2e]">{isRTL ? 'العميل' : 'Customer'}</option>
                      <option value="barber" className="bg-[#1a1a2e]">{isRTL ? 'الحلاق' : 'Barber'}</option>
                      <option value="phone" className="bg-[#1a1a2e]">{isRTL ? 'رقم الهاتف' : 'Phone'}</option>
                      <option value="age" className="bg-[#1a1a2e]">{isRTL ? 'العمر' : 'Age'}</option>
                      <option value="email" className="bg-[#1a1a2e]">{isRTL ? 'البريد الإلكتروني' : 'Email'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#16161f] rounded-xl p-1 gap-1">
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-gradient-to-br from-[#c8a050] to-[#d4a840] text-[#0a0a0f] shadow-lg shadow-[#c8a050]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('all')}
                >
                  {isRTL ? 'الكل' : 'All'}
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'confirmed' ? 'bg-gradient-to-br from-[#c8a050] to-[#d4a840] text-[#0a0a0f] shadow-lg shadow-[#c8a050]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('confirmed')}
                >
                  {isRTL ? 'المؤكدة' : 'Confirmed'}
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'booked' ? 'bg-gradient-to-br from-[#c8a050] to-[#d4a840] text-[#0a0a0f] shadow-lg shadow-[#c8a050]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('booked')}
                >
                  {isRTL ? 'الانتظار' : 'Waiting'}
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'cancelled' ? 'bg-gradient-to-br from-[#ef4444] to-[#f87171] text-white shadow-lg shadow-red-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  {isRTL ? 'الملغية' : 'Cancelled'}
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'blacklist' ? 'bg-gradient-to-br from-[#ef4444] to-[#f87171] text-white shadow-lg shadow-red-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('blacklist')}
                >
                  {isRTL ? 'الحظر' : 'Blacklist'}
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'barbers' ? 'bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] text-white shadow-lg shadow-purple-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('barbers')}
                >
                  {isRTL ? 'الحلاقين' : 'Barbers'}
                </button>
              </div>

              <div className="flex gap-6 items-start flex-col lg:flex-row">
                {/* ── Calendar & Schedule Guard ── */}
                <div className="grid grid-cols-2 lg:flex lg:flex-col lg:sticky lg:top-6 gap-4 sm:gap-6 z-50 relative w-full lg:w-64">
                  <div className="w-full">
                    <MiniCalendar dates={allDates} selected={selectedDate} onSelect={setSelectedDate} isRTL={isRTL} />
                  </div>
                  <div className="w-full">
                    <AdminScheduleManager 
                      selectedDate={selectedDate} 
                      onDateChange={setSelectedDate}
                      isRTL={isRTL} 
                      onSnack={(type, title, msg) => addSnack(type, title, msg)} 
                    />
                  </div>
                </div>

                {/* ── Blacklist Tab Content ── */}
                {activeTab === 'blacklist' ? (
                  <div className="flex-1 w-full z-10 relative">
                    <AdminBlacklistManager isRTL={isRTL} onSnack={addSnack} />
                  </div>
                ) : activeTab === 'barbers' ? (
                  <div className="flex-1 w-full z-10 relative">
                    <AdminBarberManager isRTL={isRTL} onSnack={addSnack} />
                  </div>
                ) : (
                  /* ── Cards Grid ── */
                  <div className="flex-1 space-y-6 min-w-0 w-full z-10 relative">
                  {sortedDates.length === 0 ? (
                    <div className="w-full text-center py-20 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl opacity-40">✂️</div>
                      <p className="text-white/60 font-semibold">
                        {isRTL ? 'لا توجد حجوزات تطابق هذا البحث' : 'No matching appointments'}
                      </p>
                    </div>
                  ) : sortedDates.map(date => (
                    <div key={date} className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden p-4 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#c8a050] rounded-full"></div>
                        <h2 className="text-lg font-bold text-white">{date}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {finalGrouped[date].map((appt, idx) => (
                          <div key={appt._id}
                            className="bg-gradient-to-br from-[#14141c] to-[#1a1a24] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-white/10"
                            style={{ animation: `slideIn 0.3s ease forwards`, animationDelay: `${(idx % 10) * 50}ms` }}>
                            
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap
                                ${appt.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  appt.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  appt.status === 'booked' || appt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-white/5 text-white/50 border-white/10'}`}>
                                {appt.status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                                 appt.status === 'cancelled' ? (isRTL ? 'ملغي' : 'Cancelled') :
                                 appt.status === 'booked' || appt.status === 'pending' ? (isRTL ? 'انتظار' : 'Waiting') :
                                 appt.status}
                              </span>
                              <div className="flex flex-col items-end">
                                <div className={`text-lg font-black leading-none ${appt.timeSlot.includes('Wait') || appt.timeSlot.includes('انتظار') ? 'text-amber-500 text-sm' : 'text-[#c8a050]'}`}>
                                   {appt.timeSlot.includes('Wait') || appt.timeSlot.includes('انتظار') ? (isRTL ? '⏳ انتظار' : '⏳ Waiting') : appt.timeSlot}
                                </div>
                                <div className="text-[10px] text-white/40 mt-1 uppercase font-semibold">{isRTL ? 'الوقت' : 'Time'}</div>
                              </div>
                            </div>

                            <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-4 flex-1">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'العميل' : 'Customer'}</span>
                                <span className="text-[13px] font-semibold text-white/90 truncate">{appt.customerName}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'الحلاق' : 'Barber'}</span>
                                <span className="text-[13px] font-semibold text-white/90 truncate">{appt.barber ? (isRTL ? appt.barber.nameAr : appt.barber.nameEn) : '—'}</span>
                              </div>
                              <div className="flex flex-col gap-1 text-center col-span-1">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'رقم الهاتف' : 'Phone'}</span>
                                <span className="text-[13px] text-white/60 font-mono block" dir="ltr">{appt.customerPhone}</span>
                              </div>
                              <div className="flex flex-col gap-1 text-center col-span-1">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'العمر' : 'Age'}</span>
                                <span className="text-[13px] font-semibold text-white/90 truncate block">{appt.customerAge} {isRTL ? 'سنة' : 'yrs'}</span>
                              </div>
                              {/* New Email Field */}
                              <div className="flex flex-col gap-1 col-span-2 border-t border-white/5 pt-2">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                                <span className="text-[13px] text-white/70 truncate font-english">{appt.customerEmail || '—'}</span>
                              </div>
                            </div>

                            <div className="p-3 border-t border-white/5 flex justify-end gap-2 bg-black/20">
                              {appt.status !== 'confirmed' && appt.status !== 'cancelled' && (
                                <button onClick={() => handleConfirm(appt._id)}
                                  className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs font-bold transition-colors">
                                  {isRTL ? 'تأكيد' : 'Confirm'}
                                </button>
                              )}
                              <button onClick={() => setEditingAppt({
                                  id: appt._id,
                                  barberId: appt.barberId,
                                  name: appt.customerName,
                                  age: appt.customerAge,
                                  phone: appt.customerPhone,
                                  email: appt.customerEmail,
                                  status: appt.status
                                })}
                                className="px-4 py-2 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">
                                {isRTL ? 'تعديل' : 'Edit'}
                              </button>
                              {appt.status !== 'cancelled' ? (
                                <button onClick={() => handleCancel(appt._id, appt.customerName)}
                                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-bold transition-colors">
                                  {isRTL ? 'إلغاء الحجز' : 'Cancel'}
                                </button>
                              ) : (
                                <button onClick={() => handlePermanentDelete(appt._id, appt.customerName)}
                                  className="px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-xs font-bold transition-colors">
                                  {isRTL ? 'إلغاء نهائيا' : 'Delete'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
