'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getPusherClient, disconnectPusher } from '@/lib/pusher-client'
import { useAppStore } from '@/lib/store'

export function RealtimeManager() {
  const { data: session } = useSession()
  const { updateTask, addTask, removeTask } = useAppStore()

  useEffect(() => {
    // Only connect when user is authenticated
    if (!session?.user) return

    // Skip on server (SSR safety)
    if (typeof window === 'undefined') return

    const pusher = getPusherClient()
    if (!pusher) return

    const channel = pusher.subscribe('presence-workspace')

    // Real-time task updates from other users
    channel.bind('task-updated', (data: any) => {
      updateTask(data)
    })

    channel.bind('task-created', (data: any) => {
      addTask(data)
    })

    channel.bind('task-deleted', (data: { id: string }) => {
      removeTask(data.id)
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe('presence-workspace')
      disconnectPusher()
    }
  }, [session, updateTask, addTask, removeTask])

  return null
}
