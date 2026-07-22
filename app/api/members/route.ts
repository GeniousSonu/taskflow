import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, color: true, role: true, department: true, avatar: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentRole = (session.user as any).role
  if (currentRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden. Admin permission required to add users.' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, role, department, color, avatar } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })

  const bcrypt = await import('bcryptjs')
  const password = await bcrypt.hash('password123', 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: (role || 'MEMBER').toUpperCase(),
      department: department || 'Development',
      color: color || '#6366f1',
      avatar: avatar || name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      password,
    },
    select: { id: true, name: true, email: true, color: true, role: true, department: true, avatar: true },
  })

  return NextResponse.json(user, { status: 201 })
}
