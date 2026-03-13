import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { role, active } = body
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role !== undefined && { role }),
        ...(active !== undefined && { active }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Prevent self-deletion
  if (params.id === session.userId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted' })
}
