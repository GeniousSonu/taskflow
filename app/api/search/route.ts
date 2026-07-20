import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (!q) {
    return NextResponse.json({ projects: [], channels: [], tasks: [], members: [] })
  }

  // Search Projects
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    },
    take: 5,
  })

  // Search Channels
  const channels = await prisma.channel.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    },
    include: { project: true },
    take: 5,
  })

  // Search Tasks
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { subtasks: { some: { title: { contains: q } } } },
        { comments: { some: { content: { contains: q } } } },
      ],
    },
    include: { channel: { include: { project: true } } },
    take: 10,
  })

  // Search Members
  const members = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    },
    take: 5,
  })

  return NextResponse.json({ projects, channels, tasks, members })
}
