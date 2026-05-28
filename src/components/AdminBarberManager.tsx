import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id, Doc } from '../../convex/_generated/dataModel'
import CustomDatePicker from './CustomDatePicker'

interface AdminBarberManagerProps {
  isRTL: boolean
  onSnack: (type: 'success' | 'error', title: string, message: string) => void
}

export default function AdminBarberManager({ isRTL, onSnack }: AdminBarberManagerProps) {
  const barbers = useQuery(api.barbers.getAllBarbers)
  const updateBarber = useMutation(api.barbers.updateBarber)

  const [editingBarber, setEditingBarber] = useState<Doc<'barbers'> | null>(null)
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null)
  
  // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBarber) return
    try {
      await updateBarber({
        id: editingBarber._id,
        isActive: editingBarber.isActive,
        availableDays: editingBarber.availableDays,
        startDate: editingBarber.startDate,
        endDate: editingBarber.endDate,
      })
      onSnack('success', isRTL ? 'تم الحفظ' : 'Saved', isRTL ? 'تم تحديث بيانات الحلاق بنجاح' : 'Barber updated successfully')
      setEditingBarber(null)
    } catch (err) {
      onSnack('error', isRTL ? 'خطأ' : 'Error', isRTL ? 'حدث خطأ أثناء الحفظ' : 'Failed to save barber')
    }
  }

  const toggleDay = (dayIndex: number) => {
    if (!editingBarber) return
    const current = editingBarber.availableDays || [0, 1, 2, 3, 4, 5, 6] // default all
    let next: number[]
    if (current.includes(dayIndex)) {
      next = current.filter(d => d !== dayIndex)
    } else {
      next = [...current, dayIndex]
    }
    setEditingBarber({ ...editingBarber, availableDays: next.sort() })
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden w-full">
      <h3 className={`text-white font-bold text-xl mb-6 flex items-center gap-3 ${isRTL ? 'font-arabic' : 'font-english'}`}>
        <span className="text-accent text-2xl">✂️</span>
        {isRTL ? 'إدارة الحلاقين' : 'Barbers Management'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers?.map((barber) => (
          <div key={barber._id} className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative">
            <div className="flex items-center gap-4">
              <img src={barber.photoUrl} alt="Barber" className="w-16 h-16 rounded-full object-cover border-2 border-accent/30" />
              <div>
                <h4 className="text-white font-bold">{isRTL ? barber.nameAr : barber.nameEn}</h4>
                <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold ${barber.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {barber.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'مخفي' : 'Hidden')}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setEditingBarber(barber)}
              className="w-full py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all font-bold text-sm"
            >
              {isRTL ? 'تعديل الإعدادات' : 'Edit Settings'}
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingBarber && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#16161f] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <h4 className={`text-white font-black text-xl mb-6 ${isRTL ? 'font-arabic' : 'font-english'}`}>
                {isRTL ? 'إعدادات الحلاق' : 'Barber Settings'} - {isRTL ? editingBarber.nameAr : editingBarber.nameEn}
              </h4>

              <form onSubmit={handleUpdate} className="space-y-6">
                
                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                  <span className="text-white font-bold text-sm">
                    {isRTL ? 'إظهار في الموقع' : 'Show on Website'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={editingBarber.isActive} onChange={e => setEditingBarber({...editingBarber, isActive: e.target.checked})} />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div>
                  <label className="text-white font-bold text-sm mb-3 block">
                    {isRTL ? 'أيام العمل' : 'Working Days'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const isSelected = (editingBarber.availableDays || [0, 1, 2, 3, 4, 5, 6]).includes(dayIndex);
                      return (
                        <button
                          key={dayIndex}
                          type="button"
                          onClick={() => toggleDay(dayIndex)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          {isRTL ? daysAr[dayIndex] : daysEn[dayIndex]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-white font-bold text-sm mb-3 block">
                    {isRTL ? 'فترة الظهور في الموقع' : 'Visibility Period'}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setActiveDatePicker('start')} className="bg-black/40 border border-white/5 p-3 rounded-xl cursor-pointer hover:border-accent/30 transition-all text-center">
                      <div className="text-[10px] text-white/40 mb-1">{isRTL ? 'من تاريخ' : 'Start Date'}</div>
                      <div className="text-sm font-bold text-white">{editingBarber.startDate || (isRTL ? 'غير محدد' : 'Not set')}</div>
                    </div>
                    <div onClick={() => setActiveDatePicker('end')} className="bg-black/40 border border-white/5 p-3 rounded-xl cursor-pointer hover:border-accent/30 transition-all text-center">
                      <div className="text-[10px] text-white/40 mb-1">{isRTL ? 'إلى تاريخ' : 'End Date'}</div>
                      <div className="text-sm font-bold text-white">{editingBarber.endDate || (isRTL ? 'غير محدد' : 'Not set')}</div>
                    </div>
                  </div>
                  {(editingBarber.startDate || editingBarber.endDate) && (
                    <button type="button" onClick={() => setEditingBarber({...editingBarber, startDate: undefined, endDate: undefined})} className="mt-2 text-[10px] text-red-400 hover:text-red-300">
                      {isRTL ? 'إلغاء فترة الظهور' : 'Clear Period'}
                    </button>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingBarber(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all border border-white/10">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit"
                    className="flex-1 py-4 rounded-2xl bg-accent text-primary font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-accent/20">
                    {isRTL ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Date Picker Modal - render on top of the edit modal */}
            <AnimatePresence>
              {activeDatePicker && (
                <CustomDatePicker
                  selectedDate={
                    activeDatePicker === 'start'
                      ? editingBarber.startDate || new Date().toISOString().split('T')[0]
                      : editingBarber.endDate || new Date().toISOString().split('T')[0]
                  }
                  onSelect={(date) => {
                    if (activeDatePicker === 'start') setEditingBarber({ ...editingBarber, startDate: date })
                    else setEditingBarber({ ...editingBarber, endDate: date })
                    setActiveDatePicker(null)
                  }}
                  onClose={() => setActiveDatePicker(null)}
                  isRTL={isRTL}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
