'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Camera, Sparkles, User as UserIcon, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface ProfileModalProps {
  user: { id: string; name: string; email: string; color?: string; role: string; department?: string; avatar?: string }
  onClose: () => void
}

const EMOJI_DPS = ['⚡', '🚀', '💻', '🎨', '🛠️', '👑', '🎯', '🔥', '🏆', '💎', '🦁', '🦉']
const COLOR_PRESETS = ['#6366f1', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4']

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const { update: updateSession } = useSession()
  const queryClient = useQueryClient()

  const [name, setName] = useState(user.name || '')
  const [department, setDepartment] = useState(user.department || '')
  const [color, setColor] = useState(user.color || '#6366f1')
  const [avatar, setAvatar] = useState(user.avatar || 'SI')
  const [imageUrl, setImageUrl] = useState(user.avatar?.startsWith('http') || user.avatar?.startsWith('data:') ? user.avatar : '')

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const selectedAvatar = imageUrl.trim() ? imageUrl.trim() : avatar
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          department: department.trim(),
          color,
          avatar: selectedAvatar,
        }),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: async (updatedData) => {
      await updateSession({
        ...user,
        name: updatedData.name,
        color: updatedData.color,
      })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate()
  }

  const isImageAvatar = avatar.startsWith('http') || avatar.startsWith('data:')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: 'hsl(222 40% 10%)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Profile Settings</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Avatar Preview & Selection */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-xl ring-4 ring-white/10 overflow-hidden relative"
                style={{ background: color }}
              >
                {imageUrl.trim() ? (
                  <img src={imageUrl.trim()} alt="Avatar" className="w-full h-full object-cover" />
                ) : isImageAvatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatar}</span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">Choose an Emoji or Profile Image</span>
            </div>

            {/* Emoji Quick Picker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Emoji Avatars</label>
              <div className="flex flex-wrap gap-2 justify-center p-2 rounded-xl bg-white/5 border border-white/10">
                {EMOJI_DPS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setAvatar(emoji); setImageUrl('') }}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${avatar === emoji && !imageUrl ? 'bg-indigo-600 scale-110 shadow-lg' : 'hover:bg-white/10'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image URL / Data */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.png"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avatar Color</label>
              <div className="flex gap-2">
                {COLOR_PRESETS.map(hex => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color === hex ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ background: hex }}
                  >
                    {color === hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Development / Design"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Profile
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
