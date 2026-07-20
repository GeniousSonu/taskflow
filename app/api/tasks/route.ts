import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')
  const projectId = searchParams.get('projectId')

  if (channelId) {
    const tasks = await prisma.task.findMany({
      where: { channelId },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
        subtasks: { select: { id: true, completed: true, progress: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(tasks)
  }

  if (projectId) {
    const tasks = await prisma.task.findMany({
      where: { channel: { projectId } },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
        subtasks: { select: { id: true, completed: true, progress: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(tasks)
  }

  // Fallback to Blue Lane project if nothing is specified
  const project = await prisma.project.findFirst({
    where: { slug: 'blue-lane-cabinetry' },
  })
  if (!project) return NextResponse.json([])

  const tasks = await prisma.task.findMany({
    where: { channel: { projectId: project.id } },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
      subtasks: { select: { id: true, completed: true, progress: true } },
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, priority, status, dueDate, estimatedHours, assigneeIds, channelId } = body

  let targetChannelId = channelId
  if (!targetChannelId) {
    const project = await prisma.project.findFirst({
      where: { slug: 'blue-lane-cabinetry' },
      include: { channels: true },
    })
    if (!project || !project.channels[0]) {
      return NextResponse.json({ error: 'No channel found' }, { status: 404 })
    }
    targetChannelId = project.channels[0].id
  }

  const maxOrder = await prisma.task.aggregate({
    where: { channelId: targetChannelId },
    _max: { order: true },
  })

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      channelId: targetChannelId,
      reporterId: (session.user as any).id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours || undefined,
      order: (maxOrder._max.order ?? 0) + 1,
      assignees: assigneeIds?.length
        ? { create: assigneeIds.map((userId: string) => ({ userId })) }
        : undefined,
    },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, color: true } } } },
      subtasks: true,
      labels: { include: { label: true } },
      _count: { select: { comments: true } },
    },
  })

  await prisma.activityLog.create({
    data: {
      type: 'TASK_CREATED',
      description: `created this task`,
      taskId: task.id,
      userId: (session.user as any).id,
    },
  })

  return NextResponse.json(task, { status: 201 })
}
