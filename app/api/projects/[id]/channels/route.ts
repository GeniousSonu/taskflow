import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: projectId } = await params

  const channels = await prisma.channel.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(channels)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: projectId } = await params
  const body = await req.json()
  const { name, icon, description } = body

  const maxOrder = await prisma.channel.aggregate({
    where: { projectId },
    _max: { order: true },
  })

  const channel = await prisma.channel.create({
    data: {
      name,
      projectId,
      icon: icon || '📂',
      description,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return NextResponse.json(channel, { status: 201 })
}
