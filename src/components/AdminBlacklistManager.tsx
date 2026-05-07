import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function AdminBlacklistManager({ isRTL, onSnack }: { isRTL: boolean, onSnack: (type: 'success' | 'error', title: string, msg: string) => void }) {
  const [value, setValue] = useState('')
  const [type, setType] = useState<'email' | 'phone'>('email')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const blockedUsers = useQuery(api.blacklist.list)
  const blockMutation = useMutation(api.blacklist.block)
  const unblockMutation = useMutation(api.blacklist.unblock)

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setIsSubmitting(true)
    try {
      await blockMutation({
        type,
        value: value.trim().toLowerCase(),
        reason: reason.trim() || undefined
      })
      onSnack('success', isRTL ? 'تم الحظر' : 'Blocked', isRTL ? 'تم إضافة المستخدم للقائمة السوداء' : 'User added to blacklist')
      setValue(''); setReason('')
    } catch (err) {
      onSnack('error', isRTL ? 'خطأ' : 'Error', String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnblock = async (id: any) => {
    try {
      await unblockMutation({ id })
      onSnack('success', isRTL ? 'تم فك الحظر' : 'Unblocked', isRTL ? 'تم إزالة المستخدم من القائمة' : 'User removed from blacklist')
    } catch (err) {
      onSnack('error', isRTL ? 'خطأ' : 'Error', String(err))
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Block Form */}
      <div className="bg-[#16161f] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className={`text-lg font-bold text-white mb-4 ${isRTL ? 'font-arabic' : 'font-english'}`}>
          {isRTL ? 'حظر مستخدم جديد' : 'Block New User'}
        </h3>
        <form onSubmit={handleBlock} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-accent/50 outline-none"
            >
              <option value="email">{isRTL ? 'بريد إلكتروني' : 'Email'}</option>
              <option value="phone">{isRTL ? 'رقم هاتف' : 'Phone'}</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'email' ? 'example@mail.com' : '010XXXXXXXX'}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-accent/50 outline-none"
              required
            />
          </div>
          <div className="md:col-span-3">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRTL ? 'السبب (اختياري)' : 'Reason (optional)'}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-accent/50 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || !value}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {isRTL ? 'حظر' : 'Block'}
            </button>
          </div>
        </form>
      </div>

      {/* List of Blocked Users */}
      <div className="bg-[#16161f] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 bg-white/5">
          <h3 className={`font-bold text-white ${isRTL ? 'font-arabic' : 'font-english'}`}>
            {isRTL ? 'قائمة المحظورين' : 'Blacklist'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">{isRTL ? 'النوع' : 'Type'}</th>
                <th className="px-6 py-4">{isRTL ? 'القيمة' : 'Value'}</th>
                <th className="px-6 py-4">{isRTL ? 'السبب' : 'Reason'}</th>
                <th className="px-6 py-4 text-right">{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blockedUsers === undefined ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-white/20">...</td></tr>
              ) : blockedUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-white/20">{isRTL ? 'القائمة فارغة' : 'List is empty'}</td></tr>
              ) : blockedUsers.map(user => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.type === 'email' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/80 font-mono">{user.value}</td>
                  <td className="px-6 py-4 text-sm text-white/40 italic">{user.reason || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleUnblock(user._id)}
                      className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                    >
                      {isRTL ? 'فك الحظر' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
