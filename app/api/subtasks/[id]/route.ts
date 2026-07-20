import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { completed, status, progress } = body

  const subtask = await prisma.subtask.update({
    where: { id },
    data: {
      ...(completed !== undefined && { completed }),
      ...(status !== undefined && { status }),
      ...(progress !== undefined && { progress }),
    },
  })

  // Recalculate parent task progress
  const siblings = await prisma.subtask.findMany({
    where: { taskId: subtask.taskId },
  })
  const completedCount = siblings.filter(s => s.completed).length
  const newProgress = siblings.length > 0 ? Math.round((completedCount / siblings.length) * 100) : 0

  await prisma.task.update({
    where: { id: subtask.taskId },
    data: { progress: newProgress },
  })

  return NextResponse.json(subtask)
}
