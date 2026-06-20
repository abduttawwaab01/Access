"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

export default function SuperAdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/superadmin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", password }) })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      localStorage.setItem("sa_token", data.token)
      router.push("/superadmin")
    } else {
      setError("Invalid password")
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0f] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Super Admin</h1>
          <p className="text-sm text-zinc-500">Authorized personnel only</p>
        </div>
        <input
          type="password"
          placeholder="Enter super admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500"
          autoFocus
        />
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Access Dashboard"}
        </button>
      </form>
    </div>
  )
}
