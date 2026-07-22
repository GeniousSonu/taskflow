import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { name, department, color, avatar } = body

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(department !== undefined && { department }),
      ...(color !== undefined && { color }),
      ...(avatar !== undefined && { avatar }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      color: true,
      role: true,
      department: true,
      avatar: true,
    },
  })

  return NextResponse.json(updatedUser)
}
