"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, Download, Printer, Users, GraduationCap, RefreshCw, Edit3, Eye, EyeOff, ArrowLeft, QrCode, RotateCw, FileDown } from "lucide-react"
import { captureElement, elementToPngBlob, downloadPng, downloadPdf, openPrintWindow } from "@/lib/capture"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { createRoot } from "react-dom/client"
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
  const cardInnerRef = useRef<HTMLDivElement>(null)

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
    }).catch(() => setLoading(false))
  }, [])

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())
  )
  const filteredStaff = staff.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.staffId}`.toLowerCase().includes(search.toLowerCase())
  )

  const cardName = tab === "students" && selectedStudent
    ? `${selectedStudent.firstName}_${selectedStudent.lastName}_ID`
    : selectedStaff ? `${selectedStaff.firstName}_${selectedStaff.lastName}_ID` : "ID_Card"

  const exportSingleCard = async (format: "png" | "pdf") => {
    const item = tab === "students" ? selectedStudent : selectedStaff
    if (!item || !school || !cardInnerRef.current) return
    try {
      if (format === "png") {
        await downloadPng(cardInnerRef.current, `${cardName}_${showBack ? "Back" : "Front"}.png`, { scale: 4, inlineStyles: true })
        toast.success("ID card downloaded as PNG")
      } else {
        await downloadPdf(cardInnerRef.current, `${cardName}.pdf`, { scale: 4, inlineStyles: true })
        toast.success("ID card downloaded as PDF")
      }
    } catch (err) {
      console.error("ID card export error:", err)
      toast.error("Failed to export")
    }
  }

  const renderCardToContainer = (el: HTMLElement, item: any, side: "front" | "back") => {
    const root = createRoot(el)
    if (tab === "students") {
      if (side === "front") {
        root.render(<StudentIDCardFront student={item} school={school!} classes={classes} orientation={orientation} />)
      } else {
        root.render(<StudentIDCardBack student={item} school={school!} config={idCardConfig} orientation={orientation} />)
      }
    } else {
      if (side === "front") {
        root.render(<StaffIDCardFront staff={item} school={school!} orientation={orientation} />)
      } else {
        root.render(<StaffIDCardBack staff={item} school={school!} config={staffIdCardConfig} orientation={orientation} />)
      }
    }
    return root
  }

  const captureCardCanvas = async (item: any, side: "front" | "back"): Promise<HTMLCanvasElement> => {
    const cardW = orientation === "landscape" ? 600 : 340
    const cardH = orientation === "landscape" ? 300 : 510
    const container = document.createElement("div")
    container.style.width = `${cardW}px`
    container.style.height = `${cardH}px`
    container.style.overflow = "hidden"
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "0"
    container.style.background = "#ffffff"
    document.body.appendChild(container)

    const root = renderCardToContainer(container, item, side)
    await new Promise((r) => setTimeout(r, 300))

    const canvas = await captureElement(container, { scale: 2, backgroundColor: "#ffffff", inlineStyles: true })
    root.unmount()
    document.body.removeChild(container)
    return canvas
  }

  const handleBulkExportZip = async () => {
    setBulkExporting(true)
    try {
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      const list = tab === "students" ? filteredStudents : filteredStaff
      const slug = tab === "students" ? "Student" : "Staff"
      if (list.length === 0) { toast.error("No items to export"); setBulkExporting(false); return }

      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const prefix = `${item.firstName}_${item.lastName}`
        toast.info(`Exporting ${i + 1}/${list.length}: ${prefix}`)

        const frontCanvas = await captureCardCanvas(item, "front")
        const frontBlob = await new Promise<Blob>((resolve, reject) => frontCanvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
        zip.file(`${prefix}_Front.png`, frontBlob)

        const backCanvas = await captureCardCanvas(item, "back")
        const backBlob = await new Promise<Blob>((resolve, reject) => backCanvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png"))
        zip.file(`${prefix}_Back.png`, backBlob)
      }

      const content = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `${slug}_ID_Cards.zip`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success(`Exported ${list.length} ID cards (front & back) as ZIP`)
    } catch (err) { console.error(err); toast.error("ZIP export failed") }
    setBulkExporting(false)
  }

  const handleBulkExportPdfSideBySide = async () => {
    setBulkExporting(true)
    try {
      const { jsPDF } = await import("jspdf")
      const list = tab === "students" ? filteredStudents : filteredStaff
      const slug = tab === "students" ? "Student" : "Staff"
      if (list.length === 0) { toast.error("No items to export"); setBulkExporting(false); return }

      const isPortraitCards = orientation === "portrait"
      const gap = 20
      let pdf: import("jspdf").jsPDF | null = null

      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        toast.info(`Exporting ${i + 1}/${list.length}: ${item.firstName} ${item.lastName}`)

        const frontCanvas = await captureCardCanvas(item, "front")
        const backCanvas = await captureCardCanvas(item, "back")

        if (isPortraitCards) {
          const pageW = frontCanvas.width + gap + backCanvas.width
          const pageH = Math.max(frontCanvas.height, backCanvas.height)
          if (i == 0) {
            pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [pageW, pageH] })
          } else {
            pdf!.addPage([pageW, pageH], "landscape")
          }
          pdf!.addImage(frontCanvas, "PNG", 0, 0, frontCanvas.width, frontCanvas.height)
          pdf!.addImage(backCanvas, "PNG", frontCanvas.width + gap, 0, backCanvas.width, backCanvas.height)
        } else {
          const pageW = Math.max(frontCanvas.width, backCanvas.width)
          const pageH = frontCanvas.height + gap + backCanvas.height
          if (i == 0) {
            pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [pageW, pageH] })
          } else {
            pdf!.addPage([pageW, pageH], "portrait")
          }
          pdf!.addImage(frontCanvas, "PNG", 0, 0, frontCanvas.width, frontCanvas.height)
          pdf!.addImage(backCanvas, "PNG", 0, frontCanvas.height + gap, backCanvas.width, backCanvas.height)
        }
      }

      pdf!.save(`${slug}_ID_Cards.pdf`)
      toast.success(`Exported ${list.length} ID cards (front & back) as PDF`)
    } catch (err) { console.error(err); toast.error("PDF export failed") }
    setBulkExporting(false)
  }

  const handlePrintCard = () => {
    if (!cardInnerRef.current) return
    openPrintWindow(cardInnerRef.current, "ID Card")
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
        <>
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch("") }} className="mb-4">
            <TabsList className="flex flex-wrap w-full gap-1.5">
              <TabsTrigger value="students" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all data-[state=active]:animated-gradient data-[state=active]:text-white"><Users className="h-4 w-4 mr-1.5" /> Student ID Cards</TabsTrigger>
              <TabsTrigger value="staff" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all data-[state=active]:animated-gradient data-[state=active]:text-white"><GraduationCap className="h-4 w-4 mr-1.5" /> Staff ID Cards</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "students" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students by name or ID..." className="pl-9 h-12" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="md" disabled={bulkExporting || filteredStudents.length === 0} className="shrink-0 min-w-[140px]" />}>
                  <FileDown className="h-4 w-4 mr-1.5" /> {bulkExporting ? "Exporting..." : "Export All"}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBulkExportZip} disabled={bulkExporting}>Export as ZIP (PNGs)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkExportPdfSideBySide} disabled={bulkExporting}>Export as PDF (side-by-side)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          </div>
          )}

          {tab === "staff" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff by name or ID..." className="pl-9 h-12" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="md" disabled={bulkExporting || filteredStaff.length === 0} className="shrink-0 min-w-[140px]" />}>
                  <FileDown className="h-4 w-4 mr-1.5" /> {bulkExporting ? "Exporting..." : "Export All"}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBulkExportZip} disabled={bulkExporting}>Export as ZIP (PNGs)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkExportPdfSideBySide} disabled={bulkExporting}>Export as PDF (side-by-side)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          </div>
          )}
        </>
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
              <div ref={cardInnerRef} className="w-full" style={{ width: orientation === "landscape" ? 600 : 340, minHeight: orientation === "landscape" ? 300 : 480 }}>
                {selectedStudent && school ? (
                  showBack ? (
                    <StudentIDCardBack student={selectedStudent} school={school} config={idCardConfig} orientation={orientation} />
                  ) : (
                    <StudentIDCardFront student={selectedStudent} school={school} classes={classes} orientation={orientation} />
                  )
                ) : selectedStaff && school ? (
                  showBack ? (
                    <StaffIDCardBack staff={selectedStaff} school={school} config={staffIdCardConfig} orientation={orientation} />
                  ) : (
                    <StaffIDCardFront staff={selectedStaff} school={school} orientation={orientation} />
                  )
                ) : null}
              </div>
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


