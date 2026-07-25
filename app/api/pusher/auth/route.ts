import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPusherServer } from '@/lib/pusher-server'

// Pusher requires POST for channel auth
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pusher = getPusherServer()
  if (!pusher) {
    return NextResponse.json({ error: 'Pusher is not configured' }, { status: 500 })
  }

  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId = params.get('socket_id')
  const channel = params.get('channel_name')

  if (!socketId || !channel) {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 })
  }

  const userId = (session.user as any).id || session.user?.email || 'anonymous'
  const userName = session.user?.name || 'Unknown'

  const authResponse = pusher.authorizeChannel(socketId, channel, {
    user_id: userId,
    user_info: { name: userName },
  })

  return NextResponse.json(authResponse)
}
