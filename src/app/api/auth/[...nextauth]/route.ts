import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { store } from "@/lib/api-store"

const secret = process.env.NEXTAUTH_SECRET || "access-fallback-secret-for-development-only"

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

        if (role === "admin") {
          const found = store.staff.getByEmail(email || "admin@school.com")
          if (found && found.role === "admin" && found.password === (password || "admin123")) {
            return { id: found.id, name: `${found.firstName} ${found.lastName}`, email: found.email, role: "admin" }
          }
          if (!found && email === "admin@school.com" && password === "admin123") {
            return { id: "1", name: "Admin User", email: "admin@school.com", role: "admin" }
          }
        }

        if (role === "teacher") {
          if (!email) throw new Error("Email is required for teacher login")
          const found = store.staff.getByEmail(email)
          if (found && found.role === "teacher" && found.password === (password || "password123")) {
            return { id: found.id, name: `${found.firstName} ${found.lastName}`, email: found.email, role: "teacher" }
          }
        }

        if (role === "student") {
          if (!email) throw new Error("Email is required for student login")
          const found = store.students.getByEmail(email)
          if (found && found.password === (password || "password123")) {
            return { id: found.id, name: `${found.firstName} ${found.lastName}`, email: found.email, role: "student" }
          }
        }

        if (role === "parent") {
          if (!email) throw new Error("Email is required for parent login")
          const found = store.parents.getByEmail(email)
          if (found && found.password === (password || "password123")) {
            return { id: found.id, name: `${found.firstName} ${found.lastName}`, email: found.email, role: "parent" }
          }
        }

        throw new Error("Invalid credentials")
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
