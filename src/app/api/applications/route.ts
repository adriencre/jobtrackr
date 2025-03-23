import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// GET: Récupérer toutes les candidatures
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { appliedAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('[GET /applications]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Ajouter une nouvelle candidature
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    const body = await req.json()

    const application = await prisma.application.create({
      data: {
        company: body.company,
        position: body.position,
        contract: body.contract,
        status: body.status,
        link: body.link,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        tags: body.tags.join(','),
        notes: body.notes,
        appliedAt: new Date(body.appliedAt),
        user: {
          connect: { id: user.id },
        },
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('[POST /applications]', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
