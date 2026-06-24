"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { CheckCircle, XCircle, Clock, Search, User, BookOpen, DownloadCloud, FileSpreadsheet, LayoutDashboard, FileText, BarChart3, Brain, Target, Lightbulb, Award, AlertTriangle, Plus, Edit3, Eye, ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Save, Share2, Trash2, KeyRound, Loader2 } from "lucide-react"
import { downloadCsv, downloadPng, downloadPdf, downloadDoc } from "@/lib/capture"
import { PageHeader } from "@/components/admin/PageHeader"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const tabs = ["Dashboard", "Applications", "Entrance Scores", "Reports"]
const statusColors: Record<string, string> = { pending: "bg-amber-500/15 text-amber-600", accepted: "bg-emerald-500/15 text-emerald-600", rejected: "bg-red-500/15 text-red-600", transferred: "bg-blue-500/15 text-blue-600" }
const gradeColors: Record<string, string> = { A: "#22c55e", B: "#3b82f6", C: "#f59e0b", D: "#f97316", F: "#ef4444" }

export default function AdminAdmissionsPage() {
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [applications, setApplications] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({ cutOffs: {}, entranceExamId: null })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [editScore, setEditScore] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [cutOffInputs, setCutOffInputs] = useState<Record<string, string>>({})
  const [selectedExamId, setSelectedExamId] = useState("")
  const [transferClassId, setTransferClassId] = useState("")
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entranceCodes, setEntranceCodes] = useState<any[]>([])
  const [codeGenExamId, setCodeGenExamId] = useState("")
  const [codeGenClassId, setCodeGenClassId] = useState("")
  const [codeGenCount, setCodeGenCount] = useState("1")
  const [codeGenMaxUses, setCodeGenMaxUses] = useState("1")
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setLoading(true)
    const [appsRes, clsRes, examsRes, setRes, codesRes, subsRes] = await Promise.all([
      fetch("/api/admissions"),
      fetch("/api/classes"),
      fetch("/api/exams"),
      fetch("/api/admissions/settings"),
      fetch("/api/entrance-codes"),
      fetch("/api/subjects"),
    ])
    setApplications(await appsRes.json())
    setClasses(await clsRes.json())
    setExams(await examsRes.json())
    setSettings(await setRes.json())
    setEntranceCodes(await codesRes.json())
    setSubjects(await subsRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getCutOffForApp = (app: any) => {
    if (!settings.cutOffs) return null
    // Try matching by classId directly first
    if (app.classId && settings.cutOffs[app.classId]) return settings.cutOffs[app.classId]
    // Try matching by classApplyingFor string
    const matchedClass = classes.find((c: any) => c.name === app.classApplyingFor || c.id === app.classApplyingFor)
    if (matchedClass && settings.cutOffs[matchedClass.id]) return settings.cutOffs[matchedClass.id]
    return null
  }

  const entranceExams = exams.filter((e: any) => e.type === "entrance")
  const filtered = applications.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter
    const matchSearch = !search || `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // Stats
  const totalApps = applications.length
  const pendingCount = applications.filter((a) => a.status === "pending").length
  const acceptedCount = applications.filter((a) => a.status === "accepted").length
  const rejectedCount = applications.filter((a) => a.status === "rejected").length
  const transferredCount = applications.filter((a) => a.status === "transferred").length
  const scoredCount = applications.filter((a) => a.entranceExamScore != null).length

  const statusChartData = [
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
    { name: "Accepted", value: acceptedCount, color: "#22c55e" },
    { name: "Rejected", value: rejectedCount, color: "#ef4444" },
    { name: "Transferred", value: transferredCount, color: "#3b82f6" },
  ].filter((d) => d.value > 0)

  const appsByClass = applications.reduce((acc: Record<string, number>, a: any) => {
    const key = a.className || a.classApplyingFor || "Unknown"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const classChartData = Object.entries(appsByClass).map(([name, count]) => ({ name: name.length > 12 ? name.substring(0, 12) + "..." : name, count }))

  const handleAction = async (id: string, action: "acceptApplication" | "rejectApplication" | "transferApplication") => {
    const body: any = { action, id, token: "superadmin-authenticated" }
    if (action === "transferApplication") {
      if (!transferClassId) { toast.error("Select a class to transfer to"); return }
      body.transferToClassId = transferClassId
    }
    try {
      const res = await fetch("/api/superadmin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) {
        if (action === "acceptApplication" && data.credentials) {
          toast.success(`Accepted! Email: ${data.credentials.email}, Password: ${data.credentials.password}`)
        } else {
          toast.success(data.message || `Application ${action === "acceptApplication" ? "accepted" : action === "rejectApplication" ? "rejected" : "transferred"}`)
        }
        fetchData()
        setShowDetail(false)
      } else {
        toast.error(data.error || "Action failed")
      }
    } catch {
      toast.error("Failed to process action")
    }
  }

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/admissions/${confirmDelete.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Application deleted")
      fetchData()
      setShowDetail(false)
      setConfirmDelete(null)
    } else toast.error("Failed to delete")
  }

  const handleUpdateApplication = async () => {
    if (!selectedApp) return
    setSaving(true)
    const res = await fetch(`/api/admissions/${selectedApp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entranceExamScore: editScore ? Number(editScore) : null,
        notes: editNotes,
        entranceExamPassed: editScore && getCutOffForApp(selectedApp) ? Number(editScore) >= (getCutOffForApp(selectedApp) || 0) : undefined,
      }),
    })
    if (res.ok) {
      toast.success("Application updated")
      fetchData()
      setShowDetail(false)
    } else toast.error("Failed to update")
    setSaving(false)
  }

  const handleSaveSettings = async () => {
    const cutOffs: Record<string, number> = {}
    Object.entries(cutOffInputs).forEach(([key, val]) => { if (val) cutOffs[key] = Number(val) })
    const res = await fetch("/api/admissions/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cutOffs, entranceExamId: selectedExamId || settings.entranceExamId }),
    })
    if (res.ok) { toast.success("Settings saved"); fetchData() }
    else toast.error("Failed to save settings")
  }

  // Report functions
  const getScoreColor = (pct: number) => pct >= 75 ? "text-green-500" : pct >= 65 ? "text-blue-500" : pct >= 55 ? "text-amber-500" : pct >= 45 ? "text-orange-500" : "text-red-500"

  const handleExportAppsCSV = () => {
    const data = applications.map((a) => ({
      "First Name": a.firstName,
      "Last Name": a.lastName,
      "Email": a.email,
      "Phone": a.phone || "",
      "Class": a.className || a.classApplyingFor || "",
      "Status": a.status,
      "Exam Score": a.entranceExamScore ?? "",
      "Passed": a.entranceExamPassed ? "Yes" : "No",
      "Applied": new Date(a.appliedAt).toLocaleDateString(),
      "Notes": a.notes || "",
    }))
    downloadCsv(data, `Admissions_${new Date().toISOString().split("T")[0]}.csv`)
  }

  const handleExportReportPNG = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPng(reportRef.current, `Admission_Report_${new Date().toISOString().split("T")[0]}.png`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Report exported as PNG") } catch { toast.error("Export failed") }
    setExporting(false)
  }

  const handleExportReportPDF = async () => {
    if (!reportRef.current) return; setExporting(true)
    try { await downloadPdf(reportRef.current, `Admission_Report_${new Date().toISOString().split("T")[0]}.pdf`, { scale: 2, backgroundColor: "#ffffff" }); toast.success("Report exported as PDF") } catch { toast.error("Export failed") }
    setExporting(false)
  }

  const getCutOffForClass = (classId: string) => settings.cutOffs?.[classId] || ""

  // Entrance exam analysis state
  const [detailSubTab, setDetailSubTab] = useState("details")
  const analysisRef = useRef<HTMLDivElement>(null)

  const openDetail = (app: any) => {
    setSelectedApp(app)
    setEditScore(app.entranceExamScore?.toString() ?? "")
    setEditNotes(app.notes || "")
    setTransferClassId("")
    setShowDetail(true)
    setDetailSubTab("details")
    setAnalysisData(null)
  }

  const whatsappShare = (app: any, analysis?: any) => {
    const phone = app.phone || app.parentPhone || ""
    const cleanPhone = phone.replace(/[^0-9]/g, "")
    const msg = [
      `*Entrance Exam Results - ${app.firstName} ${app.lastName}*`,
      ``,
      `Overall Score: ${analysis?.percentage ?? app.entranceExamScore ?? "N/A"}%`,
      `Status: ${app.entranceExamPassed ? "✅ Passed" : "❌ Failed"}`,
      ``,
      `Class Applying For: ${app.className || app.classApplyingFor || "N/A"}`,
      `Generated by Skoolar School Management System`,
    ].filter(Boolean).join("\n")
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Admissions Management</h2>
          <p className="text-sm text-muted-foreground">Review, score, and manage admission applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAppsCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />Export CSV</Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "Dashboard" && <LayoutDashboard className="h-3.5 w-3.5 inline mr-1" />}
            {t === "Applications" && <User className="h-3.5 w-3.5 inline mr-1" />}
            {t === "Entrance Scores" && <BarChart3 className="h-3.5 w-3.5 inline mr-1" />}
            {t === "Reports" && <FileText className="h-3.5 w-3.5 inline mr-1" />}
            {t}
          </button>
        ))}
      </div>

      {/* ===================== DASHBOARD TAB ===================== */}
      {activeTab === "Dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{totalApps}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
            <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
            <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{acceptedCount}</p><p className="text-xs text-muted-foreground">Accepted</p></CardContent></Card>
            <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{rejectedCount}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
            <Card className="border border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{transferredCount}</p><p className="text-xs text-muted-foreground">Transferred</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border/50">
              <CardHeader><CardTitle className="text-sm font-semibold">Status Distribution</CardTitle></CardHeader>
              <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer></div>
              <div className="flex justify-center gap-4 text-xs mt-2">
                {statusChartData.map((d) => <div key={d.name} className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} /><span>{d.name}: {d.value}</span></div>)}
              </div></CardContent>
            </Card>
            <Card className="border border-border/50">
              <CardHeader><CardTitle className="text-sm font-semibold">Applications by Class</CardTitle></CardHeader>
              <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} layout="vertical">
                  <XAxis type="number" /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer></div></CardContent>
            </Card>
          </div>

          <Card className="border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold">Exam Readiness</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex-1"><div className="flex justify-between mb-1"><span>Scored</span><span className="font-bold">{scoredCount}/{totalApps}</span></div>
                  <Progress value={totalApps > 0 ? (scoredCount / totalApps) * 100 : 0} className="h-2" /></div>
                <div className="flex-1"><div className="flex justify-between mb-1"><span>Pending Review</span><span className="font-bold">{pendingCount}/{totalApps}</span></div>
                  <Progress value={totalApps > 0 ? (pendingCount / totalApps) * 100 : 0} className="h-2" /></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================== APPLICATIONS TAB ===================== */}
      {activeTab === "Applications" && (
        <>
          {showDetail && selectedApp ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setShowDetail(false)} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Applications</Button>

              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                <button onClick={() => setDetailSubTab("details")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${detailSubTab === "details" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Details</button>
                <button onClick={() => setDetailSubTab("analysis")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${detailSubTab === "analysis" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Exam Analysis</button>
              </div>

              {detailSubTab === "details" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="border border-border/50">
                      <CardHeader><CardTitle className="text-sm font-semibold">Applicant Details</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><Label className="text-xs text-muted-foreground">Name</Label><p className="font-medium">{selectedApp.firstName} {selectedApp.lastName}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Email</Label><p>{selectedApp.email}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Phone</Label><p>{selectedApp.phone || "N/A"}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Gender</Label><p>{selectedApp.gender || "N/A"}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Date of Birth</Label><p>{selectedApp.dob || selectedApp.dateOfBirth ? new Date(selectedApp.dob || selectedApp.dateOfBirth).toLocaleDateString() : "N/A"}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Applied</Label><p>{new Date(selectedApp.appliedAt).toLocaleDateString()}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Class Applying For</Label><p>{selectedApp.className || selectedApp.classApplyingFor || "N/A"}</p></div>
                          <div><Label className="text-xs text-muted-foreground">Previous School</Label><p>{selectedApp.previousSchool || "N/A"}</p></div>
                        </div>
                        <div><Label className="text-xs text-muted-foreground">Address</Label><p className="text-sm">{selectedApp.address || "N/A"}</p></div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border/50">
                      <CardHeader><CardTitle className="text-sm font-semibold">Entrance Exam Score</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-xs">Score (out of 100)</Label>
                            <Input type="number" min={0} max={100} value={editScore} onChange={(e) => setEditScore(e.target.value)} className="h-10 w-32" placeholder="Enter score" />
                          </div>
                          {selectedApp.entranceExamScore != null && (
                            <div className="text-center">
                              <p className="text-2xl font-bold">{selectedApp.entranceExamScore}/100</p>
                              <Badge className={selectedApp.entranceExamPassed ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600"}>
                                {selectedApp.entranceExamPassed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border/50">
                      <CardHeader><CardTitle className="text-sm font-semibold">Notes & Actions</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs">Admin Notes</Label>
                          <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="min-h-[80px]" placeholder="Add notes about this applicant..." />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={handleUpdateApplication} disabled={saving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                          {selectedApp.status === "pending" && (
                            <>
                              <Button variant="outline" className="text-emerald-600 border-emerald-300" onClick={() => handleAction(selectedApp.id, "acceptApplication")}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Accept
                              </Button>
                              <Button variant="outline" className="text-red-600 border-red-300" onClick={() => handleAction(selectedApp.id, "rejectApplication")}>
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                              <Button variant="outline" className="text-red-600 border-red-300 ml-auto" onClick={() => setConfirmDelete(selectedApp)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                        <div className="overflow-hidden flex items-center gap-2 max-w-[calc(100vw-24rem)]" style={{ maxWidth: '100%' }}}
                                <select value={transferClassId} onChange={(e) => setTransferClassId(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm h-10">
                                  <option value="">Defer to...</option>
                                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <Button variant="outline" className="text-blue-600 border-blue-300" onClick={() => handleAction(selectedApp.id, "transferApplication")}>
                                  Defer
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card className="border border-border/50">
                      <CardHeader><CardTitle className="text-sm font-semibold">Status</CardTitle></CardHeader>
                      <CardContent>
                        <Badge className={statusColors[selectedApp.status] || "bg-muted"}>{selectedApp.status}</Badge>
                      </CardContent>
                    </Card>
                    {selectedApp.entranceExamScore != null && (
                      <Card className="border border-border/50">
                        <CardHeader><CardTitle className="text-sm font-semibold">Score Summary</CardTitle></CardHeader>
                        <CardContent className="text-center">
                          <div className={`text-4xl font-bold ${getScoreColor(selectedApp.entranceExamScore)}`}>{selectedApp.entranceExamScore}%</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getCutOffForApp(selectedApp) ? `Cut-off: ${getCutOffForApp(selectedApp)}%` : "No cut-off set"}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {detailSubTab === "analysis" && (
                <div ref={analysisRef} className="space-y-6 bg-white rounded-2xl p-6 border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Entrance Exam Analysis — {selectedApp.firstName} {selectedApp.lastName}</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => whatsappShare(selectedApp, analysisData)} disabled={!selectedApp.phone && !selectedApp.parentPhone}>
                        <Share2 className="h-4 w-4 mr-1" /> Share via WhatsApp
                      </Button>
                      <Button variant="outline" size="sm" onClick={async () => { if (analysisRef.current) { await downloadPng(analysisRef.current, `Entrance_${selectedApp.firstName}_${selectedApp.lastName}.png`); toast.success("Exported as PNG") } }}>
                        <DownloadCloud className="h-4 w-4 mr-1" /> PNG
                      </Button>
                      <Button variant="outline" size="sm" onClick={async () => { if (analysisRef.current) { await downloadPdf(analysisRef.current, `Entrance_${selectedApp.firstName}_${selectedApp.lastName}.pdf`); toast.success("Exported as PDF") } }}>
                        <DownloadCloud className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { if (analysisRef.current) downloadDoc(analysisRef.current, `Entrance_${selectedApp.firstName}_${selectedApp.lastName}.doc`, "Entrance Exam Analysis") }}>
                        <FileText className="h-4 w-4 mr-1" /> DOC
                      </Button>
                    </div>
                  </div>

                  {selectedApp.examSessionId ? (
                    analysisLoading ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : analysisData ? (
                      <>
                        {/* Overall Score */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className={`border ${analysisData.passed ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50" : "border-red-200 bg-gradient-to-br from-red-50 to-orange-50"}`}>
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">{analysisData.percentage}%</p>
                              <p className="text-xs text-muted-foreground">Overall Score</p>
                              <Badge className={analysisData.passed ? "bg-green-500/15 text-green-600 mt-2" : "bg-red-500/15 text-red-600 mt-2"}>{analysisData.passed ? "Passed" : "Failed"}</Badge>
                            </CardContent>
                          </Card>
                          <Card className="border border-border/50">
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">{analysisData.totalScore}/{analysisData.maxScore}</p>
                              <p className="text-xs text-muted-foreground">Total Score</p>
                              <p className="text-xs text-muted-foreground mt-1">{analysisData.totalQuestions} questions</p>
                            </CardContent>
                          </Card>
                          <Card className="border border-border/50">
                            <CardContent className="p-4 text-center">
                              <p className="text-3xl font-bold">{analysisData.answeredCorrectly}/{analysisData.totalQuestions}</p>
                              <p className="text-xs text-muted-foreground">Correct Answers</p>
                              <p className="text-xs text-muted-foreground mt-1">{analysisData.answeredIncorrectly} incorrect</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Radar & Bar Charts */}
                        {analysisData.radarData?.length > 0 && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border border-border/50">
                              <CardHeader><CardTitle className="text-sm font-semibold"><Brain className="h-4 w-4 inline mr-1" />Subject Performance</CardTitle></CardHeader>
                              <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={analysisData.radarData}>
                                  <PolarGrid stroke="#e5e7eb" /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer></div></CardContent>
                            </Card>
                            <Card className="border border-border/50">
                              <CardHeader><CardTitle className="text-sm font-semibold"><BarChart3 className="h-4 w-4 inline mr-1" />Scores by Subject</CardTitle></CardHeader>
                              <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analysisData.subjectBreakdown.map((s: any) => ({ name: s.subjectName, score: s.percentage }))} layout="vertical">
                                  <XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} /><Tooltip />
                                  <Bar dataKey="score" name="Score %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer></div></CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Topic Breakdown */}
                        {analysisData.subjectBreakdown?.some((s: any) => s.topics?.length > 0) && (
                          <Card className="border border-border/50">
                            <CardHeader><CardTitle className="text-sm font-semibold"><Target className="h-4 w-4 inline mr-1" />Topic Breakdown</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                              {analysisData.subjectBreakdown.filter((s: any) => s.topics?.length > 0).map((sub: any, si: number) => (
                                <div key={si}>
                                  <p className="text-sm font-medium mb-2">{sub.subjectName}</p>
                                  <div className="h-32"><ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sub.topics.map((t: any) => ({ name: t.name, score: t.percentage }))} layout="vertical">
                                      <XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} /><Tooltip />
                                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer></div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}

                        {/* Question-by-Question */}
                        <Card className="border border-border/50">
                          <CardHeader><CardTitle className="text-sm font-semibold"><FileText className="h-4 w-4 inline mr-1" />Question by Question</CardTitle></CardHeader>
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead><tr className="bg-muted/50">
                                  <th className="text-left px-3 py-2 font-semibold text-xs w-8">#</th>
                                  <th className="text-left px-3 py-2 font-semibold text-xs">Question</th>
                                  <th className="text-left px-3 py-2 font-semibold text-xs">Answer</th>
                                  <th className="text-left px-3 py-2 font-semibold text-xs">Correct</th>
                                  <th className="text-center px-3 py-2 font-semibold text-xs w-16">Result</th>
                                </tr></thead>
                                <tbody>
                                  {analysisData.questionAnalysis?.map((q: any, i: number) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                      <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>
                                      <td className="px-3 py-2 text-xs max-w-[200px] truncate">{q.question}</td>
                                      <td className="px-3 py-2 text-xs">{q.userAnswer || "-"}</td>
                                      <td className="px-3 py-2 text-xs">{q.correctAnswer || "-"}</td>
                                      <td className="px-3 py-2 text-center">
                                        {q.isCorrect === true && <Badge className="bg-green-500/15 text-green-600 text-[10px]">Correct</Badge>}
                                        {q.isCorrect === false && <Badge className="bg-red-500/15 text-red-600 text-[10px]">Wrong</Badge>}
                                        {q.isCorrect === null && <Badge variant="outline" className="text-[10px]">Ungraded</Badge>}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardContent className="p-4">
                              <h4 className="text-xs font-semibold text-green-700 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Strengths</h4>
                              {analysisData.strengths?.length > 0 ? (
                                <ul className="mt-2 space-y-1">
                                  {analysisData.strengths.map((s: any, i: number) => (
                                    <li key={i} className="text-xs">+ {s.subjectName}: {s.question.length > 60 ? s.question.substring(0, 60) + "..." : s.question}</li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-muted-foreground mt-2">No strong areas identified</p>}
                            </CardContent>
                          </Card>
                          <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50">
                            <CardContent className="p-4">
                              <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Areas to Improve</h4>
                              {analysisData.weaknesses?.length > 0 ? (
                                <ul className="mt-2 space-y-1">
                                  {analysisData.weaknesses.map((w: any, i: number) => (
                                    <li key={i} className="text-xs">- {w.subjectName}: {w.question.length > 60 ? w.question.substring(0, 60) + "..." : w.question}</li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-muted-foreground mt-2">All questions answered correctly</p>}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Recommendation */}
                        {analysisData.recommendation && (
                          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardContent className="p-4">
                              <h4 className="text-xs font-semibold text-blue-700 flex items-center gap-1"><Brain className="h-3 w-3" /> Recommendation</h4>
                              <p className="text-sm mt-2 text-blue-900">{analysisData.recommendation}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Session Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Exam: {analysisData.examTitle}</span>
                          {analysisData.examDuration && <span>Duration: {analysisData.examDuration} min</span>}
                          {analysisData.tabSwitches > 0 && <span className="text-amber-500">Tab switches: {analysisData.tabSwitches}</span>}
                          {analysisData.flagged && <span className="text-amber-500">Flagged for review</span>}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Button onClick={async () => {
                          setAnalysisLoading(true)
                          try {
                            const res = await fetch(`/api/admissions/${selectedApp.id}/analysis`)
                            if (res.ok) setAnalysisData(await res.json())
                            else toast.error("Failed to load analysis")
                          } catch { toast.error("Failed to load analysis") }
                          setAnalysisLoading(false)
                        }} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                          <Brain className="h-4 w-4 mr-1" /> Load Exam Analysis
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No entrance exam taken yet. Exam results will appear here after the applicant completes the entrance exam.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  {["all", "pending", "accepted", "rejected", "transferred"].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{s === "transferred" ? "Deferred" : s}</button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">No applications found</div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filtered.map((app, i) => (
                      <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card className="glass-card border-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(app)}>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{app.firstName} {app.lastName}</span>
                                  <Badge className={statusColors[app.status]}>{app.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>Class: {app.className || app.classApplyingFor || "N/A"}</span>
                                  <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                                  {app.entranceExamScore != null && (
                                    <span className={`font-medium ${getScoreColor(app.entranceExamScore)}`}>
                                      Exam: {app.entranceExamScore}/100
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); openDetail(app) }}>
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setConfirmDelete(app) }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ===================== ENTRANCE SCORES TAB ===================== */}
      {activeTab === "Entrance Scores" && (
        <div className="space-y-6">
          {/* Entrance Exams Overview */}
          <Card className="border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4" />Entrance Exams</CardTitle></CardHeader>
            <CardContent className="p-0">
              {entranceExams.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No entrance exams found. Create one in{" "}
                  <a href="/admin/cbt/exams" className="text-primary underline">CBT Engine</a>.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left px-3 py-2 font-semibold text-xs">#</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs">Title</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs hidden md:table-cell">Subject</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs hidden sm:table-cell">Duration</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs hidden sm:table-cell">Questions</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs">Status</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs">Actions</th>
                    </tr></thead>
                    <tbody>
                      {entranceExams.map((e: any, i: number) => (
                        <tr key={e.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-xs">{e.title}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">{subjects.find((s: any) => s.id === e.subjectId)?.name || "N/A"}</td>
                          <td className="px-3 py-2 text-center text-xs hidden sm:table-cell">{e.duration || "—"}m</td>
                          <td className="px-3 py-2 text-center text-xs hidden sm:table-cell">{e.questions?.length || 0}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge className={e.status === "published" ? "bg-green-500/15 text-green-600" : "bg-amber-500/15 text-amber-600"}>{e.status}</Badge>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => { setCodeGenExamId(e.id); document.getElementById("code-gen-section")?.scrollIntoView({ behavior: "smooth" }) }}>
                              <KeyRound className="h-3 w-3" /> Codes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold">Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Entrance Exam</Label>
                  <select value={selectedExamId || settings.entranceExamId || ""} onChange={(e) => setSelectedExamId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select entrance exam...</option>
                    {entranceExams.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
                    {entranceExams.length === 0 && <option disabled>No entrance exams found (create one in CBT Engine)</option>}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Cut-off Scores per Class</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {classes.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <Label className="text-xs w-24">{c.name}</Label>
                      <Input type="number" min={0} max={100} value={cutOffInputs[c.id] ?? getCutOffForClass(c.id)} onChange={(e) => setCutOffInputs((prev) => ({ ...prev, [c.id]: e.target.value }))} className="h-9 w-20 text-center" placeholder="0" />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                <Save className="h-4 w-4 mr-1" /> Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Code Generation */}
          <Card id="code-gen-section" className="border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" />Generate Entrance Codes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Entrance Exam</Label>
                  <select value={codeGenExamId} onChange={(e) => setCodeGenExamId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select exam...</option>
                    {entranceExams.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Class</Label>
                  <select value={codeGenClassId} onChange={(e) => setCodeGenClassId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-11">
                    <option value="">Select class...</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Number of Codes</Label>
                  <Input type="number" min={1} max={100} value={codeGenCount} onChange={(e) => setCodeGenCount(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Uses Per Code</Label>
                  <Input type="number" min={1} value={codeGenMaxUses} onChange={(e) => setCodeGenMaxUses(e.target.value)} className="h-11" />
                </div>
              </div>
              <Button onClick={async () => {
                if (!codeGenExamId || !codeGenClassId) { toast.error("Select exam and class"); return }
                setGenerating(true)
                try {
                  const res = await fetch("/api/admissions/generate-codes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ examId: codeGenExamId, classId: codeGenClassId, count: Number(codeGenCount), maxUses: Number(codeGenMaxUses) }),
                  })
                  const data = await res.json()
                  if (data.success) {
                    setGeneratedCodes(data.codes)
                    toast.success(`${data.count} codes generated`)
                    fetchData()
                  } else toast.error("Failed to generate codes")
                } catch { toast.error("Failed to generate codes") }
                setGenerating(false)
              }} disabled={generating || !codeGenExamId || !codeGenClassId} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                {generating ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...</> : <><KeyRound className="h-4 w-4 mr-1" /> Generate Codes</>}
              </Button>

              {generatedCodes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs">Generated Codes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {generatedCodes.map((code, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                        <code className="text-xs font-mono font-bold">{code}</code>
                        <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!") }} className="text-primary hover:text-primary/80 text-xs">Copy</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Codes */}
          {entranceCodes.length > 0 && (
            <Card className="border border-border/50">
              <CardHeader><CardTitle className="text-sm font-semibold">Existing Codes</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left px-3 py-2 font-semibold text-xs">Code</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs">Exam</th>
                      <th className="text-left px-3 py-2 font-semibold text-xs">Class</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs">Usage</th>
                      <th className="text-center px-3 py-2 font-semibold text-xs">Expires</th>
                    </tr></thead>
                    <tbody>
                      {entranceCodes.map((c: any, i: number) => (
                        <tr key={c.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-3 py-2 font-mono text-xs font-bold">{c.code}</td>
                          <td className="px-3 py-2 text-xs">{c.examId ? exams.find((e: any) => e.id === c.examId)?.title || "N/A" : "N/A"}</td>
                          <td className="px-3 py-2 text-xs">{c.classId ? classes.find((cl: any) => cl.id === c.classId)?.name || "N/A" : "N/A"}</td>
                          <td className="px-3 py-2 text-center text-xs">{c.currentUses}/{c.maxUses}</td>
                          <td className="px-3 py-2 text-center text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold">Applicant Scores</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-semibold text-xs">#</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs">Applicant</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs">Class</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Score</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Cut-off</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Status</th>
                  </tr></thead>
                  <tbody>
                    {applications.map((app, i) => {
                      const cutOff = getCutOffForApp(app)
                      const hasScore = app.entranceExamScore != null
                      const passed = hasScore && cutOff ? app.entranceExamScore >= cutOff : null
                      return (
                        <tr key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-3 py-2 font-medium">{app.firstName} {app.lastName}</td>
                          <td className="px-3 py-2">{app.className || app.classApplyingFor || "N/A"}</td>
                          <td className="px-3 py-2 text-center">
                            {hasScore ? (
                              <span className={`font-mono font-bold ${getScoreColor(app.entranceExamScore)}`}>{app.entranceExamScore}/100</span>
                            ) : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="px-3 py-2 text-center font-mono">{cutOff ? `${cutOff}%` : "-"}</td>
                          <td className="px-3 py-2 text-center">
                            {passed === true && <Badge className="bg-green-500/15 text-green-600">Pass</Badge>}
                            {passed === false && <Badge className="bg-red-500/15 text-red-600">Fail</Badge>}
                            {passed === null && hasScore && <Badge variant="outline" className="text-muted-foreground">No cut-off</Badge>}
                            {!hasScore && <Badge variant="outline" className="text-muted-foreground">Not scored</Badge>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================== REPORTS TAB ===================== */}
      {activeTab === "Reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Comprehensive admission reports with per-applicant analysis</p>
              <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportReportPNG} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PNG</Button>
              <Button variant="outline" size="sm" onClick={handleExportReportPDF} disabled={exporting}><DownloadCloud className="h-4 w-4 mr-1" />PDF</Button>
              <Button variant="outline" size="sm" onClick={() => { if (reportRef.current) downloadDoc(reportRef.current, `Admission_Report_${new Date().toISOString().split("T")[0]}.doc`, "Admission Report") }}><FileText className="h-4 w-4 mr-1" />DOC</Button>
            </div>
          </div>

          <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden border space-y-6 p-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary -mx-6 -mt-6 p-6 text-white mb-6">
              <h3 className="text-lg font-bold">Admission Report</h3>
              <p className="text-sm opacity-80">Generated {new Date().toLocaleDateString()}</p>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center"><p className="text-2xl font-bold">{totalApps}</p><p className="text-xs opacity-80">Total</p></div>
                <div className="text-center"><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs opacity-80">Pending</p></div>
                <div className="text-center"><p className="text-2xl font-bold">{acceptedCount}</p><p className="text-xs opacity-80">Accepted</p></div>
                <div className="text-center"><p className="text-2xl font-bold">{rejectedCount}</p><p className="text-xs opacity-80">Rejected</p></div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Status Distribution</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {statusChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Applications by Class</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classChartData} layout="vertical">
                      <XAxis type="number" /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <Separator />

            {/* Per-applicant scores */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Applicant Scores</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-semibold text-xs">Applicant</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Score</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Cut-off</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Result</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs">Status</th>
                  </tr></thead>
                  <tbody>
                    {applications.map((app, i) => {
                      const cutOff = getCutOffForApp(app)
                      const hasScore = app.entranceExamScore != null
                      const passed = hasScore && cutOff ? app.entranceExamScore >= cutOff : null
                      return (
                        <tr key={app.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-3 py-2 font-medium">{app.firstName} {app.lastName}</td>
                          <td className="px-3 py-2 text-center">{hasScore ? `${app.entranceExamScore}/100` : "-"}</td>
                          <td className="px-3 py-2 text-center">{cutOff ? `${cutOff}%` : "-"}</td>
                          <td className="px-3 py-2 text-center">
                            {passed === true && <span className="text-green-600 font-medium">Passed</span>}
                            {passed === false && <span className="text-red-600 font-medium">Failed</span>}
                            {passed === null && <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="px-3 py-2 text-center capitalize">{app.status}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* Radar chart for scored applicants */}
            {applications.filter((a) => a.entranceExamScore != null).length > 1 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Brain className="h-4 w-4" /> Score Comparison</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={applications.filter((a) => a.entranceExamScore != null).map((a) => ({ name: `${a.firstName} ${a.lastName}`, score: a.entranceExamScore }))}>
                      <PolarGrid /><PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Ready to Accept</h4>
                  <p className="text-lg font-bold text-green-600 mt-1">{applications.filter((a) => a.entranceExamScore != null && getCutOffForApp(a) && a.entranceExamScore >= getCutOffForApp(a) && a.status === "pending").length}</p>
                  <p className="text-xs text-muted-foreground">applicants scored above cut-off</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Awaiting Scores</h4>
                  <p className="text-lg font-bold text-amber-600 mt-1">{applications.filter((a) => a.entranceExamScore == null).length}</p>
                  <p className="text-xs text-muted-foreground">applicants not yet scored</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-blue-700 flex items-center gap-1"><Award className="h-3 w-3" /> Total Accepted</h4>
                  <p className="text-lg font-bold text-blue-600 mt-1">{acceptedCount}</p>
                  <p className="text-xs text-muted-foreground">applicants accepted so far</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)} onConfirm={confirmDeleteItem}
        title="Delete Application" description={`Permanently delete ${confirmDelete?.firstName} ${confirmDelete?.lastName}'s application? This cannot be undone.`} />
    </div>
  )
}
