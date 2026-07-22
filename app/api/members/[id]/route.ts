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

  const currentRole = (session.user as any).role
  if (currentRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin required.' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, email, role, department, color, avatar } = body

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(department !== undefined && { department }),
      ...(color !== undefined && { color }),
      ...(avatar !== undefined && { avatar }),
    },
    select: { id: true, name: true, email: true, color: true, role: true, department: true, avatar: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentRole = (session.user as any).role
  const currentUserId = (session.user as any).id

  if (currentRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin required.' }, { status: 403 })
  }

  const { id } = await params
  if (id === currentUserId) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
