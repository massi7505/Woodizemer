import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  try {
    if (type === 'building') await prisma.building.delete({ where: { id: params.id } })
    else if (type === 'room') await prisma.room.delete({ where: { id: params.id } })
    else if (type === 'cabinet') await prisma.cabinet.delete({ where: { id: params.id } })
    else if (type === 'shelf') await prisma.shelf.delete({ where: { id: params.id } })
    else return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: 'Cannot delete (has children or products)' }, { status: 400 })
  }
}
