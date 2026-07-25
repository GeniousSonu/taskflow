// Server-side Pusher instance — used in API routes to trigger events
import Pusher from 'pusher'

let pusherServerInstance: Pusher | null = null

export function getPusherServer(): Pusher | null {
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    return null
  }

  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    })
  }

  return pusherServerInstance
}

export default getPusherServer
