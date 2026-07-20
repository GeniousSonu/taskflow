import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: taskId } = await params
  const { title } = await req.json()

  const maxOrder = await prisma.subtask.aggregate({
    where: { taskId },
    _max: { order: true },
  })

  const subtask = await prisma.subtask.create({
    data: { title, taskId, order: (maxOrder._max.order ?? 0) + 1 },
  })

  return NextResponse.json(subtask, { status: 201 })
}
