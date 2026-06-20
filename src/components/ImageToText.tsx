"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Loader2, FileText, X, ScanLine, Clipboard, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"

interface ImageToTextProps {
  onUseText: (text: string) => void
  onClose?: () => void
  multiple?: boolean
}

export default function ImageToText({ onUseText, onClose, multiple = false }: ImageToTextProps) {
  const [images, setImages] = useState<{ dataUrl: string; file: File }[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [extracted, setExtracted] = useState<string[]>([])
  const [editing, setEditing] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState("")
  const [step, setStep] = useState<"select" | "extract" | "done">("select")
  const [copied, setCopied] = useState(false)
  const pasteRef = useRef<HTMLDivElement>(null)
  const [allTexts, setAllTexts] = useState<string[]>([])
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const item = e.clipboardData?.items?.[0]
      if (item && item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) handleFile(file)
      }
    }
    const el = pasteRef.current
    if (el) {
      el.addEventListener("paste", handler)
      return () => el.removeEventListener("paste", handler)
    }
  }, [step])

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImages((prev) => [...prev, { dataUrl, file: f }])
      if (step === "select") {
        setStep("extract")
        setCurrentIdx(0)
      }
    }
    reader.readAsDataURL(f)
  }, [step])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach((f) => { if (f.type.startsWith("image/")) handleFile(f) })
  }, [handleFile])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((f) => { if (f.type.startsWith("image/")) handleFile(f) })
  }, [handleFile])

  const currentFile = images[currentIdx]
  const totalImages = images.length

  const extractText = async (idx?: number) => {
    const i = idx ?? currentIdx
    const file = images[i]?.file
    if (!file) return
    setLoading(true)
    setProgress("Initializing OCR engine...")
    setCurrentIdx(i)
    try {
      const Tesseract = await import("tesseract.js")
      setProgress("Processing image...")
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text") setProgress(`Recognizing: ${Math.round(m.progress * 100)}%`)
        },
      })
      const text = data.text.trim()
      const newExtracted = [...extracted]
      newExtracted[i] = text
      setExtracted(newExtracted)
      if (totalImages === 1 || i === totalImages - 1) {
        const merged = newExtracted.filter(Boolean).join("\n\n---\n\n")
        setEditing(merged)
        setProgress("")
        setStep("done")
      } else {
        setProgress(`Image ${i + 1}/${totalImages} done`)
        toast.success(`Text extracted from image ${i + 1}`)
        setCurrentIdx(i + 1)
        setLoading(false)
        return
      }
    } catch {
      setProgress(`OCR failed on image ${i + 1}. Try a clearer image.`)
      toast.error(`Failed to extract text from image ${i + 1}`)
    }
    setLoading(false)
  }

  const extractAll = async () => {
    if (images.length === 0) return
    const newExtracted: string[] = []
    setLoading(true)
    setBatchProgress({ current: 0, total: images.length })
    try {
      const Tesseract = await import("tesseract.js")
      for (let i = 0; i < images.length; i++) {
        setBatchProgress({ current: i + 1, total: images.length })
        setProgress(`Processing image ${i + 1} of ${images.length}...`)
        const { data } = await Tesseract.recognize(images[i].file, "eng", {
          logger: (m: any) => {
            if (m.status === "recognizing text" && Math.round(m.progress * 100) % 25 === 0) {
              setProgress(`Image ${i + 1}: ${Math.round(m.progress * 100)}%`)
            }
          },
        })
        newExtracted.push(data.text.trim())
        setExtracted([...newExtracted])
      }
      const merged = newExtracted.filter(Boolean).join("\n\n---\n\n")
      setEditing(merged)
      setProgress("")
      setBatchProgress({ current: 0, total: 0 })
      setStep("done")
      toast.success(`Extracted text from all ${images.length} images`)
    } catch {
      setProgress("Batch OCR failed. Try individual extraction.")
      toast.error("Batch processing failed")
    }
    setLoading(false)
  }

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx)
    setImages(newImages)
    if (newImages.length === 0) {
      setStep("select")
      setCurrentIdx(0)
    } else if (currentIdx >= newImages.length) {
      setCurrentIdx(newImages.length - 1)
    }
  }

  const reset = () => {
    setImages([]); setExtracted([]); setEditing(""); setStep("select"); setProgress(""); setCurrentIdx(0); setCopied(false); setBatchProgress({ current: 0, total: 0 })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editing)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  const wordCount = editing.split(/\s+/).filter(Boolean).length
  const charCount = editing.length

  return (
    <div className="space-y-4" ref={pasteRef}>
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div
              onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 transition-all hover:border-primary/60 hover:bg-primary/10"
            >
              <input type="file" accept="image/*" onChange={handleInput} multiple={multiple} className="absolute inset-0 cursor-pointer opacity-0" />
              <div className="mb-3 rounded-xl bg-primary/10 p-3"><Upload className="h-6 w-6 text-primary" /></div>
              <p className="text-sm font-medium">Drop images here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP &mdash; text extracted client-side</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Or paste an image from clipboard <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl+V</kbd></p>
            </div>
          </motion.div>
        )}

        {step === "extract" && images.length > 0 && (
          <motion.div key="extract" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {totalImages > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`relative rounded-lg border-2 overflow-hidden w-14 h-14 shrink-0 transition-all ${currentIdx === i ? "border-primary ring-2 ring-primary/30" : "border-border opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); removeImage(i) }} className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-white w-4 h-4 flex items-center justify-center text-[10px] leading-none"><X className="h-2.5 w-2.5" /></button>
                  </button>
                ))}
                <label className="cursor-pointer rounded-lg border-2 border-dashed border-border w-14 h-14 flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                  <Plus className="h-5 w-5" />
                  <input type="file" accept="image/*" onChange={handleInput} multiple className="hidden" />
                </label>
              </div>
            )}
            <div className="relative overflow-hidden rounded-xl border bg-muted/30">
              <img src={images[currentIdx].dataUrl} alt={`Image ${currentIdx + 1}`} className="max-h-64 w-full object-contain" />
              {totalImages > 1 && (
                <Badge className="absolute top-2 left-2 bg-background/80 text-foreground backdrop-blur-sm">{currentIdx + 1}/{totalImages}</Badge>
              )}
              <button onClick={() => removeImage(currentIdx)} className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-background"><X className="h-4 w-4" /></button>
            </div>
            {extracted[currentIdx] && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 rounded-lg p-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Extracted</span>
              </div>
            )}
            {totalImages > 1 && !extracted[currentIdx] ? (
              <div className="flex gap-2">
                <Button onClick={() => extractText(currentIdx)} disabled={loading} className="animated-gradient flex-1 border-0 text-white shadow-lg shadow-primary/25">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {progress}</> : <><ScanLine className="mr-2 h-4 w-4" /> Extract This Image</>}
                </Button>
                <Button onClick={extractAll} disabled={loading} variant="outline" className="flex-1">
                  <Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Extract All ({totalImages})
                </Button>
              </div>
            ) : (
              <Button onClick={() => extractText(currentIdx)} disabled={loading} className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {progress}</> : <><ScanLine className="mr-2 h-4 w-4" /> Extract Text</>}
              </Button>
            )}
            {loading && batchProgress.total > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
                </div>
                <span>{batchProgress.current}/{batchProgress.total}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span>{totalImages} image{totalImages > 1 ? "s" : ""} loaded</span>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{wordCount} words</span>
                <span className="text-muted-foreground">&middot;</span>
                <span className="text-muted-foreground">{charCount} characters</span>
              </div>
              {images.length > 1 && (
                <Badge variant="outline" className="text-xs">{images.length} sources</Badge>
              )}
            </div>
            {images.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setStep("extract") }}
                    className="relative rounded-lg border overflow-hidden w-12 h-12 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <textarea
                value={editing} onChange={(e) => setEditing(e.target.value)}
                className="min-h-[200px] w-full rounded-xl border bg-background p-3 pr-10 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                placeholder="Extracted text appears here..."
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onUseText(editing)} className="animated-gradient flex-1 border-0 text-white shadow-lg shadow-primary/25">
                <FileText className="mr-2 h-4 w-4" /> Use as Content
              </Button>
              <Button variant="outline" onClick={() => { setStep("extract"); setEditing(""); setExtracted([]) }}>
                <ScanLine className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={reset}><X className="h-4 w-4" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
