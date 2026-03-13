import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ProductSchema } from '@/lib/validations'

const productInclude = {
  shelf: {
    include: {
      cabinet: {
        include: {
          room: {
            include: { building: true }
          }
        }
      }
    }
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({ where: { id: params.id }, include: productInclude })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Track view for students
  if (session.role === 'STUDENT') {
    await prisma.productView.create({ data: { userId: session.userId, productId: product.id } })
  }

  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data = ProductSchema.parse(body)
    const product = await prisma.product.update({ where: { id: params.id }, data, include: productInclude })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted' })
}
