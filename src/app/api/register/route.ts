// app/api/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' }, 
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' }, 
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)
    
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}