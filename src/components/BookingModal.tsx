import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useMutation } from 'convex/react'
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
}

interface FormErrors {
  name?: string
  age?: string
  phone?: string
}

const EGYPT_PHONE_REGEX = /^01\d{9}$/

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
  return errors
}

function formatDate(dateStr: string, isRTL: boolean): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type ModalState = 'form' | 'loading' | 'success' | 'error'

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

  const [form, setForm] = useState<FormData>({ name: '', age: '', phone: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [modalState, setModalState] = useState<ModalState>('form')
  const [serverError, setServerError] = useState('')
  const drawerRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const createAppointment = useMutation(api.appointments.createAppointment)

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
    setForm({ name: '', age: '', phone: '' })
    setErrors({})
    setModalState('form')
    setServerError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form, t)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setModalState('loading')
    try {
      await createAppointment({
        barberId,
        date,
        timeSlot,
        customerName: form.name.trim(),
        customerAge: Number(form.age),
        customerPhone: form.phone.replace(/\s/g, ''),
      })
      setModalState('success')
      onConfirmed()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setServerError(msg.includes('SLOT_TAKEN') ? t('modal.slotTaken') : t('modal.genericError'))
      setModalState('error')
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
                  <p className={`text-surface/50 text-sm mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                    {t('modal.successSubtitle')}
                  </p>

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

                  {/* Screenshot & Arrival Reminders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center justify-center gap-1.5 text-accent/90 bg-accent/10 py-3 px-3 rounded-xl border border-accent/20 shadow-sm text-center"
                    >
                      <span className="text-xl animate-pulse">📸</span>
                      <span className={`text-xs font-medium leading-relaxed ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {isRTL ? 'يُرجى أخذ لقطة شاشة (Screenshot) للتأكيد' : 'Take a screenshot to confirm'}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col items-center justify-center gap-1.5 text-blue-400 bg-blue-500/10 py-3 px-3 rounded-xl border border-blue-500/20 shadow-sm text-center"
                    >
                      <span className="text-xl">⏰</span>
                      <span className={`text-xs font-medium leading-relaxed ${isRTL ? 'font-arabic' : 'font-english'}`}>
                        {isRTL ? 'يُرجى الحضور قبل الموعد بـ 10 دقائق' : 'Please arrive 10 mins early'}
                      </span>
                    </motion.div>
                  </div>

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

              {/* ── FORM STATE ── */}
              {(modalState === 'form' || modalState === 'loading') && (
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
                  <form onSubmit={handleSubmit} noValidate className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
