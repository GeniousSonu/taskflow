'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket'
import { useAppStore } from '@/lib/store'

export function RealtimeManager() {
  const { data: session } = useSession()
  const { updateTask, setOnlineUsers, addTypingUser, removeTypingUser } = useAppStore()

  useEffect(() => {
    if (!session?.user) return

    connectSocket()
    const socket = getSocket()

    const workspaceId = 'blue-lane-cabinetry'
    const userId = (session.user as any).id || session.user.email
    const userName = session.user.name || 'User'

    socket.emit('join-workspace', { workspaceId, userId, userName })

    socket.on('workspace-presence', (users: string[]) => {
      setOnlineUsers(users)
    })

    socket.on('user-typing', ({ userId, userName, context }) => {
      addTypingUser({ userId, userName, context })
    })

    socket.on('user-stopped-typing', ({ userId }) => {
      removeTypingUser(userId)
    })

    socket.on('task-sync', (task) => {
      updateTask(task)
    })

    return () => {
      disconnectSocket()
    }
  }, [session, updateTask, setOnlineUsers, addTypingUser, removeTypingUser])

  return null
}
