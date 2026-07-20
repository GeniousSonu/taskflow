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
  const { content } = await req.json()
  const userId = (session.user as any).id

  const comment = await prisma.comment.create({
    data: { content, taskId, authorId: userId },
    include: { author: { select: { id: true, name: true, color: true } } },
  })

  await prisma.activityLog.create({
    data: {
      type: 'COMMENT_ADDED',
      description: 'added a comment',
      taskId,
      userId,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
