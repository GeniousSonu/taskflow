import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, color, emoji, description } = body
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const project = await prisma.project.create({
    data: { name, slug, color, emoji, description },
  })

  return NextResponse.json(project, { status: 201 })
}
