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
  const { name, email, password: userPassword, role, department, color, avatar } = body

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and Email or Username are required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (existing) return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 })

  const bcrypt = await import('bcryptjs')
  // Default password is 'admin' if not provided
  const hashedPassword = await bcrypt.hash(userPassword || 'admin', 10)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      role: (role || 'MEMBER').toUpperCase(),
      department: department || 'Development',
      color: color || '#6366f1',
      avatar: avatar || name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, color: true, role: true, department: true, avatar: true },
  })

  return NextResponse.json(user, { status: 201 })
}
