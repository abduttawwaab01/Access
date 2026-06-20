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
        const { email, password } = credentials as Record<string, string>
        if (!email) throw new Error("Email is required")

        const staff = store.staff.getByEmail(email)
        if (staff && staff.password === password) {
          return { id: staff.id, name: `${staff.firstName} ${staff.lastName}`, email: staff.email, role: staff.role }
        }

        const student = store.students.getByEmail(email)
        if (student && student.password === password) {
          return { id: student.id, name: `${student.firstName} ${student.lastName}`, email: student.email, role: "student" }
        }

        const parent = store.parents.getByEmail(email)
        if (parent && parent.password === password) {
          return { id: parent.id, name: `${parent.firstName} ${parent.lastName}`, email: parent.email, role: "parent" }
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
