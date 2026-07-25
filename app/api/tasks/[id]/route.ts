import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { broadcastTaskUpdate, broadcastTaskDeleted } from '@/lib/broadcast'

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
  const userRole = (session.user as any).role

  const current = await prisma.task.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const canEdit = userRole === 'ADMIN' || current.reporterId === userId
  if (!canEdit) {
    return NextResponse.json(
      { error: 'Permission denied. Tasks can only be edited by their creator or an Admin.' },
      { status: 403 }
    )
  }

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

  // Activity logging
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

  // Broadcast update to all clients
  await broadcastTaskUpdate(task)

  return NextResponse.json(task)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = (session.user as any).id
  const userRole = (session.user as any).role

  const current = await prisma.task.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const canDelete = userRole === 'ADMIN' || current.reporterId === userId
  if (!canDelete) {
    return NextResponse.json(
      { error: 'Permission denied. Tasks can only be deleted by their creator or an Admin.' },
      { status: 403 }
    )
  }

  await prisma.task.delete({ where: { id } })

  // Broadcast deletion to all clients
  await broadcastTaskDeleted(id)

  return NextResponse.json({ success: true })
}
