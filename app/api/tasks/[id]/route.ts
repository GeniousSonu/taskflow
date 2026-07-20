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

  const { id } = await params

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true, role: true } } } },
      reporter: { select: { id: true, name: true, color: true } },
      subtasks: { orderBy: { order: 'asc' } },
      comments: {
        include: { author: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: 'asc' },
      },
      labels: { include: { label: true } },
      activityLogs: {
        include: { user: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const userId = (session.user as any).id

  const current = await prisma.task.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { status, priority, progress, title, description } = body

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(progress !== undefined && { progress }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
      subtasks: { select: { id: true, completed: true, progress: true } },
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
  })

  // Log activity
  if (status && status !== current.status) {
    await prisma.activityLog.create({
      data: {
        type: 'STATUS_CHANGED',
        description: `changed status from ${current.status} to ${status}`,
        taskId: id,
        userId,
      },
    })
  }
  if (progress !== undefined && progress !== current.progress) {
    await prisma.activityLog.create({
      data: {
        type: 'PROGRESS_UPDATED',
        description: `updated progress from ${current.progress}% → ${progress}%`,
        taskId: id,
        userId,
      },
    })
  }

  return NextResponse.json(task)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
