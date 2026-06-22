"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  FileText, Download, Printer, Plus, FileCheck, ScrollText, Receipt,
  User, Search, Eye, X, Loader2, CheckCircle2, AlertCircle, ImageIcon
} from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"
import { ReceiptTemplate } from "@/components/documents/ReceiptTemplate"
import { AcceptanceLetterTemplate } from "@/components/documents/AcceptanceLetterTemplate"
import { TransferLetterTemplate } from "@/components/documents/TransferLetterTemplate"

const formatCurrency = (n: number) => `₦${n.toLocaleString()}`

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [documents, setDocuments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [school, setSchool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [exporting, setExporting] = useState<string | null>(null)

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

  const generateLetter = async (type: string, studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) { toast.error("Please select a student"); return }
    const letterType = type === "acceptance" ? "Acceptance Letter" : "Transfer Letter"
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        type,
        title: `${letterType} - ${student.firstName} ${student.lastName}`,
        reference: `${type === "acceptance" ? "ACC" : "TRF"}-${Date.now()}`,
      }),
    })
    if (res.ok) {
      const doc = await res.json()
      setDocuments([...documents, doc])
      toast.success(`${letterType} generated`)
    }
  }

  const generateLetterWithSelector = async () => {
    if (!letterStudentId || !letterType) { toast.error("Select a student and letter type"); return }
    await generateLetter(letterType, letterStudentId)
    setShowLetterForm(false)
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

  const exportAsPng = async (doc: any) => {
    if (!previewRef.current) return
    setExporting(doc.id)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
      const link = document.createElement("a")
      link.download = `${doc.reference}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("PNG downloaded")
    } catch { toast.error("Failed to export PNG") }
    setExporting(null)
  }

  const exportAsPdf = async (doc: any) => {
    if (!previewRef.current) return
    setExporting(doc.id)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`${doc.reference}.pdf`)
      toast.success("PDF downloaded")
    } catch { toast.error("Failed to export PDF") }
    setExporting(null)
  }

  const printDocument = () => {
    const w = window.open("", "_blank")
    if (!w || !previewRef.current) return
    w.document.write(`<html><head><title>Print</title><style>body{margin:0}@media print{@page{margin:0}}img{max-width:100%}</style></head><body>`)
    w.document.write(previewRef.current.innerHTML)
    w.document.write("</body></html>")
    w.document.close()
    w.print()
  }

  const filteredStudents = students.filter((s) => {
    if (!genStudentSearch) return true
    return `${s.firstName} ${s.lastName} ${s.studentId || ""}`.toLowerCase().includes(genStudentSearch.toLowerCase())
  })

  const [letterType, setLetterType] = useState("acceptance")
  const [letterStudentId, setLetterStudentId] = useState("")
  const [showLetterForm, setShowLetterForm] = useState(false)
  const [genStudentSearch, setGenStudentSearch] = useState("")

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  const previewContent = previewDoc ? (
    <div ref={previewRef}>
      {previewDoc.type === "fee_receipt" ? (() => {
        const pay = getPaymentForReceipt(previewDoc.reference)
        const student = students.find((s) => s.id === previewDoc.studentId)
        return (
          <ReceiptTemplate
            data={{
              studentName: student ? `${student.firstName} ${student.lastName}` : "N/A",
              studentId: student?.studentId || "N/A",
              studentClass: student ? getClassName(student.classId) : "N/A",
              amount: pay?.amount || 0,
              paid: pay?.paid || pay?.amount || 0,
              balance: pay ? (pay.amount - (pay.paid || pay.amount)) : 0,
              term: pay?.term || "N/A",
              session: pay?.session || "N/A",
              method: pay?.method || "N/A",
              createdAt: previewDoc.generatedAt,
              reference: previewDoc.reference,
              schoolName: school?.schoolName || "Access School",
              schoolMotto: school?.schoolMotto || "Excellence in Education",
              schoolAddress: school?.schoolAddress || "",
              schoolPhone: school?.schoolPhone || "",
              schoolEmail: school?.schoolEmail || "",
              schoolLogo: school?.schoolLogo || "",
            }}
          />
        )
      })() : previewDoc.type === "acceptance" ? (() => {
        const student = students.find((s) => s.id === previewDoc.studentId)
        return (
          <AcceptanceLetterTemplate
            data={{
              studentName: student ? `${student.firstName} ${student.lastName}` : "N/A",
              studentId: student?.studentId || "N/A",
              studentClass: student ? getClassName(student.classId) : "N/A",
              reference: previewDoc.reference,
              createdAt: previewDoc.generatedAt,
              schoolName: school?.schoolName || "Access School",
              schoolMotto: school?.schoolMotto || "Excellence in Education",
              schoolAddress: school?.schoolAddress || "",
              schoolPhone: school?.schoolPhone || "",
              schoolEmail: school?.schoolEmail || "",
              schoolLogo: school?.schoolLogo || "",
            }}
          />
        )
      })() : (() => {
        const student = students.find((s) => s.id === previewDoc.studentId)
        return (
          <TransferLetterTemplate
            data={{
              studentName: student ? `${student.firstName} ${student.lastName}` : "N/A",
              studentId: student?.studentId || "N/A",
              studentClass: student ? getClassName(student.classId) : "N/A",
              reference: previewDoc.reference,
              createdAt: previewDoc.generatedAt,
              schoolName: school?.schoolName || "Access School",
              schoolMotto: school?.schoolMotto || "Excellence in Education",
              schoolAddress: school?.schoolAddress || "",
              schoolPhone: school?.schoolPhone || "",
              schoolEmail: school?.schoolEmail || "",
              schoolLogo: school?.schoolLogo || "",
            }}
          />
        )
      })()}
    </div>
  ) : null

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Documents</h2>
        <p className="text-sm text-muted-foreground">Generate fee receipts, acceptance letters, and official documents</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-max gap-1.5">
            <TabsTrigger value="all" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><FileText className="h-4 w-4 mr-1" /> All Documents</TabsTrigger>
            <TabsTrigger value="receipts" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Receipt className="h-4 w-4 mr-1" /> Fee Receipts</TabsTrigger>
            <TabsTrigger value="letters" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><ScrollText className="h-4 w-4 mr-1" /> Letters</TabsTrigger>
            <TabsTrigger value="generate" className="whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm"><Plus className="h-4 w-4 mr-1" /> Generate</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
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
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {doc.type === "fee_receipt" ? <Receipt className="h-4 w-4 text-primary" /> : <ScrollText className="h-4 w-4 text-primary" />}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">{feeReceipts.length} fee receipt(s) generated</p>
            {feeReceipts.length === 0 ? (
              <EmptyState title="No receipts" description="Generate receipts from confirmed payments" />
            ) : (
              <div className="space-y-2">
                {feeReceipts.slice().reverse().map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground">{getStudentName(doc.studentId)}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)}><Eye className="h-4 w-4 mr-1" /> View</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="letters" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">{letters.length} letter(s) generated</p>
            {letters.length === 0 ? (
              <EmptyState title="No letters" description="Generate acceptance or transfer letters" />
            ) : (
              <div className="space-y-2">
                {letters.slice().reverse().map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground">{getStudentName(doc.studentId)}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)}><Eye className="h-4 w-4 mr-1" /> View</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="generate" className="mt-4 space-y-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
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
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Generate Letters</h3>
            </div>
            {!showLetterForm ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => { setLetterType("acceptance"); setShowLetterForm(true) }}>
                  <FileCheck className="h-4 w-4 mr-1" /> Acceptance Letter
                </Button>
                <Button variant="outline" onClick={() => { setLetterType("transfer"); setShowLetterForm(true) }}>
                  <User className="h-4 w-4 mr-1" /> Transfer Letter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary capitalize">{letterType} Letter</p>
                  <Button variant="ghost" size="sm" onClick={() => setShowLetterForm(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Type to search students..."
                      className="pl-9 h-10"
                      value={genStudentSearch}
                      onChange={(e) => { setGenStudentSearch(e.target.value); setLetterStudentId("") }}
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
                          onClick={() => { setLetterStudentId(s.id); setGenStudentSearch(`${s.firstName} ${s.lastName}`) }}
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
                <Button onClick={generateLetterWithSelector} disabled={!letterStudentId} className="w-full">
                  <FileText className="h-4 w-4 mr-1" /> Generate {letterType === "acceptance" ? "Acceptance" : "Transfer"} Letter
                </Button>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-4 pb-4 overflow-auto" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{previewDoc.title}</h3>
                <p className="text-xs text-gray-500">{previewDoc.reference} &bull; {new Date(previewDoc.generatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => exportAsPng(previewDoc)} disabled={exporting === previewDoc.id}>
                  {exporting === previewDoc.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1" />}
                  PNG
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => exportAsPdf(previewDoc)} disabled={exporting === previewDoc.id}>
                  {exporting === previewDoc.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                  PDF
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={printDocument}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 ml-2" onClick={() => setPreviewDoc(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-[80vh] bg-white">
              {previewContent}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
