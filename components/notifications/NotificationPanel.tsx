'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, CheckSquare, AtSign, Calendar, Zap } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatRelative } from '@/lib/utils'

const NOTIF_ICONS: Record<string, any> = {
  MENTION: AtSign,
  DUE_DATE: Calendar,
  ASSIGNED: Zap,
  MOVED: CheckSquare,
  COMPLETED: CheckSquare,
}

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient()

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      return res.json()
    },
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
        style={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 25% 18%)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'hsl(222 25% 16%)' }}>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: 'hsl(239 84% 72%)' }} />
            <span className="font-semibold text-sm text-white">Notifications</span>
          </div>
          <button onClick={onClose} style={{ color: 'hsl(215 15% 45%)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="w-8 h-8" style={{ color: 'hsl(215 15% 35%)' }} />
              <p className="text-sm" style={{ color: 'hsl(215 15% 45%)' }}>All caught up!</p>
            </div>
          )}

          {notifications?.map((n: any) => {
            const Icon = NOTIF_ICONS[n.type] || Bell
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead.mutate(n.id)}
                className="flex gap-3 p-4 transition-colors cursor-pointer hover:bg-white/5"
                style={n.read ? {} : { background: 'rgba(99,102,241,0.05)', borderLeft: '3px solid hsl(239 84% 67%)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: n.read ? 'hsl(222 35% 14%)' : 'rgba(99,102,241,0.15)' }}>
                  <Icon className="w-4 h-4" style={{ color: n.read ? 'hsl(215 15% 45%)' : 'hsl(239 84% 72%)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{n.title}</div>
                  <div className="text-xs mt-0.5 line-clamp-2" style={{ color: 'hsl(215 20% 60%)' }}>{n.message}</div>
                  <div className="text-xs mt-1" style={{ color: 'hsl(215 15% 40%)' }}>{formatRelative(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'hsl(239 84% 67%)' }} />
                )}
              </div>
            )
          })}
        </div>

        <div className="p-3 border-t" style={{ borderColor: 'hsl(222 25% 16%)' }}>
          <button className="w-full text-xs py-2 rounded-lg text-center transition-colors"
            style={{ color: 'hsl(239 84% 72%)', background: 'rgba(99,102,241,0.08)' }}>
            Mark all as read
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
