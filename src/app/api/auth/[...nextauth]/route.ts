import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { store } from "@/lib/api-store"

const secret = process.env.NEXTAUTH_SECRET || "access-fallback-secret-for-development-only"

const demoUsers: Record<string, { id: string; name: string; email: string; role: string }> = {
  admin: { id: "1", name: "John Admin", email: "admin@school.com", role: "admin" },
  teacher: { id: "2", name: "Sarah Teacher", email: "teacher@school.com", role: "teacher" },
  parent: { id: "3", name: "Mike Parent", email: "parent@school.com", role: "parent" },
  student: { id: "5", name: "Amy Student", email: "student@school.com", role: "student" },
}

const handler = NextAuth({
  secret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        const settings = store.schoolSettings.get()
        if (!settings.loginEnabled) throw new Error("School login is currently disabled")
        if (settings.expirationDate && new Date(settings.expirationDate) < new Date()) throw new Error("School access has expired")
        const { role, email, password } = credentials as Record<string, string>
        if (role && demoUsers[role]) return demoUsers[role]
        if (email === "admin@school.com" && password === "password") return demoUsers.admin
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role
        ;(token as any).id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role
        ;(session.user as any).id = (token as any).id
      }
      return session
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
})

export { handler as GET, handler as POST }
