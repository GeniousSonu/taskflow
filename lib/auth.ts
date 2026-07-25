import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

if (process.env.NODE_ENV === 'production') {
  if (!secret) {
    console.error('🚨 [CRITICAL CONFIG ERROR]: NEXTAUTH_SECRET is missing in environment variables!')
  }
  if (!process.env.DATABASE_URL) {
    console.error('🚨 [CRITICAL CONFIG ERROR]: DATABASE_URL is missing in environment variables!')
  }
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https://')

export const authOptions: NextAuthOptions = {
  secret: secret || 'default-dev-secret-key-change-in-production',
  useSecureCookies: isProduction,
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

          const trimmedIdentifier = credentials.email.trim()
          
          // Match by email or name (case-insensitive fallback)
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: trimmedIdentifier },
                { email: trimmedIdentifier.toLowerCase() },
                { name: trimmedIdentifier },
              ],
            },
          })

          // Production Auto-Provisioning Guard: If database is empty or admin user is missing,
          // automatically seed the default admin account when admin credentials are used.
          if (!user && (trimmedIdentifier.toLowerCase() === 'admin' || trimmedIdentifier.toLowerCase() === 'sahinur@ibarts.in')) {
            console.log('[NextAuth] Admin user missing in production DB. Auto-seeding default admin account...')
            const hashedPassword = await bcrypt.hash('admin', 10)
            user = await prisma.user.create({
              data: {
                name: 'Sahinur Islam',
                email: 'admin',
                password: hashedPassword,
                role: 'ADMIN',
                color: '#6366f1',
                department: 'Management',
                avatar: 'SI',
              },
            })
            console.log('[NextAuth] Default admin account successfully auto-created!')
          }

          if (!user) {
            console.warn(`[NextAuth Warning] User not found matching: "${credentials.email}"`)
            return null
          }

          if (!user.password) {
            console.warn(`[NextAuth Warning] User "${user.email}" has no password set`)
            return null
          }

          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) {
            console.warn(`[NextAuth Warning] Invalid password for user: "${user.email}"`)
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
    error: '/login',
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
