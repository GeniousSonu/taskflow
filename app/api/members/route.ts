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

  const body = await req.json()
  const { name, email, role, department, color } = body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Member already exists' }, { status: 400 })

  const bcrypt = await import('bcryptjs')
  const password = await bcrypt.hash('password123', 10)

  const user = await prisma.user.create({
    data: { name, email, role: role || 'member', department, color: color || '#6366f1', password },
    select: { id: true, name: true, email: true, color: true, role: true, department: true },
  })

  return NextResponse.json(user, { status: 201 })
}
