import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            schoolId: true,
            password: true
          }
        })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image, schoolId: user.schoolId }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.schoolId = (user as any).schoolId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as Record<string, unknown>
        const u = session.user as Record<string, unknown>
        u.id = t.id
        u.role = t.role
        u.schoolId = t.schoolId
      }
      return session
    },
  },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  session: { strategy: "jwt" },
}
