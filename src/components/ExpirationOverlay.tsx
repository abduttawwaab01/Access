"use client"

import { useEffect, useState } from "react"
import { Clock, ShieldAlert, ExternalLink } from "lucide-react"

const SUPER_ADMIN_WHATSAPP = "+2349152929772"

export function ExpirationOverlay() {
  const [expired, setExpired] = useState(false)
  const [expirationDate, setExpirationDate] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/school")
      .then((r) => r.json())
      .then((data) => {
        const settings = data.schoolSettings || data
        if (settings.expirationDate) {
          const expDate = new Date(settings.expirationDate)
          if (expDate < new Date()) {
            setExpired(true)
            setExpirationDate(settings.expirationDate)
          }
        }
      })
      .catch(() => {})
  }, [])

  if (!expired) return null

  const waMessage = encodeURIComponent(
    `Hello Portal Administrator, our school subscription has expired (expired: ${new Date(expirationDate!).toLocaleDateString()}). Please help us renew our subscription. Thank you.`
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="mx-4 max-w-md rounded-2xl border border-red-500/30 bg-gradient-to-b from-zinc-900 to-black p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Access Expired</h2>
        <p className="mb-1 text-sm text-zinc-400">
          Your school subscription expired on{" "}
          <span className="font-semibold text-zinc-300">{expirationDate ? new Date(expirationDate).toLocaleDateString() : "an unknown date"}</span>.
        </p>
        <p className="mb-6 text-sm text-zinc-500">
          All services have been suspended. Please contact the Portal Administrator to renew your subscription.
        </p>
        <a
          href={`https://wa.me/${SUPER_ADMIN_WHATSAPP}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500"
        >
          <ExternalLink className="h-4 w-4" />
          Contact Administrator on WhatsApp
        </a>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <Clock className="h-3 w-3" />
          Renew to restore access immediately
        </div>
      </div>
    </div>
  )
}
