"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, Download, Printer, Users, GraduationCap, RefreshCw, Edit3, Eye, EyeOff, ArrowLeft, QrCode, RotateCw, FileDown } from "lucide-react"
import { StudentIDCardFront } from "@/components/id-card/StudentIDCardFront"
import { StudentIDCardBack } from "@/components/id-card/StudentIDCardBack"
import { StaffIDCardFront } from "@/components/id-card/StaffIDCardFront"
import { StaffIDCardBack } from "@/components/id-card/StaffIDCardBack"

export default function AdminIDCardsPage() {
  const [tab, setTab] = useState("students")
  const [students, setStudents] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [showBack, setShowBack] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [idCardConfig, setIdCardConfig] = useState<any>(null)
  const [staffIdCardConfig, setStaffIdCardConfig] = useState<any>(null)
  const [bulkExporting, setBulkExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()),
    ]).then(([s, st, c, sch]) => {
      setStudents(s)
      setStaff(st)
      setClasses(c)
      setSchool(sch)
      setIdCardConfig(sch.studentIdCardConfig || { backTitle: "Student Information", showAddress: true, showBloodGroup: true, showEmergencyContact: true, showMedicalNotes: true, showRules: true, rulesText: "1. This card is the property of the school and must be returned upon request.\n2. Report lost or damaged cards immediately to the school office.\n3. This card is non-transferable and for official school use only.\n4. Students must present this card for identification and attendance purposes.\n5. Unauthorized modification of this card is prohibited.", customFields: [] })
      setStaffIdCardConfig(sch.staffIdCardConfig || { backTitle: "Staff Information", showDepartment: true, showEmergencyContact: true, showRules: true, rulesText: "1. This card is the property of the school and must be returned upon request.\n2. Report lost or damaged cards immediately to the school office.\n3. This card is non-transferable and for official staff use only.\n4. Staff must present this card for identification and access purposes.\n5. Unauthorized modification of this card is prohibited.", customFields: [] })
      setLoading(false)
    })
  }, [])

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())
  )
  const filteredStaff = staff.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.staffId}`.toLowerCase().includes(search.toLowerCase())
  )

  const exportSingleCard = async (format: "png" | "pdf") => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff", useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const name = tab === "students" && selectedStudent
        ? `${selectedStudent.firstName}_${selectedStudent.lastName}_ID`
        : selectedStaff ? `${selectedStaff.firstName}_${selectedStaff.lastName}_ID` : "ID_Card"

      if (format === "png") {
        const link = document.createElement("a")
        link.download = `${name}_${showBack ? "Back" : "Front"}.png`
        link.href = imgData
        link.click()
        toast.success("ID card downloaded as PNG")
      } else {
        const { jsPDF } = await import("jspdf")
        const pdf = new jsPDF(orientation === "portrait" ? "p" : "l", "mm", orientation === "portrait" ? "a4" : "a4")
        const pdfWidth = orientation === "portrait" ? 210 : 297
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${name}.pdf`)
        toast.success("ID card downloaded as PDF")
      }
    } catch { toast.error("Failed to export") }
  }

  const handleBulkExport = async () => {
    setBulkExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      const list = tab === "students" ? filteredStudents : filteredStaff
      const slug = tab === "students" ? "Student" : "Staff"
      if (list.length === 0) { toast.error("No items to export"); setBulkExporting(false); return }

      const pdf = new jsPDF(orientation === "portrait" ? "p" : "l", "mm", orientation === "portrait" ? "a4" : "a4")
      const pageW = orientation === "portrait" ? 210 : 297
      const pageH = orientation === "portrait" ? 297 : 210

      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const container = document.createElement("div")
        container.style.position = "fixed"
        container.style.left = "-9999px"
        container.style.top = "0"
        container.style.background = "#ffffff"
        container.style.padding = "20px"
        container.innerHTML = tab === "students"
          ? `<div>${renderStudentCardHTML(item, school, classes)}</div>`
          : `<div>${renderStaffCardHTML(item, school)}</div>`
        document.body.appendChild(container)

        const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff", useCORS: true })
        document.body.removeChild(container)

        const imgData = canvas.toDataURL("image/png")
        const imgW = pageW
        const imgH = (canvas.height * imgW) / canvas.width

        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH)
      }

      pdf.save(`${slug}_ID_Cards_Bulk.pdf`)
      toast.success(`Exported ${list.length} ID cards`)
    } catch (err) { console.error(err); toast.error("Bulk export failed") }
    setBulkExporting(false)
  }

  const handlePrintCard = () => {
    if (!cardRef.current) return
    const html = cardRef.current.outerHTML
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<html><head><title>ID Card</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5}img{max-width:100%}</style></head><body>${html}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  const handleSaveConfig = async () => {
    try {
      await fetch("/api/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIdCardConfig: idCardConfig,
          staffIdCardConfig: staffIdCardConfig,
        }),
      })
      toast.success("ID card settings saved")
    } catch { toast.error("Failed to save") }
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-96"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">ID Card Generator</h2>
          <p className="text-sm text-muted-foreground">Generate, export and manage student &amp; staff ID cards</p>
        </div>
        {(selectedStudent || selectedStaff) && (
          <Button variant="outline" size="sm" onClick={() => { setSelectedStudent(null); setSelectedStaff(null); setShowBack(false) }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
      </motion.div>

      {!selectedStudent && !selectedStaff ? (
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch("") }}>
          <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-max gap-1.5">
              <TabsTrigger value="students" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Users className="h-4 w-4 mr-1" /> Student ID Cards</TabsTrigger>
              <TabsTrigger value="staff" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><GraduationCap className="h-4 w-4 mr-1" /> Staff ID Cards</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="students" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students by name or ID..." className="pl-9 h-12" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={bulkExporting || filteredStudents.length === 0} className="shrink-0">
                <FileDown className="h-4 w-4 mr-1" /> {bulkExporting ? "Exporting..." : `Export All (${filteredStudents.length})`}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((s) => (
                <Card key={s.id} className="glass-card border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStudent(s)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {s.passportPhoto ? (
                        <img src={s.passportPhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <AvatarFallback className="text-sm">{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.studentId}</p>
                      <p className="text-[10px] text-muted-foreground">{classes.find((c) => c.id === s.classId)?.name || "N/A"}</p>
                    </div>
                    <QrCode className="h-5 w-5 text-primary/40" />
                  </CardContent>
                </Card>
              ))}
              {filteredStudents.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-muted-foreground">No students found</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff by name or ID..." className="pl-9 h-12" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={bulkExporting || filteredStaff.length === 0} className="shrink-0">
                <FileDown className="h-4 w-4 mr-1" /> {bulkExporting ? "Exporting..." : `Export All (${filteredStaff.length})`}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStaff.map((s) => (
                <Card key={s.id} className="glass-card border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStaff(s)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm">{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.staffId}</p>
                      <p className="text-[10px] text-muted-foreground">{s.role || s.department || "Staff"}</p>
                    </div>
                    <QrCode className="h-5 w-5 text-indigo-400/40" />
                  </CardContent>
                </Card>
              ))}
              {filteredStaff.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-muted-foreground">No staff found</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Preview</h3>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${orientation === "portrait" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    onClick={() => setOrientation("portrait")}
                  >Portrait</button>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${orientation === "landscape" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    onClick={() => setOrientation("landscape")}
                  >Landscape</button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setShowBack(!showBack)}>
                  {showBack ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
                  {showBack ? "Front" : "Back"}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintCard}>
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportSingleCard("png")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> PNG
                </Button>
                <Button size="sm" className="animated-gradient border-0 text-white shadow-lg shadow-primary/25" onClick={() => exportSingleCard("pdf")}>
                  <FileDown className="h-3.5 w-3.5 mr-1" /> PDF
                </Button>
              </div>
            </div>

            <div ref={cardRef} className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-border/40 overflow-auto">
              {selectedStudent && school ? (
                showBack ? (
                  <StudentIDCardBack student={selectedStudent} school={school} config={idCardConfig} />
                ) : (
                  <StudentIDCardFront student={selectedStudent} school={school} classes={classes} orientation={orientation} />
                )
              ) : selectedStaff && school ? (
                showBack ? (
                  <StaffIDCardBack staff={selectedStaff} school={school} config={staffIdCardConfig} />
                ) : (
                  <StaffIDCardFront staff={selectedStaff} school={school} orientation={orientation} />
                )
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Edit3 className="h-4 w-4 text-primary" />
                  ID Card Back Settings {selectedStudent ? "(Student)" : selectedStaff ? "(Staff)" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Configure what appears on the back of the ID card. Check a field to show it; type custom text to override the data.</p>
                <div className="space-y-2">
                  <Label>Back Panel Title</Label>
                  <Input value={selectedStaff ? (staffIdCardConfig?.backTitle || "Staff Information") : (idCardConfig?.backTitle || "Student Information")}
                    onChange={(e) => {
                      if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, backTitle: e.target.value })
                      else setIdCardConfig({ ...idCardConfig, backTitle: e.target.value })
                    }} />
                </div>
                <div className="space-y-4">
                  {selectedStaff
                    ? ([
                        { key: "showDepartment", label: "Department", customKey: "customDepartment" },
                        { key: "showEmergencyContact", label: "Emergency Contact", customKey: "customEmergencyContact" },
                      ] as const).map(({ key, label, customKey }) => (
                        <div key={key} className="space-y-1.5 rounded-lg border border-border/50 p-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={(staffIdCardConfig as any)?.[key] ?? true}
                              onChange={(e) => setStaffIdCardConfig({ ...staffIdCardConfig, [key]: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-sm font-medium">{label}</span>
                          </label>
                          <Input placeholder={`Custom ${label.toLowerCase()} (overrides data)`}
                            value={(staffIdCardConfig as any)?.[customKey] || ""}
                            onChange={(e) => setStaffIdCardConfig({ ...staffIdCardConfig, [customKey]: e.target.value })}
                            className="h-9 text-xs" />
                        </div>
                      ))
                    : ([
                        { key: "showAddress", label: "Address", customKey: "customAddress" },
                        { key: "showBloodGroup", label: "Blood Group", customKey: "customBloodGroup" },
                        { key: "showEmergencyContact", label: "Emergency Contact", customKey: "customEmergencyContact" },
                        { key: "showMedicalNotes", label: "Medical Notes", customKey: "customMedicalNotes" },
                      ] as const).map(({ key, label, customKey }) => (
                        <div key={key} className="space-y-1.5 rounded-lg border border-border/50 p-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={(idCardConfig as any)?.[key] ?? true}
                              onChange={(e) => setIdCardConfig({ ...idCardConfig, [key]: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-sm font-medium">{label}</span>
                          </label>
                          <Input placeholder={`Custom ${label.toLowerCase()} (overrides data)`}
                            value={(idCardConfig as any)?.[customKey] || ""}
                            onChange={(e) => setIdCardConfig({ ...idCardConfig, [customKey]: e.target.value })}
                            className="h-9 text-xs" />
                        </div>
                      ))
                  }
                </div>
                <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox"
                      checked={selectedStaff ? (staffIdCardConfig as any)?.showRules ?? true : (idCardConfig as any)?.showRules ?? true}
                      onChange={(e) => {
                        if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, showRules: e.target.checked })
                        else setIdCardConfig({ ...idCardConfig, showRules: e.target.checked })
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Show Rules &amp; Regulations</span>
                  </label>
                  <textarea
                    placeholder="Enter ID card rules (one per line)..."
                    value={selectedStaff ? (staffIdCardConfig as any)?.rulesText || "" : (idCardConfig as any)?.rulesText || ""}
                    onChange={(e) => {
                      if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, rulesText: e.target.value })
                      else setIdCardConfig({ ...idCardConfig, rulesText: e.target.value })
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs min-h-[80px] resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Custom Fields (label:value)</Label>
                  {((selectedStaff ? staffIdCardConfig : idCardConfig)?.customFields || []).map((f: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Label" value={f.label} onChange={(e) => {
                        const fields = [...((selectedStaff ? staffIdCardConfig : idCardConfig)?.customFields || [])]
                        fields[i] = { ...fields[i], label: e.target.value }
                        if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, customFields: fields })
                        else setIdCardConfig({ ...idCardConfig, customFields: fields })
                      }} className="h-9 text-xs flex-1" />
                      <Input placeholder="Value" value={f.value} onChange={(e) => {
                        const fields = [...((selectedStaff ? staffIdCardConfig : idCardConfig)?.customFields || [])]
                        fields[i] = { ...fields[i], value: e.target.value }
                        if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, customFields: fields })
                        else setIdCardConfig({ ...idCardConfig, customFields: fields })
                      }} className="h-9 text-xs flex-1" />
                      <button onClick={() => {
                        const fields = [...((selectedStaff ? staffIdCardConfig : idCardConfig)?.customFields || [])]
                        fields.splice(i, 1)
                        if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, customFields: fields })
                        else setIdCardConfig({ ...idCardConfig, customFields: fields })
                      }} className="text-red-500 hover:text-red-700 px-2 text-sm">✕</button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const fields = [...((selectedStaff ? staffIdCardConfig : idCardConfig)?.customFields || []), { label: "", value: "" }]
                    if (selectedStaff) setStaffIdCardConfig({ ...staffIdCardConfig, customFields: fields })
                    else setIdCardConfig({ ...idCardConfig, customFields: fields })
                  }} className="w-full text-xs">+ Add Custom Field</Button>
                </div>
                <Button onClick={handleSaveConfig} className="w-full animated-gradient border-0 text-white shadow-lg shadow-primary/25">
                  <RefreshCw className="h-4 w-4 mr-1" /> Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4 space-y-2">
                <h4 className="text-sm font-semibold">{selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : ""}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <Info label="ID" value={selectedStudent?.studentId || selectedStaff?.staffId} />
                  <Info label="Class/Dept" value={selectedStudent ? (classes.find((c) => c.id === selectedStudent.classId)?.name || "N/A") : (selectedStaff?.department || "N/A")} />
                  <Info label="Gender" value={selectedStudent?.gender || selectedStaff?.gender} />
                  <Info label="Blood Group" value={selectedStudent?.bloodGroup || "N/A"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium">{label}</p>
      <p className="text-xs truncate">{value || "N/A"}</p>
    </div>
  )
}

function renderStudentCardHTML(student: any, school: any, classes: any[]) {
  const cls = classes.find((c) => c.id === student.classId)
  const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase()
  const qrData = JSON.stringify({ type: "student", id: student.id, code: student.studentId })
  return `
    <div style="width:340px;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);border:1px solid #e5e7eb;font-family:sans-serif">
      <div style="background:linear-gradient(135deg,#6366f1,#06b6d4);padding:20px;text-align:center;color:white">
        ${school.logo ? `<img src="${school.logo}" style="height:48px;width:48px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);object-fit:cover;margin:0 auto 4px" />` : `<div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-weight:bold;font-size:18px">S</div>`}
        <p style="font-size:14px;font-weight:bold;margin:0">${school.name}</p>
        <p style="font-size:10px;opacity:0.8;margin:2px 0 0">STUDENT ID CARD</p>
      </div>
      <div style="padding:20px;display:flex;gap:16px;background:white">
        <div style="width:80px;height:80px;border-radius:12px;border:2px solid rgba(99,102,241,0.2);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(6,182,212,0.1))">
          ${student.passportPhoto ? `<img src="${student.passportPhoto}" style="width:100%;height:100%;object-fit:cover" />` : `<span style="font-size:20px;font-weight:bold;color:#6366f1">${initials}</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <p style="font-size:14px;font-weight:bold;color:#111;margin:0">${student.firstName} ${student.lastName}</p>
          <p style="font-size:12px;color:#6b7280;margin:2px 0">${cls?.name || "N/A"}</p>
          <p style="font-size:10px;color:#9ca3af;margin:0">ID: ${student.studentId}</p>
          ${student.gender ? `<p style="font-size:10px;color:#9ca3af;margin:2px 0">Gender: ${student.gender}</p>` : ""}
        </div>
      </div>
      <div style="background:#f9fafb;padding:10px 20px;border-top:1px solid #e5e7eb;text-align:center;font-size:9px;color:#9ca3af">Valid for current session</div>
    </div>
  `
}

function renderStaffCardHTML(staff: any, school: any) {
  const initials = `${staff.firstName?.[0] || ""}${staff.lastName?.[0] || ""}`.toUpperCase()
  return `
    <div style="width:340px;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);border:1px solid #e5e7eb;font-family:sans-serif">
      <div style="background:linear-gradient(135deg,#4338ca,#7c3aed,#4338ca);padding:20px;text-align:center;color:white">
        ${school.logo ? `<img src="${school.logo}" style="height:44px;width:44px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);object-fit:cover;margin:0 auto 4px" />` : `<div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-weight:bold;font-size:16px">S</div>`}
        <p style="font-size:14px;font-weight:bold;margin:0">${school.name}</p>
        <p style="font-size:10px;opacity:0.8;margin:2px 0 0">STAFF IDENTIFICATION CARD</p>
      </div>
      <div style="padding:20px;display:flex;gap:16px;align-items:center;background:white">
        <div style="width:80px;height:80px;border-radius:12px;border:2px solid #c7d2fe;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#eef2ff,#faf5ff)">
          <span style="font-size:20px;font-weight:bold;color:#4338ca">${initials}</span>
        </div>
        <div style="flex:1;min-width:0">
          <p style="font-size:15px;font-weight:bold;color:#111;margin:0">${staff.firstName} ${staff.lastName}</p>
          <p style="font-size:12px;font-weight:500;color:#4338ca;margin:2px 0">${staff.role || "Staff"}</p>
          ${staff.department ? `<p style="font-size:11px;color:#6b7280;margin:0">${staff.department}</p>` : ""}
          <p style="font-size:10px;color:#9ca3af;margin:2px 0">${staff.staffId}</p>
        </div>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:10px 20px;display:flex;justify-content:space-between;font-size:10px;color:#6b7280;background:linear-gradient(135deg,#eef2ff,#faf5ff)">
        <span>${staff.email || ""}</span>
        <span>${staff.phone || ""}</span>
      </div>
    </div>
  `
}
