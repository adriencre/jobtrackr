// app/api/auth/[...nextauth]/route.ts

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { compare } from "bcryptjs"
import NextAuth from "next-auth"

const logError = (message: string, error?: any) => {
  console.error(`[AUTH ERROR] ${message}`, error || "")
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logError("Missing credentials")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          logError("User not found or missing password", { email: credentials.email })
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          logError("Invalid password", { email: credentials.email })
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
    })
  ],
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      logError(`${code}: ${JSON.stringify(metadata)}`)
    },
    warn(code) {
      console.warn(`[AUTH WARNING] ${code}`)
    },
    debug(code, metadata) {
      console.log(`[AUTH DEBUG] ${code}`, metadata)
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("[AUTH] Sign in attempt:", {
        user: user?.email,
        provider: account?.provider,
        error: account?.error
      })

      if (account?.error) {
        logError(`Provider error: ${account.error}`, account)
        return false
      }

      return true
    },
    async jwt({ token, user, account }) {
      console.log("[AUTH] JWT callback:", {
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider
      })

      if (user) {
        token.id = user.id
      }

      return token
    },
    async session({ session, token }) {
      console.log("[AUTH] Session callback:", {
        hasSession: !!session,
        hasToken: !!token
      })

      if (session.user) {
        session.user.id = token.id as string
      }

      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
