"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Scan, Camera, StopCircle, CheckCircle2 } from "lucide-react"

interface QRScannerProps {
  onScan: (decodedText: string) => void
  onResult?: (result: { type: "student" | "staff" | "school"; id?: string; name?: string }) => void
  title?: string
  description?: string
  autoMark?: boolean
}

export function QRScanner({ onScan, onResult, title = "QR Scanner", description = "Position the QR code within the frame", autoMark = false }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) { try { scannerRef.current.stop() } catch {} }
    }
  }, [])

  const startScanner = async () => {
    setScanning(true)
    try {
      const Html5Qrcode = (await import("html5-qrcode")).Html5Qrcode
      scannerRef.current = new Html5Qrcode("qr-reader-scanner")
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          if (scannerRef.current) { try { scannerRef.current.stop() } catch {} }
          setScanning(false)
          setScanned(decodedText)
          onScan(decodedText)
        },
        () => {}
      )
    } catch (err) {
      console.error(err)
      toast.error("Camera access denied or unavailable")
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) { try { scannerRef.current.stop() } catch {} }
    setScanning(false)
  }

  const resetScanner = () => {
    setScanned(null)
  }

  return (
    <Card className="border-0 glass-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>

        {!scanning && !scanned && (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Scan className="h-9 w-9 text-primary" />
              </div>
            </div>
            <Button onClick={startScanner} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
              <Camera className="h-4 w-4 mr-2" /> Start Camera
            </Button>
          </div>
        )}

        {scanning && (
          <div>
            <div id="qr-reader-scanner" className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" />
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={stopScanner}>
                <StopCircle className="h-4 w-4 mr-1" /> Stop
              </Button>
            </div>
          </div>
        )}

        {scanned && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-sm">QR Code Scanned</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all">{scanned}</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline" size="sm" onClick={resetScanner}>Scan Again</Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
