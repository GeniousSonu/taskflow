import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

if (!secret && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ [NextAuth Warning]: NEXTAUTH_SECRET is not set in environment variables!')
}

export const authOptions: NextAuthOptions = {
  secret: secret || 'default-dev-secret-key-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials in request')
          return null
        }

        try {
          if (!process.env.DATABASE_URL) {
            console.error('[NextAuth Error] DATABASE_URL environment variable is missing!')
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.warn(`[NextAuth Warning] User not found: "${credentials.email}"`)
            return null
          }

          if (!user.password) {
            console.warn(`[NextAuth Warning] User "${credentials.email}" has no password set`)
            return null
          }

          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) {
            console.warn(`[NextAuth Warning] Invalid password for user: "${credentials.email}"`)
            return null
          }

          console.log(`[NextAuth Success] User authenticated: ${user.email} (Role: ${user.role})`)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.avatar,
            color: user.color,
            role: user.role,
          }
        } catch (error) {
          console.error('[NextAuth Exception during authorize]:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: secret || 'default-dev-secret-key-change-in-production',
  },
  pages: {
    signIn: '/login',
    error: '/login', // Prevents NextAuth default generic error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.color = (user as any).color
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).color = token.color
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
