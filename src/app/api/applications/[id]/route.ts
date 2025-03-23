// src/app/api/applications/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Récupérer une candidature par ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('[GET /applications/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer une candidature
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
  
      await prisma.application.delete({
        where: { id: params.id },
      })
  
      return NextResponse.json({ message: 'Candidature supprimée' }, { status: 200 })
    } catch (error) {
      console.error('[DELETE /applications/:id]', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }
  

// PUT: Modifier une candidature
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await req.json()

    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        company: data.company,
        position: data.position,
        contract: data.contract,
        status: data.status,
        link: data.link,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        tags: data.tags.join(','),
        notes: data.notes,
        appliedAt: new Date(data.appliedAt),
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('[PUT /applications/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}