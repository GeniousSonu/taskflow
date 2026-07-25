// Centralised Pusher broadcast helper — used in API routes to trigger real-time events.
// Replaces socket.io's `io.to(workspaceId).emit(event, data)`.

import { getPusherServer } from '@/lib/pusher-server'

const WORKSPACE_CHANNEL = 'presence-workspace'

export async function broadcastTaskUpdate(task: object) {
  try {
    const pusher = getPusherServer()
    if (!pusher) return
    await pusher.trigger(WORKSPACE_CHANNEL, 'task-updated', task)
  } catch (err) {
    console.error('[Pusher] broadcastTaskUpdate failed:', err)
  }
}

export async function broadcastTaskCreated(task: object) {
  try {
    const pusher = getPusherServer()
    if (!pusher) return
    await pusher.trigger(WORKSPACE_CHANNEL, 'task-created', task)
  } catch (err) {
    console.error('[Pusher] broadcastTaskCreated failed:', err)
  }
}

export async function broadcastTaskDeleted(taskId: string) {
  try {
    const pusher = getPusherServer()
    if (!pusher) return
    await pusher.trigger(WORKSPACE_CHANNEL, 'task-deleted', { id: taskId })
  } catch (err) {
    console.error('[Pusher] broadcastTaskDeleted failed:', err)
  }
}
