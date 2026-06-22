"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PrintableLessonNote } from "@/components/PrintableLessonNote"
import { downloadPng, downloadPdf, openPrintWindow } from "@/lib/capture"
import { Download, Printer, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LessonNoteData {
  schoolName: string
  schoolLogo?: string
  schoolMotto?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  title: string
  subject: string
  className: string
  week: number
  term: string
  session: string
  teacherName: string
  content: string
  resources?: string
  quiz?: any[]
  createdAt?: string
}

interface LessonNoteViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: LessonNoteData
}

export function LessonNoteViewer({ open, onOpenChange, data }: LessonNoteViewerProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState("")

  const handlePDF = async () => {
    if (!reportRef.current) return
    setExporting("pdf")
    try {
      await downloadPdf(reportRef.current, `${data.title.replace(/\s+/g, "_")}_Lesson_Note.pdf`)
      toast.success("PDF downloaded")
    } catch { toast.error("Failed to export PDF") }
    setExporting("")
  }

  const handlePNG = async () => {
    if (!reportRef.current) return
    setExporting("png")
    try {
      await downloadPng(reportRef.current, `${data.title.replace(/\s+/g, "_")}_Lesson_Note.png`)
      toast.success("PNG downloaded")
    } catch { toast.error("Failed to export PNG") }
    setExporting("")
  }

  const handlePrint = () => {
    if (!reportRef.current) return
    openPrintWindow(reportRef.current, `Lesson Note - ${data.title}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90dvh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background pb-3 flex items-center justify-between border-b mb-4">
          <h3 className="text-sm font-semibold">Lesson Note: {data.title}</h3>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!!exporting}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handlePDF} disabled={!!exporting}>
              {exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <FileText className="h-3.5 w-3.5 mr-1" />}
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePNG} disabled={!!exporting}>
              {exporting === "png" ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Download className="h-3.5 w-3.5 mr-1" />}
              PNG
            </Button>
          </div>
        </div>
        <div className="flex justify-center overflow-x-auto">
          <PrintableLessonNote ref={reportRef} data={data} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
