import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/prisma-store"
import bcrypt from "bcryptjs"

const secret = process.env.NEXTAUTH_SECRET || "access-fallback-secret-for-development-only"

const handler = NextAuth({
  secret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        const settings = await db.school.get()
        if (!settings.loginEnabled) throw new Error("School login is currently disabled")
        if (settings.expirationDate && new Date(settings.expirationDate) < new Date()) throw new Error("School access has expired")
        const { email, password } = credentials as Record<string, string>
        if (!email) throw new Error("Email is required")

        const user = await db.users.getByEmail(email)
        if (!user) throw new Error("Invalid credentials")
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error("Invalid credentials")
        const roleMap: Record<string, string> = { admin: "admin", teacher: "teacher", student: "student", parent: "parent" }
        const role = roleMap[user.role] || user.role
        return { id: user.id, name: user.name, email: user.email, role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).role = (user as any).role
        ;(token as any).id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = (token as any).role
        ;(session.user as any).id = (token as any).id
      }
      return session
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
})

export { handler as GET, handler as POST }