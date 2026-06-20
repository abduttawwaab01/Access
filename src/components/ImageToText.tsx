"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, Loader2, FileText, X, ScanLine } from "lucide-react"

interface ImageToTextProps {
  onUseText: (text: string) => void
  onClose?: () => void
}

export default function ImageToText({ onUseText, onClose }: ImageToTextProps) {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [extracted, setExtracted] = useState("")
  const [editing, setEditing] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState("")
  const [step, setStep] = useState<"select" | "extract" | "done">("select")

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => { setImage(e.target?.result as string); setStep("extract") }
    reader.readAsDataURL(f)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const extractText = async () => {
    if (!file) return
    setLoading(true)
    setProgress("Initializing OCR engine...")
    try {
      const Tesseract = await import("tesseract.js")
      setProgress("Processing image...")
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text") setProgress(`Recognizing: ${Math.round(m.progress * 100)}%`)
        },
      })
      setExtracted(data.text)
      setEditing(data.text)
      setProgress("")
      setStep("done")
    } catch (err) {
      setProgress("OCR failed. Try a clearer image.")
    }
    setLoading(false)
  }

  const reset = () => { setImage(null); setFile(null); setExtracted(""); setEditing(""); setStep("select"); setProgress("") }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div
              onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary/60 hover:bg-primary/10"
            >
              <input type="file" accept="image/*" onChange={handleInput} className="absolute inset-0 cursor-pointer opacity-0" />
              <div className="mb-3 rounded-xl bg-primary/10 p-3"><Upload className="h-6 w-6 text-primary" /></div>
              <p className="text-sm font-medium">Drop an image here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP — text will be extracted client-side</p>
            </div>
          </motion.div>
        )}

        {step === "extract" && image && (
          <motion.div key="extract" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border bg-muted/30">
              <img src={image} alt="Preview" className="max-h-64 w-full object-contain" />
              <button onClick={reset} className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-background"><X className="h-4 w-4" /></button>
            </div>
            <Button onClick={extractText} disabled={loading} className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {progress}</> : <><ScanLine className="mr-2 h-4 w-4" /> Extract Text</>}
            </Button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {image && (
              <div className="relative overflow-hidden rounded-xl border bg-muted/30">
                <img src={image} alt="Preview" className="max-h-40 w-full object-contain" />
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-green-500"><FileText className="h-4 w-4" /> Extracted {extracted.split(/\s+/).filter(Boolean).length} words</div>
            <textarea
              value={editing} onChange={(e) => setEditing(e.target.value)}
              className="min-h-[180px] w-full rounded-xl border bg-background p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Extracted text appears here..."
            />
            <div className="flex gap-2">
              <Button onClick={() => onUseText(editing)} className="animated-gradient flex-1 border-0 text-white shadow-lg shadow-primary/25">
                <FileText className="mr-2 h-4 w-4" /> Use as Content
              </Button>
              <Button variant="outline" onClick={reset}><X className="h-4 w-4" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
