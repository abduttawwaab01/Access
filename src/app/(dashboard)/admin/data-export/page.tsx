"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Download, FileSpreadsheet, Archive, Loader2, CheckCircle2 } from "lucide-react"

const exportGroups = [
  {
    label: "People",
    items: [
      { label: "Staff", url: "/api/staff", file: "staff" },
      { label: "Students", url: "/api/students", file: "students" },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Classes", url: "/api/classes", file: "classes" },
      { label: "Subjects", url: "/api/subjects", file: "subjects" },
      { label: "Terms", url: "/api/terms", file: "terms" },
      { label: "Sessions", url: "/api/sessions", file: "sessions" },
      { label: "Timetable", url: "/api/timetable", file: "timetable" },
    ],
  },
  {
    label: "Curriculum",
    items: [
      { label: "Lesson Notes", url: "/api/lesson-notes", file: "lesson-notes" },
      { label: "Scheme of Work", url: "/api/scheme-of-work", file: "scheme-of-work" },
      { label: "Assignments", url: "/api/assignments", file: "assignments" },
      { label: "Question Bank", url: "/api/question-bank", file: "question-bank" },
      { label: "Exams", url: "/api/exams", file: "exams" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Fee Structures", url: "/api/fee-structures", file: "fee-structures" },
      { label: "Payments", url: "/api/payments", file: "payments" },
      { label: "Salary", url: "/api/salary", file: "salary" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Admissions", url: "/api/admissions", file: "admissions" },
      { label: "Documents", url: "/api/documents", file: "documents" },
    ],
  },
]

export default function AdminDataExportPage() {
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  const downloadCSV = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) {
        toast.error(`No ${filename} data to export`)
        return
      }
      const headers = Object.keys(data[0])
      const escape = (v: any) => {
        const s = v === null || v === undefined ? "" : String(v)
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s
      }
      const bom = "\uFEFF"
      const csv = bom + [headers.join(","), ...data.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success(`Downloaded ${filename}.csv`)
    } catch {
      toast.error(`Failed to export ${filename}`)
    }
  }

  const exportFullZip = async () => {
    setExporting(true)
    setExported(false)
    try {
      const res = await fetch("/api/export")
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }))
        toast.error(err.error || "Export failed")
        return
      }
      const blob = await res.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      const dateStr = new Date().toISOString().split("T")[0]
      link.download = `school-export-${dateStr}.zip`
      link.click()
      URL.revokeObjectURL(link.href)
      setExported(true)
      toast.success("Full school data exported successfully")
    } catch {
      toast.error("Export failed — please try again")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Data Export</h2>
        <p className="text-sm text-muted-foreground">Export your school data for backup or analysis</p>
      </motion.div>

      <Card className="border-0 glass-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Archive className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">Full School Data Export</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download a complete ZIP archive containing all school records as CSV files — students, staff, classes, results, finance, and more.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Button onClick={exportFullZip} disabled={exporting} className="gap-2">
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {exporting ? "Exporting..." : "Download Full ZIP Archive"}
                </Button>
                {exported && (
                  <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Exported
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Individual CSV Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportGroups.map((group) => (
              <div key={group.label}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {group.items.map((item) => (
                    <button
                      key={item.file}
                      onClick={() => downloadCSV(item.url, item.file)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 p-3 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-accent transition-all"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
