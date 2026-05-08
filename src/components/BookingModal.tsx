import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  barberId: Id<'barbers'>
  barberNameAr: string
  barberNameEn: string
  date: string
  timeSlot: string
  onConfirmed: () => void
}

interface FormData {
  name: string
  age: string
  phone: string
  email: string
  otp: string
}

interface FormErrors {
  name?: string
  age?: string
  phone?: string
  email?: string
  otp?: string
}

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/

function validate(data: FormData, t: TFunction): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = t('modal.nameMin')
  } else if (data.name.trim().length > 60) {
    errors.name = t('modal.nameMax')
  }
  const age = Number(data.age)
  if (!data.age || isNaN(age) || age < 5 || age > 99) {
    errors.age = t('modal.ageRange')
  }
  if (!EGYPT_PHONE_REGEX.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = t('modal.phoneInvalid')
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email.trim().toLowerCase())) {
    errors.email = t('modal.emailInvalid')
  }
  return errors
}

function formatDate(dateStr: string, isRTL: boolean): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type ModalState = 'form' | 'otp' | 'loading' | 'success' | 'error'

export default function BookingModal({
  isOpen,
  onClose,
  barberId,
  barberNameAr,
  barberNameEn,
  date,
  timeSlot,
  onConfirmed,
}: BookingModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [form, setForm] = useState<FormData>({ name: '', age: '', phone: '', email: '', otp: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [modalState, setModalState] = useState<ModalState>('form')
  const [serverError, setServerError] = useState('')

  const drawerRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const createAppointment = useMutation(api.appointments.createAppointment)

  const sendOtpEmail = useAction(api.reminders.sendOtpEmail)
  const verifyOtp = useMutation(api.auth.verifyOtp)





  // T-51: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // T-51: Focus first input when modal opens
  useEffect(() => {
    if (isOpen && modalState === 'form') {
      setTimeout(() => firstInputRef.current?.focus(), 350) // after spring animation
    }
  }, [isOpen, modalState])

  const handleClose = () => {
    setErrors({})
    setModalState('form')
    setServerError('')
    onClose()
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form, t)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setModalState('loading')
    try {
      await sendOtpEmail({
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\s/g, ''),
      })
      setModalState('otp')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setServerError(msg || t('modal.genericError'))
      setModalState('error')
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.otp.length !== 6) {
      setErrors({ otp: t('modal.otpInvalid') })
      return
    }
    setErrors({})
    setModalState('loading')
    try {
      const userId = await verifyOtp({
        email: form.email.trim().toLowerCase(),
        code: form.otp,
        phone: form.phone.replace(/\s/g, ''),
      })
      await createAppointment({
        barberId,
        date,
        timeSlot,
        customerName: form.name.trim(),
        customerAge: Number(form.age),
        customerPhone: form.phone.replace(/\s/g, ''),
        customerEmail: form.email.trim().toLowerCase(),
        userId: userId ?? undefined,
        wantsReminder: true,
      })
      setModalState('success')



      onConfirmed()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('EXPIRED_OTP') || msg.includes('INVALID_OTP')) {
        setErrors({ otp: t('modal.otpInvalid') })
        setModalState('otp')
      } else if (msg.includes('USER_BLOCKED')) {
        setServerError(isRTL 
          ? 'تم حظرك من الموقع. يرجى التواصل مع الإدارة عبر الواتساب: 01000823374' 
          : 'You have been blocked from this site. Please contact admin via WhatsApp: 01000823374')
        setModalState('error')
      } else {
        setServerError(msg.includes('SLOT_TAKEN') ? t('modal.slotTaken') : t('modal.genericError'))
        setModalState('error')
      }
    }
  }

  const inputClass = (hasError: boolean) => `
    w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm
    placeholder:text-surface/30 outline-none transition-all duration-200
    focus:ring-1 focus:ring-accent focus:border-accent
    ${isRTL ? 'font-arabic text-right' : 'font-english text-left'}
    ${hasError ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 hover:border-white/20'}
  `

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            id="booking-modal-backdrop"
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            id="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('modal.title')}
            className="fixed bottom-0 inset-x-0 z-50 bg-[#1a1a2e] rounded-t-3xl
                       border-t border-white/10 max-h-[90vh] overflow-y-auto"
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* ── SUCCESS STATE ── */}
              {modalState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5 text-4xl"
                  >
                    ✅
                  </motion.div>
                  <h2 className={`text-white text-xl font-bold mb-2 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t('modal.successTitle')}
                  </h2>
                  <p className={`text-surface/50 text-sm mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t('modal.successSubtitle')}
                  </p>

                  {/* Warning Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-xs leading-relaxed font-medium flex flex-col items-center gap-3 ${isRTL ? 'font-arabic' : 'font-english'}`}
                  >
                    <p className="text-center">{t('modal.successWarning')}</p>
                    <a
                      href="https://wa.me/201000823374"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      <span dir="ltr">010 00823374</span>
                    </a>
                  </motion.div>

                  {/* Booking summary card */}
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm space-y-3 mb-6">
                    {[
                      { label: t('modal.barberLabel'), value: isRTL ? barberNameAr : barberNameEn },
                      { label: t('modal.dateLabel'),   value: formatDate(date, isRTL) },
                      { 
                        label: t('modal.timeLabel'),   
                        value: isRTL 
                          ? (timeSlot.startsWith('Waiting') ? timeSlot.replace('Waiting', 'انتظار') : timeSlot.replace(' AM', '').replace(' PM', '')) 
                          : timeSlot 
                      },
                      { label: t('modal.nameLabel'),   value: form.name },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className={`text-surface/40 ${isRTL ? 'font-arabic' : 'font-english'}`}>{row.label}</span>
                        <span className={`text-white font-medium ${isRTL ? 'font-arabic' : 'font-english'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Two restored squares */}
                  <div className="grid grid-cols-2 gap-3 mb-4 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center justify-center gap-2 text-orange-400 bg-orange-500/10 py-4 px-3 rounded-2xl border border-orange-500/20 shadow-sm text-center"
                    >
                      <span className="text-2xl animate-pulse">📸</span>
                      <span className={`text-[10px] font-bold leading-tight ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {isRTL ? 'يُرجى أخذ لقطة شاشة (Screenshot) للتأكيد' : 'Take a screenshot to confirm'}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col items-center justify-center gap-2 text-blue-400 bg-blue-500/10 py-4 px-3 rounded-2xl border border-blue-500/20 shadow-sm text-center"
                    >
                      <span className="text-2xl">⏰</span>
                      <span className={`text-[10px] font-bold leading-tight ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {isRTL ? 'يُرجى الحضور قبل الموعد بـ 10 دقائق' : 'Please arrive 10 mins early'}
                      </span>
                    </motion.div>
                  </div>

                  {/* Email Notification Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full flex flex-col items-center justify-center gap-3 py-8 px-5 rounded-[2rem] border border-emerald-500/20 bg-[#111122]/50 backdrop-blur-md transition-all duration-300 mb-6 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                    <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] mb-1">📧</span>
                    <div className="flex flex-col gap-1.5 items-center relative z-10">
                      <span className={`text-emerald-400 text-lg font-bold leading-tight ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {isRTL ? 'سيصلك تذكير على الإيميل قبل الموعد بـ 15 دقيقة' : 'Email reminder 15m before'}
                      </span>
                      <span className={`text-emerald-400/70 text-xs font-medium ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {form.email}
                      </span>
                    </div>
                  </motion.div>

                  <button
                    onClick={handleClose}
                    className={`w-full py-3 rounded-xl bg-accent text-primary font-bold cursor-pointer
                      ${isRTL ? 'font-arabic' : 'font-english'}`}
                  >
                    {t('common.close')}
                  </button>
                </motion.div>
              )}

              {/* ── ERROR STATE ── */}
              {modalState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-5 text-4xl">❌</div>
                  <h2 className={`text-white text-xl font-bold mb-2 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t('modal.errorTitle')}
                  </h2>
                  <p className={`text-red-400 text-sm mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>{serverError}</p>
                  <button
                    onClick={() => setModalState('form')}
                    className={`w-full py-3 rounded-xl bg-white/10 text-white font-medium cursor-pointer ${isRTL ? 'font-arabic' : 'font-english'}`}
                  >
                    {t('common.tryAgain')}
                  </button>
                </motion.div>
              )}

              {/* ── OTP STATE ── */}
              {modalState === 'otp' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
                      {t('modal.otpTitle')}
                    </h2>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-surface/60 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className={`text-surface/60 text-sm mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t('modal.otpSubtitle')}
                  </p>

                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6 space-y-3">
                    <p className="text-accent text-[13px] font-arabic text-right leading-relaxed">
                      إذا لم تجد الكود في قائمة البريد الوارد، يرجى الضغط على القائمة الرئيسية واختيار <b>"المهمة"</b> أو <b>"كل البريد"</b>.
                    </p>
                    <div className="h-[1px] bg-accent/10 w-full" />
                    <p className="text-accent/80 text-[11px] font-arabic text-right leading-relaxed">
                      إذا لم تجد الكود في قائمة الـ <b>"inbox"</b>، يرجى الضغط على القائمة الرئيسية واختيار <b>"Important"</b> أو <b>"Spam"</b> أو <b>"All mail"</b>.
                    </p>
                    <div className="h-[1px] bg-accent/10 w-full" />
                    <p className="text-accent/60 text-[10px] font-arabic text-center">
                      الكود صالح لمدة 15 دقيقة فقط
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.otpLabel')}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={form.otp}
                        onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                        placeholder={t('modal.otpPlaceholder')}
                        className={`text-center tracking-widest text-3xl font-bold py-6 ${inputClass(!!errors.otp)}`}
                        dir="ltr"
                        autoComplete="one-time-code"
                      />
                      {errors.otp && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-red-400 text-xs mt-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}
                        >
                          {errors.otp}
                        </motion.p>
                      )}
                    </div>
                    
                    <motion.button
                      type="submit"
                      disabled={form.otp.length !== 6}
                      className={`
                        w-full py-3.5 rounded-xl font-bold text-primary mt-4
                        ${form.otp.length !== 6 ? 'bg-accent/60 cursor-not-allowed' : 'bg-accent cursor-pointer hover:brightness-110'}
                        transition-all duration-200
                        ${isRTL ? 'font-arabic' : 'font-english'}
                      `}
                    >
                      {t('modal.otpVerifyBtn')}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* ── FORM STATE ── */}
              {(modalState === 'form' || (modalState === 'loading' && !form.otp)) && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className={`text-white font-bold text-lg ${isRTL ? 'font-arabic' : 'font-english'}`}>
                      {t('modal.title')}
                    </h2>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-surface/60 hover:bg-white/20 transition-colors cursor-pointer"
                      aria-label={t('common.close')}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Booking summary banner */}
                  <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className={`text-accent text-sm font-semibold ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {isRTL ? barberNameAr : barberNameEn}
                      </p>
                      <p className={`text-surface/50 text-xs mt-0.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {formatDate(date, isRTL)} — {isRTL 
                          ? (timeSlot.startsWith('Waiting') ? timeSlot.replace('Waiting', 'انتظار') : timeSlot.replace(' AM', '').replace(' PM', '')) 
                          : timeSlot}
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleFormSubmit} noValidate className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Name */}
                    <div>
                      <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.nameLabel')}
                      </label>
                      <input
                        id="booking-name-input"
                        ref={firstInputRef}
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t('modal.namePlaceholder')}
                        className={inputClass(!!errors.name)}
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <motion.p
                          id="name-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-red-400 text-xs mt-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}
                          role="alert"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.ageLabel')}
                      </label>
                      <input
                        id="booking-age-input"
                        type="number"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        placeholder={t('modal.agePlaceholder')}
                        min={5}
                        max={99}
                        className={inputClass(!!errors.age)}
                        autoComplete="age"
                        aria-invalid={!!errors.age}
                        aria-describedby={errors.age ? 'age-error' : undefined}
                      />
                      {errors.age && (
                        <motion.p
                          id="age-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-red-400 text-xs mt-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}
                          role="alert"
                        >
                          {errors.age}
                        </motion.p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.emailLabel')}
                      </label>
                      <input
                        id="booking-email-input"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t('modal.emailPlaceholder')}
                        className={inputClass(!!errors.email)}
                        dir="ltr"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-red-400 text-xs mt-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={`block text-surface/60 text-xs mb-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {t('modal.phoneLabel')}
                      </label>
                      <input
                        id="booking-phone-input"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder={t('modal.phonePlaceholder')}
                        className={inputClass(!!errors.phone)}
                        dir="ltr"
                        autoComplete="tel"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <motion.p
                          id="phone-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-red-400 text-xs mt-1.5 ${isRTL ? 'font-arabic' : 'font-english'}`}
                          role="alert"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>

                    {/* Submit */}
                    <motion.button
                      id="booking-submit-btn"
                      type="submit"
                      disabled={modalState === 'loading'}
                      className={`
                        w-full py-3.5 rounded-xl font-bold text-primary mt-2
                        ${modalState === 'loading' ? 'bg-accent/60 cursor-not-allowed' : 'bg-accent cursor-pointer hover:brightness-110'}
                        transition-all duration-200
                        ${isRTL ? 'font-arabic' : 'font-english'}
                      `}
                      whileTap={modalState !== 'loading' ? { scale: 0.98 } : {}}
                    >
                      {modalState === 'loading' ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          {t('modal.bookingBtn')}
                        </span>
                      ) : (
                        t('modal.confirmBtn')
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
