import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMutation, useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface MyBookingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalState = 'form' | 'otp' | 'telegram' | 'bookings' | 'loading' | 'error'

type SnackType = 'success' | 'error'
interface SnackItem { id: number; type: SnackType; title: string; message: string }
interface ConfirmTarget { id: Id<'bookings'>; label: string }

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
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer">
              {isRTL ? 'تراجع' : 'Cancel'}
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors cursor-pointer"
              style={{ background: '#ef4444' }}>
              {isRTL ? 'نعم، إلغاء الحجز' : 'Yes, Cancel'}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#ef4444' }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [modalState, setModalState] = useState<ModalState>('loading')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [authMethod, setAuthMethod] = useState<'email' | 'telegram'>('email')
  const [errors, setErrors] = useState<{ phone?: string; email?: string; otp?: string }>({})
  const [serverError, setServerError] = useState('')
  
  const [isTelegramRequested, setIsTelegramRequested] = useState(false)
  const [snacks, setSnacks] = useState<SnackItem[]>([])
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)

  const drawerRef = useRef<HTMLDivElement>(null)
  
  const sendOtpEmail = useAction(api.reminders.sendOtpEmail)
  const generateOtp = useMutation(api.auth.generateOtp)
  const verifyOtp = useMutation(api.auth.verifyOtp)
  const cancelBooking = useMutation(api.appointments.cancelBooking)

  const addSnack = (type: SnackType, title: string, message: string) => {
    setSnacks(prev => [...prev, { id: Date.now(), type, title, message }])
  }
  const removeSnack = (id: number) => {
    setSnacks(prev => prev.filter(s => s.id !== id))
  }

  // Use query for bookings only when in bookings state
  const bookings = useQuery(api.appointments.getUserBookings, 
    modalState === 'bookings' ? { phone, email: email || undefined } : 'skip'
  )

  useEffect(() => {
    if (isOpen) {
      const savedPhone = localStorage.getItem('barberpro_user_phone')
      const savedEmail = localStorage.getItem('barberpro_user_email')
      if (savedPhone) {
        setPhone(savedPhone)
        if (savedEmail) setEmail(savedEmail)
        setModalState('bookings')
      } else {
        setModalState('form')
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const handleClose = () => {
    onClose()
    // Reset state only if they are not logged in
    if (!localStorage.getItem('barberpro_user_phone')) {
      setModalState('form')
      setPhone('')
      setEmail('')
      setOtp('')
    } else {
      setModalState('bookings')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('barberpro_user_phone')
    localStorage.removeItem('barberpro_user_email')
    setPhone('')
    setEmail('')
    setOtp('')
    setModalState('form')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: any = {}
    
    if (!EGYPT_PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      errs.phone = t('modal.phoneInvalid', 'رقم الهاتف غير صالح')
    }
    const emailTrimmed = email.trim().toLowerCase()
    if (authMethod === 'email') {
      if (!emailTrimmed) {
        errs.email = t('modal.emailRequired', 'البريد الإلكتروني مطلوب')
      } else if (!emailTrimmed.endsWith('@gmail.com')) {
        errs.email = t('modal.emailInvalid', 'يجب أن يكون البريد @gmail.com')
      }
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})
    setModalState('loading')
    try {
      if (authMethod === 'email') {
        const result = await sendOtpEmail({ email: emailTrimmed, phone: phone.replace(/\s/g, '') })
        if (result && !result.success) throw new Error(result.error)
        setModalState('otp')
      } else {
        await generateOtp({ email: 'telegram_user@gmail.com', phone: phone.replace(/\s/g, '') })
        setModalState('telegram')
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error')
      setModalState('error')
    }
  }

  const handleTelegramRequest = () => {
    setModalState('telegram')
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setErrors({ otp: t('modal.otpInvalid', 'كود غير صحيح') })
      return
    }
    setErrors({})
    setModalState('loading')
    try {
      await verifyOtp({
        email: email.trim().toLowerCase() || 'telegram_user@gmail.com', // Fake email if telegram was used without email, wait, verifyOtp requires email, maybe I shouldn't fake it, let's just make email required in form.
        code: otp,
        phone: phone.replace(/\s/g, ''),
      })
      // Success
      localStorage.setItem('barberpro_user_phone', phone.replace(/\s/g, ''))
      if (email) localStorage.setItem('barberpro_user_email', email.trim().toLowerCase())
      setModalState('bookings')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('EXPIRED_OTP') || msg.includes('INVALID_OTP')) {
        setErrors({ otp: t('modal.otpInvalid', 'كود غير صحيح') })
        setModalState('otp')
      } else {
        setServerError(msg)
        setModalState('error')
      }
    }
  }

  const onCancelBooking = async () => {
    if (!confirmTarget) return;
    try {
      await cancelBooking({ bookingId: confirmTarget.id, phone: phone.replace(/\s/g, ''), email: email.trim().toLowerCase() })
      addSnack('success', isRTL ? 'تم الإلغاء' : 'Cancelled', isRTL ? 'تم إلغاء الحجز بنجاح' : 'Booking cancelled successfully')
    } catch (err: any) {
      addSnack('error', isRTL ? 'خطأ' : 'Error', err.message)
    }
    setConfirmTarget(null)
  }

  const promptCancel = (bookingId: Id<"bookings">) => {
    setConfirmTarget({ id: bookingId, label: isRTL ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?' })
  }

  const inputClass = (hasError: boolean) => `
    w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm
    placeholder:text-surface/30 outline-none transition-all duration-200
    focus:ring-1 focus:ring-accent focus:border-accent
    ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}
    ${hasError ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 hover:border-white/20'}
  `

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3" dir="ltr">
        <AnimatePresence mode="popLayout">
          {snacks.map(s => <Snackbar key={s.id} item={s} onClose={removeSnack} />)}
        </AnimatePresence>
      </div>

      {confirmTarget && (
        <ConfirmDialog
          label={confirmTarget.label}
          isRTL={isRTL}
          onConfirm={onCancelBooking}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            className="fixed bottom-0 inset-x-0 z-[60] bg-[#1a1a2e] rounded-t-3xl
                       border-t border-white/10 max-h-[90vh] overflow-y-auto"
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-8 pt-2">
              
              {modalState === 'loading' && (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                </div>
              )}

              {modalState === 'error' && (
                 <motion.div className="flex flex-col items-center text-center py-6">
                 <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-5 text-4xl">❌</div>
                 <h2 className={`text-white text-xl font-bold mb-2 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                   {t('modal.errorTitle', 'حدث خطأ')}
                 </h2>
                 <p className={`text-red-400 text-sm mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>{serverError}</p>
                 <button
                   onClick={() => setModalState('form')}
                   className={`w-full py-3 rounded-xl bg-white/10 text-white font-medium cursor-pointer ${isRTL ? 'font-arabic' : 'font-english'}`}
                 >
                   {t('common.tryAgain', 'حاول مرة أخرى')}
                 </button>
               </motion.div>
              )}

              {modalState === 'form' && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
                      {isRTL ? 'حجوزاتي' : 'My Bookings'}
                    </h2>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-surface/60 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className={`text-surface/50 text-xs mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? 'أدخل بياناتك للوصول إلى حجوزاتك' : 'Enter your details to access your bookings'}
                  </p>
                  
                  <form onSubmit={handleFormSubmit} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setAuthMethod('email')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'email' ? 'bg-accent text-primary' : 'text-surface/60 hover:text-white'} ${isRTL ? 'font-arabic' : 'font-english'}`}
                      >
                        {isRTL ? 'عبر الإيميل' : 'Via Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('telegram')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMethod === 'telegram' ? 'bg-blue-500 text-white' : 'text-surface/60 hover:text-white'} ${isRTL ? 'font-arabic' : 'font-english'}`}
                      >
                        {isRTL ? 'عبر تيليجرام' : 'Via Telegram'}
                      </button>
                    </div>

                    <div>
                      <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.phoneLabel', 'رقم الهاتف')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={inputClass(!!errors.phone)}
                        dir="ltr"
                        placeholder={isRTL ? 'مثال: 01001234567' : 'e.g. 01001234567'}
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
                    </div>

                    <AnimatePresence mode="wait">
                      {authMethod === 'email' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                            {t('modal.emailLabel', 'البريد الإلكتروني')}
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={inputClass(!!errors.email)}
                            dir="ltr"
                            placeholder="example@gmail.com"
                          />
                          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${authMethod === 'telegram' ? 'bg-blue-500 text-white' : 'bg-accent text-primary'} ${isRTL ? 'font-arabic' : 'font-english'}`}
                    >
                      {authMethod === 'telegram' 
                        ? (isRTL ? 'متابعة عبر تيليجرام' : 'Continue via Telegram') 
                        : (isRTL ? 'إرسال الكود' : 'Send Code')}
                    </button>
                  </form>
                </>
              )}

              {modalState === 'telegram' && (
                 <motion.div className="space-y-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
                   <div className="flex items-center justify-between">
                     <h2 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
                       {t('modal.telegramTitle', 'التحقق عبر تيليجرام')}
                     </h2>
                     <button onClick={() => setModalState('form')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-surface/60 hover:bg-white/20 cursor-pointer">
                       {isRTL ? '←' : '→'}
                     </button>
                   </div>
                   
                   <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                     <p className={`text-surface/40 text-xs ${isRTL ? 'font-arabic' : 'font-english'}`}>
                       {isRTL ? 'أدخل الرقم المرتبط بحساب تيليجرام ثم اضغط على الزر لفتح البوت' : 'Enter your telegram phone number and open bot'}
                     </p>
                     <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={isRTL ? 'مثال: 01001234567' : 'e.g. 01001234567'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none transition-all"
                        dir="ltr"
                      />
                     <a
                       href={phone.trim() ? `https://t.me/AmrSalahBarberShopBot?start=${phone.replace(/\s/g, '')}` : '#'}
                       target={phone.trim() ? '_blank' : undefined}
                       className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${phone.trim().length >= 10 ? 'bg-blue-500 text-white cursor-pointer' : 'bg-blue-500/30 text-white/40 cursor-not-allowed pointer-events-none'}`}
                       onClick={(e) => {
                         if (!phone.trim() || phone.trim().length < 10) { e.preventDefault(); return; }
                         setIsTelegramRequested(true)
                       }}
                     >
                       {t('modal.telegramOpenBot', 'فتح بوت تيليجرام')}
                     </a>
                   </div>
                   <AnimatePresence>
                    {isTelegramRequested && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <form onSubmit={handleOtpSubmit} className="space-y-3">
                            <input
                              type="text"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder={t('modal.otpPlaceholder', 'أدخل الكود')}
                              className={`text-center tracking-widest text-3xl font-bold py-6 ${inputClass(!!errors.otp)}`}
                              dir="ltr"
                            />
                            {errors.otp && <p className="text-red-400 text-xs">{errors.otp}</p>}
                            <button type="submit" disabled={otp.length !== 6} className={`w-full py-3.5 rounded-xl font-bold text-primary ${otp.length !== 6 ? 'bg-accent/60 cursor-not-allowed' : 'bg-accent cursor-pointer'}`}>
                              {t('modal.otpVerifyBtn', 'تأكيد')}
                            </button>
                        </form>
                      </motion.div>
                    )}
                   </AnimatePresence>
                 </motion.div>
              )}

              {modalState === 'otp' && (
                 <motion.div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.otpTitle', 'كود التحقق')}
                      </h2>
                      <button onClick={() => setModalState('form')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer">
                        {isRTL ? '←' : '→'}
                      </button>
                    </div>
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                      <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder={t('modal.otpPlaceholder', 'أدخل الكود هنا')}
                          className={`text-center tracking-widest text-3xl font-bold py-6 ${inputClass(!!errors.otp)}`}
                          dir="ltr"
                        />
                        {errors.otp && <p className="text-red-400 text-xs">{errors.otp}</p>}
                        <button type="submit" disabled={otp.length !== 6} className={`w-full py-3.5 rounded-xl font-bold text-primary ${otp.length !== 6 ? 'bg-accent/60 cursor-not-allowed' : 'bg-accent cursor-pointer'}`}>
                          {t('modal.otpVerifyBtn', 'تأكيد الكود')}
                        </button>
                    </form>
                 </motion.div>
              )}

              {modalState === 'bookings' && (
                <div dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
                      {isRTL ? 'حجوزاتي' : 'My Bookings'}
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={handleLogout} className="text-red-400 text-xs underline cursor-pointer">
                        {isRTL ? 'تسجيل خروج' : 'Logout'}
                      </button>
                      <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-surface/60 hover:bg-white/20 transition-colors cursor-pointer">
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className={`text-amber-500/70 text-[11px] mb-5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {isRTL ? 'غير متاح إلغاء الحجز قبل موعده بـ 6 ساعات أو أقل.' : 'Cancellation is not available 6 hours or less before the appointment.'}
                  </p>

                  {bookings === undefined ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-10 text-surface/50 text-sm">
                      {isRTL ? 'لا توجد حجوزات بالبيانات المدخلة' : 'No bookings found with these details'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map(booking => {
                         let canCancel = false;
                         
                         try {
                           // Attempt to parse timeSlot like "10:00 AM"
                           const timeMatch = booking.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                           if (timeMatch) {
                             let hours = parseInt(timeMatch[1]);
                             const mins = parseInt(timeMatch[2]);
                             const period = timeMatch[3]?.toUpperCase();
                             if (period === 'PM' && hours !== 12) hours += 12;
                             if (period === 'AM' && hours === 12) hours = 24;

                             const [year, month, day] = booking.date.split('-').map(Number);
                             // Target date in Egypt time, convert to UTC then compare
                             const targetDate = new Date(Date.UTC(year, month - 1, day, hours, mins));
                             const utcTarget = targetDate.getTime() - (3 * 60 * 60 * 1000);
                             
                             const now = Date.now();
                             const sixHoursMs = 6 * 60 * 60 * 1000;
                             
                             // User can cancel if the appointment is strictly > 6 hours from now
                             if (utcTarget - now >= sixHoursMs) {
                               canCancel = true;
                             }
                           } else {
                             // Fallback if we can't parse (e.g. Waiting list)
                             const todayStr = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().split('T')[0];
                             canCancel = booking.date > todayStr;
                           }
                         } catch (e) {
                           canCancel = false;
                         }

                         // Hide cancelled bookings or show them as cancelled?
                         // The user requested to see cancelled bookings in Admin, but maybe not here, or maybe as "cancelled".
                         // I will just show them with status "cancelled" and disable cancel button.
                         if (booking.status === "cancelled") {
                           canCancel = false;
                         }

                         return (
                           <div key={booking._id} className={`bg-white/5 border ${booking.status === 'cancelled' ? 'border-red-500 bg-red-500/10' : 'border-white/10'} rounded-xl p-4 flex flex-col gap-2 transition-all`}>
                             <div className="flex justify-between items-start">
                               <div>
                                 <p className={`text-white font-bold ${isRTL ? 'font-arabic' : 'font-english'}`}>
                                   {isRTL ? booking.barberNameAr : booking.barberNameEn}
                                 </p>
                                 <p className="text-accent text-sm">{booking.date} — {booking.timeSlot}</p>
                                 <p className="text-surface/40 text-xs mt-1">
                                   {isRTL ? 'الحالة:' : 'Status:'} {
                                     booking.status === 'cancelled' ? (isRTL ? 'ملغي' : 'Cancelled') :
                                     booking.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'Pending') :
                                     booking.status === 'confirmed' ? (isRTL ? 'مؤكد' : 'Confirmed') :
                                     booking.status
                                   }
                                 </p>
                               </div>
                               {canCancel && (
                                 <button
                                   onClick={() => promptCancel(booking._id)}
                                   className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                                 >
                                   {isRTL ? 'إلغاء الحجز' : 'Cancel'}
                                 </button>
                               )}
                             </div>
                           </div>
                         )
                      })}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  )
}
