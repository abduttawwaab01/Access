"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { captureElement } from "@/lib/capture"
import { Download, QrCode, Building2, Copy, Check } from "lucide-react"

interface SchoolData {
  name: string
  shortName?: string
  phone?: string
  email?: string
  address?: string
  logo?: string
  schoolQRCode?: string
}

export function SchoolQRCodeDownload() {
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/school")
      .then((r) => r.json())
      .then((data) => { setSchool(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const qrValue = school?.schoolQRCode || JSON.stringify({
    type: "school_attendance",
    school: school?.name || "Access School",
    id: "school_1"
  })

  const handleDownload = async () => {
    if (!qrRef.current) return
    try {
      const canvas = await captureElement(qrRef.current, { scale: 3, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `${(school?.name || "School").replace(/\s+/g, "_")}_Attendance_QR.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("QR code downloaded")
    } catch (err) {
      console.error("QR download error:", err)
      toast.error("Failed to download")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("QR data copied")
  }

  if (loading) return <div className="h-64 rounded-xl bg-muted animate-pulse" />

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4 text-primary" />
            School Attendance QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Download this QR code and display it at the school entrance. Staff scan it to mark their attendance.
          </p>

          <div className="flex justify-center">
            <div ref={qrRef} className="inline-block bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                {school?.logo ? (
                  <img src={school.logo} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 text-gray-400" />
                )}
                <span className="text-sm font-bold text-gray-800">{school?.name || "School"}</span>
              </div>
              <QRCodeSVG value={qrValue} size={180} level="H" includeMargin />
              <p className="text-[10px] text-gray-400 mt-2">Scan to mark attendance</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              <Download className="h-4 w-4 mr-1" /> Download QR
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{copied ? "Copied" : "Copy Data"}</span>
            </Button>
          </div>

          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">QR contains this data</summary>
            <pre className="mt-2 p-2 rounded-lg bg-muted/30 font-mono text-[10px] break-all">{qrValue}</pre>
          </details>
        </CardContent>
      </Card>
    </motion.div>
  )
}
