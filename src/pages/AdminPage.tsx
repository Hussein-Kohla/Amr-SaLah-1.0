import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Id } from '../../convex/_generated/dataModel'

// ─── Types ───────────────────────────────────────────────────────────────────
type SnackType = 'success' | 'error'
interface SnackItem { id: number; type: SnackType; title: string; message: string }
interface ConfirmTarget { id: Id<'appointments'>; label: string }

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
  const s = slot.trim()
  if (/^wait/i.test(s) || s.includes('انتظار')) return Infinity
  // "AM 09:00" or "PM 10:00"
  const m = s.match(/^(AM|PM)\s+(\d{1,2}):(\d{2})$/i)
  if (m) {
    let h = parseInt(m[2]), mn = parseInt(m[3])
    if (m[1].toUpperCase()==='PM' && h!==12) h+=12
    if (m[1].toUpperCase()==='AM' && h===12) h=0
    return h*60+mn
  }
  // "09:00 AM" or "10:00 PM"
  const m2 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m2) {
    let h = parseInt(m2[1]), mn = parseInt(m2[2])
    if (m2[3].toUpperCase()==='PM' && h!==12) h+=12
    if (m2[3].toUpperCase()==='AM' && h===12) h=0
    return h*60+mn
  }
  return Infinity
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
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'booked'>('all')

  const loginMutation = useMutation(api.admin.login)
  const appointments  = useQuery(api.admin.getAppointments, isAuthenticated ? {} : 'skip')
  const updateStatus  = useMutation(api.admin.updateAppointmentStatus)
  const deleteAppt    = useMutation(api.admin.deleteAppointment)

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

  const handleConfirm = async (id: Id<'appointments'>) => {
    await updateStatus({ id, status: 'confirmed' })
    addSnack('success', isRTL ? 'تم التأكيد ✓' : 'Confirmed ✓', isRTL ? 'تم تأكيد الحجز بنجاح' : 'Appointment confirmed successfully')
  }

  const handleCancel = (id: Id<'appointments'>, name: string) => {
    setConfirmTarget({ id, label: isRTL ? `هل تريد إلغاء حجز "${name}"؟` : `Remove "${name}"'s appointment?` })
  }

  const doDelete = async () => {
    if (!confirmTarget) return
    await deleteAppt({ id: confirmTarget.id })
    addSnack('error', isRTL ? 'تم الإلغاء' : 'Cancelled', isRTL ? 'تم إلغاء الحجز بنجاح' : 'Appointment has been removed')
    setConfirmTarget(null)
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

  // ── Dashboard ──
  const allDates = appointments ? [...new Set(appointments.map(a => a.date))].sort() : []
  const filtered  = selectedDate ? (appointments ?? []).filter(a => a.date === selectedDate) : (appointments ?? [])

  const stats = {
    total: filtered.length,
    confirmed: filtered.filter((a) => a.status === "confirmed").length,
    waiting: filtered.filter((a) => a.status === "booked").length,
  }

  const tabFiltered = filtered.filter(a => {
    if (activeTab === 'confirmed') return a.status === 'confirmed'
    if (activeTab === 'booked') return a.status === 'booked'
    return true
  })

  const byDate = tabFiltered.reduce((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = []
    acc[appt.date].push(appt)
    return acc
  }, {} as Record<string, typeof tabFiltered>)

  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Sort each day's appointments: chronological, waiting last
  const sortedByDate = Object.fromEntries(
    sortedDates.map(date => [date, [...byDate[date]].sort((a, b) => parseTime(a.timeSlot) - parseTime(b.timeSlot))])
  )

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Snackbar stack – always LTR positioning */}
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

      <div className="p-4 sm:p-8">
        {/* Header */}
        <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : 'font-english'}`}>
              {isRTL ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="text-white/40 text-sm mt-1">{isRTL ? 'إدارة الحجوزات والبيانات' : 'Manage appointments and data'}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm">
              {isRTL ? 'زيارة الموقع' : 'Visit Site'}
            </button>
            <button onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm">
              {isRTL ? 'تسجيل الخروج' : 'Logout'}
            </button>
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
              </div>

              {/* Tabs */}
              <div className="flex bg-[#16161f] rounded-xl p-1 gap-1">
                <button
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-gradient-to-br from-[#c8a050] to-[#d4a840] text-[#0a0a0f] shadow-lg shadow-[#c8a050]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  onClick={() => setActiveTab('all')}
                >
                  {isRTL ? 'الحجوزات' : 'All Appointments'}
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
              </div>

              <div className="flex gap-6 items-start flex-col lg:flex-row">
                {/* ── Calendar ── */}
                <MiniCalendar dates={allDates} selected={selectedDate} onSelect={setSelectedDate} isRTL={isRTL} />

                {/* ── Cards Grid ── */}
                <div className="flex-1 space-y-6 min-w-0 w-full">
                  {sortedDates.length === 0 ? (
                    <div className="w-full text-center py-20 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl opacity-40">✂️</div>
                      <p className="text-white/60 font-semibold">
                        {isRTL ? 'لا توجد حجوزات' : 'No appointments'}
                      </p>
                    </div>
                  ) : sortedDates.map(date => (
                    <div key={date} className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden p-4 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#c8a050] rounded-full"></div>
                        <h2 className="text-lg font-bold text-white">{date}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sortedByDate[date].map((appt, idx) => (
                          <div key={appt._id}
                            className="bg-gradient-to-br from-[#14141c] to-[#1a1a24] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-white/10"
                            style={{ animation: `slideIn 0.3s ease forwards`, animationDelay: `${(idx % 10) * 50}ms` }}>
                            
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap
                                ${appt.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  appt.status === 'booked'    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-white/5 text-white/50 border-white/10'}`}>
                                {appt.status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                                 appt.status === 'booked'    ? (isRTL ? 'انتظار' : 'Waiting') :
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
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'رقم الهاتف' : 'Phone'}</span>
                                <span className="text-[13px] text-white/60 font-mono" dir="ltr">{appt.customerPhone}</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isRTL ? 'العمر' : 'Age'}</span>
                                <span className="text-[13px] font-semibold text-white/90 truncate">{appt.customerAge} {isRTL ? 'سنة' : 'yrs'}</span>
                              </div>
                            </div>

                            <div className="p-3 border-t border-white/5 flex justify-end gap-2 bg-black/20">
                              {appt.status !== 'confirmed' && (
                                <button onClick={() => handleConfirm(appt._id)}
                                  className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs font-bold transition-colors">
                                  {isRTL ? 'تأكيد' : 'Confirm'}
                                </button>
                              )}
                              <button onClick={() => handleCancel(appt._id, appt.customerName)}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-bold transition-colors">
                                {isRTL ? 'إلغاء الحجز' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
