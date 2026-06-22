"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  FileText, Download, Printer, Plus, ScrollText, Receipt,
  Search, Eye, X, Loader2, CheckCircle2, ImageIcon, Pencil, Trash2,
  GraduationCap, ArrowRightLeft, Ban, HelpCircle, AlertTriangle,
  ThumbsUp, CreditCard, Briefcase, Calendar, Award, PartyPopper,
  FileCheck,
} from "lucide-react"
import { captureElement, openPrintWindow } from "@/lib/capture"
import { EmptyState } from "@/components/admin/EmptyState"
import { ReceiptTemplate } from "@/components/documents/ReceiptTemplate"
import { LetterRenderer } from "@/components/documents/LetterRenderer"
import {
  LETTER_TEMPLATES, getDefaultLetterContent, getTemplateAccentColor,
  type EditableLetterData, type LetterTemplateDef,
} from "@/components/documents/letter-templates"

const iconMap: Record<string, any> = {
  GraduationCap, ArrowRightLeft, Ban, HelpCircle, AlertTriangle,
  ThumbsUp, CreditCard, Briefcase, Calendar, Award, PartyPopper,
  FileCheck, FileText, ScrollText,
}

const formatCurrency = (n: number) => `₦${n.toLocaleString()}`

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [documents, setDocuments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()),
    ]).then(([d, s, p, c, sch]) => {
      setDocuments(d)
      setStudents(s)
      setPayments(p)
      setClasses(c)
      setSchool(sch)
      setLoading(false)
    })
  }, [])

  const getStudentName = (id: string) => {
    const s = students.find((s) => s.id === id)
    return s ? `${s.firstName} ${s.lastName}` : id
  }

  const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || "N/A"

  const getPaymentForReceipt = (ref: string) => {
    const payRef = ref.replace("RCP-", "")
    return payments.find((p) => p.reference === payRef)
  }

  const feeReceipts = documents.filter((d) => d.type === "fee_receipt")
  const letters = documents.filter((d) => d.type !== "fee_receipt")

  const confirmedPayments = payments.filter(
    (p) => p.status === "confirmed" && !documents.find((d) => d.reference === `RCP-${p.reference}`)
  )

  const generateReceipt = async (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId)
    if (!payment) return
    const existing = documents.find((d) => d.reference === `RCP-${payment.reference}`)
    if (existing) { toast.info("Receipt already exists"); return }
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: payment.studentId,
        type: "fee_receipt",
        title: `Fee Receipt - ${payment.reference}`,
        reference: `RCP-${payment.reference}`,
      }),
    })
    if (res.ok) {
      const doc = await res.json()
      setDocuments([...documents, doc])
      toast.success("Receipt generated")
    }
  }

  const filteredDocs = documents.filter((d) => {
    if (activeTab === "receipts") return d.type === "fee_receipt"
    if (activeTab === "letters") return d.type !== "fee_receipt"
    return true
  }).filter((d) => {
    if (!search) return true
    const q = search.toLowerCase()
    return d.title.toLowerCase().includes(q) || d.reference.toLowerCase().includes(q) || getStudentName(d.studentId).toLowerCase().includes(q)
  })

  const handleDeleteDoc = async (doc: any) => {
    try {
      await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE" })
      setDocuments(documents.filter((d) => d.id !== doc.id))
      toast.success("Document deleted")
    } catch { toast.error("Failed to delete") }
  }

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Documents</h2>
        <p className="text-sm text-muted-foreground">Generate fee receipts, official letters, and certificates</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex flex-wrap w-full gap-1.5">
          <TabsTrigger value="all" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><FileText className="h-4 w-4 mr-1" /> All</TabsTrigger>
          <TabsTrigger value="receipts" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Receipt className="h-4 w-4 mr-1" /> Receipts</TabsTrigger>
          <TabsTrigger value="letters" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><ScrollText className="h-4 w-4 mr-1" /> Letters</TabsTrigger>
          <TabsTrigger value="generate" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Plus className="h-4 w-4 mr-1" /> Generate</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "all" && (
      <div className="mt-4">
        <Card className="border-0 glass-card"><CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filteredDocs.length === 0 ? (
            <EmptyState title="No documents found" description="Generate receipts and letters from the Generate tab" />
          ) : (
            <div className="space-y-2">
              {filteredDocs.slice().reverse().map((doc) => (
                <DocumentRow key={doc.id} doc={doc} getStudentName={getStudentName} onDelete={handleDeleteDoc} />
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>
      )}

      {activeTab === "receipts" && (
      <div className="mt-4">
        <Card className="border-0 glass-card"><CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">{feeReceipts.length} fee receipt(s) generated</p>
          {feeReceipts.length === 0 ? (
            <EmptyState title="No receipts" description="Generate receipts from confirmed payments" />
          ) : (
            <div className="space-y-2">
              {feeReceipts.slice().reverse().map((doc) => (
                <DocumentRow key={doc.id} doc={doc} getStudentName={getStudentName} onDelete={handleDeleteDoc} />
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>
      )}

      {activeTab === "letters" && (
      <div className="mt-4">
        <Card className="border-0 glass-card"><CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">{letters.length} letter(s) generated</p>
          {letters.length === 0 ? (
            <EmptyState title="No letters" description="Generate letters from the Generate tab" />
          ) : (
            <div className="space-y-2">
              {letters.slice().reverse().map((doc) => (
                <DocumentRow key={doc.id} doc={doc} getStudentName={getStudentName} onDelete={handleDeleteDoc} />
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>
      )}

      {activeTab === "generate" && (
      <div className="mt-4">
        <GenerateTab
          school={school}
          students={students}
          classes={classes}
          confirmedPayments={confirmedPayments}
          documents={documents}
          setDocuments={setDocuments}
          generateReceipt={generateReceipt}
        />
      </div>
      )}
    </div>
  )
}

function DocumentRow({ doc, getStudentName, onDelete }: { doc: any; getStudentName: (id: string) => string; onDelete: (doc: any) => void }) {
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const isReceipt = doc.type === "fee_receipt"
  const templateDef = LETTER_TEMPLATES.find((t) => t.type === doc.type)

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {isReceipt ? <Receipt className="h-4 w-4 text-primary" /> : <ScrollText className="h-4 w-4 text-primary" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{doc.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {doc.reference} &bull; {getStudentName(doc.studentId)} &bull; {new Date(doc.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge className="bg-green-500/15 text-green-600 text-[10px]">{doc.status}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewDoc(doc)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(doc)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {previewDoc && (
        <PreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </>
  )
}

function PreviewModal({ doc, onClose }: { doc: any; onClose: () => void }) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [letterData, setLetterData] = useState<EditableLetterData | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/school").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ]).then(([s, c, sch, p]) => {
      setStudents(s)
      setClasses(c)
      setSchool(sch)
      setPayments(p)

      const student = s.find((st: any) => st.id === doc.studentId)
      const className = c.find((cl: any) => cl.id === student?.classId)?.name || "N/A"

      const defaults = doc.type !== "fee_receipt" ? getDefaultLetterContent(doc.type, sch.schoolName || "Access School") : null

      setLetterData({
        studentName: student ? `${student.firstName} ${student.lastName}` : "N/A",
        studentId: student?.studentId || "N/A",
        studentClass: className,
        reference: doc.reference,
        createdAt: doc.generatedAt,
        schoolName: sch.schoolName || "Access School",
        schoolMotto: sch.schoolMotto || "Excellence in Education",
        schoolAddress: sch.schoolAddress || "",
        schoolPhone: sch.schoolPhone || "",
        schoolEmail: sch.schoolEmail || "",
        schoolLogo: sch.schoolLogo || "",
        subject: doc.subject || defaults?.subject || "",
        body: doc.body || defaults?.body || "",
        recipient: doc.recipient || defaults?.recipient || "",
        salutation: doc.salutation || defaults?.salutation || "",
        closing: doc.closing || defaults?.closing || "",
        signatory: doc.signatory || defaults?.signatory || "",
        signatoryTitle: doc.signatoryTitle || defaults?.signatoryTitle || "",
      })
    })
  }, [doc])

  const handleExportPng = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const canvas = await captureElement(previewRef.current, { scale: 2 })
      const link = document.createElement("a")
      link.download = `${doc.reference}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("PNG downloaded")
    } catch { toast.error("Failed to export PNG") }
    setExporting(false)
  }

  const handleExportPdf = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const canvas = await captureElement(previewRef.current, { scale: 2 })
      const { jsPDF } = await import("jspdf")
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`${doc.reference}.pdf`)
      toast.success("PDF downloaded")
    } catch { toast.error("Failed to export PDF") }
    setExporting(false)
  }

  const handlePrint = () => {
    if (!previewRef.current) return
    openPrintWindow(previewRef.current, doc.title)
  }

  const handleSaveEdits = async () => {
    if (!letterData) return
    try {
      const res = await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc.id,
          subject: letterData.subject,
          body: letterData.body,
          recipient: letterData.recipient,
          salutation: letterData.salutation,
          closing: letterData.closing,
          signatory: letterData.signatory,
          signatoryTitle: letterData.signatoryTitle,
          title: letterData.subject ? `${letterData.subject} - ${letterData.studentName}` : doc.title,
        }),
      })
      if (res.ok) {
        toast.success("Edits saved")
        setEditing(false)
      } else {
        toast.error("Failed to save edits")
      }
    } catch { toast.error("Failed to save edits") }
  }

  const isLetter = doc.type !== "fee_receipt"

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-start pt-4 pb-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl min-w-[800px] max-w-[900px] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b bg-gray-50 gap-2 rounded-t-2xl sticky top-0 z-10">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-base truncate">{doc.title}</h3>
            <p className="text-xs text-gray-500">{doc.reference} &bull; {new Date(doc.generatedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            {isLetter && (
              <Button variant={editing ? "default" : "outline"} size="sm" onClick={() => setEditing(!editing)}>
                <Pencil className="h-4 w-4 mr-1" />
                {editing ? "Done Editing" : "Edit"}
              </Button>
            )}
            {editing && (
              <Button size="sm" onClick={handleSaveEdits} className="animated-gradient border-0 text-white">
                Save Changes
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-gray-600" onClick={handleExportPng} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              <span className="hidden sm:inline ml-1">PNG</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600" onClick={handleExportPdf} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="hidden sm:inline ml-1">PDF</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Print</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 ml-2" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto bg-gray-100 p-6 flex justify-center" style={{ minHeight: 400 }}>
          {doc.type === "fee_receipt" ? (
            <div ref={previewRef} className="shadow-lg">
              <ReceiptTemplate
                data={{
                  studentName: letterData?.studentName || "N/A",
                  studentId: letterData?.studentId || "N/A",
                  studentClass: letterData?.studentClass || "N/A",
                  amount: getPaymentForReceipt(doc.reference)?.amount || 0,
                  paid: getPaymentForReceipt(doc.reference)?.paid || getPaymentForReceipt(doc.reference)?.amount || 0,
                  balance: getPaymentForReceipt(doc.reference) ? (getPaymentForReceipt(doc.reference)!.amount - (getPaymentForReceipt(doc.reference)!.paid || getPaymentForReceipt(doc.reference)!.amount)) : 0,
                  term: getPaymentForReceipt(doc.reference)?.term || "N/A",
                  session: getPaymentForReceipt(doc.reference)?.session || "N/A",
                  method: getPaymentForReceipt(doc.reference)?.method || "N/A",
                  createdAt: doc.generatedAt,
                  reference: doc.reference,
                  schoolName: letterData?.schoolName || "Access School",
                  schoolMotto: letterData?.schoolMotto || "",
                  schoolAddress: letterData?.schoolAddress || "",
                  schoolPhone: letterData?.schoolPhone || "",
                  schoolEmail: letterData?.schoolEmail || "",
                  schoolLogo: letterData?.schoolLogo || "",
                }}
              />
            </div>
          ) : letterData ? (
            <div ref={previewRef} className="shadow-lg">
              <LetterRenderer
                data={letterData}
                editable={editing}
                onChange={(field, value) => setLetterData((prev) => prev ? { ...prev, [field]: value } : prev)}
                letterType={doc.type}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  function getPaymentForReceipt(ref: string) {
    const payRef = ref.replace("RCP-", "")
    return payments.find((p) => p.reference === payRef) || null
  }
}

function GenerateTab({
  school, students, classes, confirmedPayments, documents, setDocuments, generateReceipt,
}: {
  school: any; students: any[]; classes: any[]; confirmedPayments: any[];
  documents: any[]; setDocuments: (docs: any[]) => void; generateReceipt: (id: string) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplateDef | null>(null)
  const [letterStudentId, setLetterStudentId] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [generating, setGenerating] = useState(false)
  const [editingLetter, setEditingLetter] = useState(false)
  const [letterData, setLetterData] = useState<EditableLetterData | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const filteredStudents = students.filter((s) => {
    if (!studentSearch) return true
    return `${s.firstName} ${s.lastName} ${s.studentId || ""}`.toLowerCase().includes(studentSearch.toLowerCase())
  })

  const categories = [
    { key: "academic", label: "Academic" },
    { key: "disciplinary", label: "Disciplinary" },
    { key: "administrative", label: "Administrative" },
    { key: "certification", label: "Certification" },
    { key: "finance", label: "Finance" },
  ]

  const selectedStudent = students.find((s) => s.id === letterStudentId)

  const handlePreviewLetter = () => {
    if (!selectedStudent || !selectedTemplate || !school) return
    const className = classes.find((c) => c.id === selectedStudent.classId)?.name || "N/A"
    const defaults = getDefaultLetterContent(selectedTemplate.type, school.schoolName || "Access School")

    setLetterData({
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      studentId: selectedStudent.studentId || "N/A",
      studentClass: className,
      reference: `${selectedTemplate.type.toUpperCase().slice(0, 3)}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      schoolName: school.schoolName || "Access School",
      schoolMotto: school.schoolMotto || "Excellence in Education",
      schoolAddress: school.schoolAddress || "",
      schoolPhone: school.schoolPhone || "",
      schoolEmail: school.schoolEmail || "",
      schoolLogo: school.schoolLogo || "",
      subject: defaults.subject,
      body: defaults.body,
      recipient: defaults.recipient,
      salutation: defaults.salutation,
      closing: defaults.closing,
      signatory: defaults.signatory,
      signatoryTitle: defaults.signatoryTitle,
    })
    setEditingLetter(true)
  }

  const handleSaveLetter = async () => {
    if (!letterData || !selectedTemplate) return
    setGenerating(true)
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: letterStudentId,
          type: selectedTemplate.type,
          title: `${letterData.subject || selectedTemplate.name} - ${letterData.studentName}`,
          reference: letterData.reference,
          subject: letterData.subject,
          body: letterData.body,
          recipient: letterData.recipient,
          salutation: letterData.salutation,
          closing: letterData.closing,
          signatory: letterData.signatory,
          signatoryTitle: letterData.signatoryTitle,
        }),
      })
      if (res.ok) {
        const doc = await res.json()
        setDocuments([...documents, doc])
        toast.success(`${selectedTemplate.name} generated`)
        resetForm()
      } else {
        toast.error("Failed to generate letter")
      }
    } catch { toast.error("Failed to generate letter") }
    setGenerating(false)
  }

  const resetForm = () => {
    setSelectedTemplate(null)
    setLetterStudentId("")
    setStudentSearch("")
    setEditingLetter(false)
    setLetterData(null)
  }

  if (editingLetter && letterData && selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${selectedTemplate.color}`}>
              {(() => { const Icon = iconMap[selectedTemplate.icon] || FileText; return <Icon className="h-4 w-4 text-white" /> })()}
            </div>
            <div>
              <h3 className="font-semibold text-base">{selectedTemplate.name}</h3>
              <p className="text-xs text-muted-foreground">Editing: {letterData.studentName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm}>
            <X className="h-4 w-4 mr-1" /> Back to Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 glass-card">
            <CardContent className="p-4 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Letter Content</h4>

              <div className="space-y-2">
                <Label>Recipient</Label>
                <Input
                  value={letterData.recipient || ""}
                  onChange={(e) => setLetterData({ ...letterData, recipient: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Salutation</Label>
                <Input
                  value={letterData.salutation || ""}
                  onChange={(e) => setLetterData({ ...letterData, salutation: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={letterData.subject || ""}
                  onChange={(e) => setLetterData({ ...letterData, subject: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Letter Body</Label>
                <textarea
                  value={letterData.body || ""}
                  onChange={(e) => setLetterData({ ...letterData, body: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[240px] resize-y"
                  rows={12}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Closing</Label>
                  <Input
                    value={letterData.closing || ""}
                    onChange={(e) => setLetterData({ ...letterData, closing: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Signatory</Label>
                  <Input
                    value={letterData.signatory || ""}
                    onChange={(e) => setLetterData({ ...letterData, signatory: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Signatory Title</Label>
                <Input
                  value={letterData.signatoryTitle || ""}
                  onChange={(e) => setLetterData({ ...letterData, signatoryTitle: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveLetter} disabled={generating} className="flex-1 animated-gradient border-0 text-white">
                  {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
                  Generate & Save
                </Button>
                <Button variant="outline" onClick={resetForm} className="shrink-0">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-100 rounded-xl p-4 overflow-auto flex justify-center" style={{ minHeight: 600 }}>
            <div ref={previewRef} className="shadow-lg">
              <LetterRenderer
                data={letterData}
                editable={false}
                letterType={selectedTemplate.type}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 glass-card"><CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Generate Fee Receipts</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Create official receipts for confirmed payments that don&apos;t have one yet.</p>
        {confirmedPayments.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            All confirmed payments have receipts
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {confirmedPayments.map((p) => {
              const student = students.find((s) => s.id === p.studentId)
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{student ? `${student.firstName} ${student.lastName}` : "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{p.reference} &bull; {formatCurrency(p.amount)} &bull; {p.method}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => generateReceipt(p.id)} className="shrink-0">
                    <Receipt className="h-3.5 w-3.5 mr-1" /> Generate
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent></Card>

      <Card className="border-0 glass-card"><CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Generate Letters &amp; Documents</h3>
        </div>

        {!selectedTemplate ? (
          <div className="space-y-4">
            {categories.map((cat) => {
              const templates = LETTER_TEMPLATES.filter((t) => t.category === cat.key)
              if (templates.length === 0) return null
              return (
                <div key={cat.key}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.label}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {templates.map((tpl) => {
                      const Icon = iconMap[tpl.icon] || FileText
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl)}
                          className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tpl.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{tpl.name}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{tpl.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${selectedTemplate.color}`}>
                  {(() => { const Icon = iconMap[selectedTemplate.icon] || FileText; return <Icon className="h-4 w-4 text-white" /> })()}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedTemplate.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedTemplate(null); setLetterStudentId(""); setStudentSearch("") }}>
                <X className="h-4 w-4 mr-1" /> Change
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Select Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type to search students..."
                  className="pl-9 h-10"
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setLetterStudentId("") }}
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">No students found</p>
                ) : (
                  filteredStudents.slice(0, 20).map((s) => (
                    <button
                      key={s.id}
                      className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${letterStudentId === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                      onClick={() => { setLetterStudentId(s.id); setStudentSearch(`${s.firstName} ${s.lastName}`) }}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{s.firstName} {s.lastName}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{s.studentId || s.id}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={handlePreviewLetter}
              disabled={!letterStudentId}
              className="w-full animated-gradient border-0 text-white"
            >
              <Pencil className="h-4 w-4 mr-1" /> Preview & Edit {selectedTemplate.name}
            </Button>
          </div>
        )}
      </CardContent></Card>
    </div>
  )
}
