"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { FileText, Download, Printer, Plus, FileCheck, ScrollText, Receipt, User } from "lucide-react"
import { EmptyState } from "@/components/admin/EmptyState"

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [documents, setDocuments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ]).then(([d, s, p]) => { setDocuments(d); setStudents(s); setPayments(p.filter((pay: any) => pay.status === "confirmed")); setLoading(false) })
  }, [])

  const getStudentName = (id: string) => { const s = students.find((s) => s.id === id); return s ? `${s.firstName} ${s.lastName}` : id }
  const feeReceipts = documents.filter((d) => d.type === "fee_receipt")
  const letters = documents.filter((d) => d.type !== "fee_receipt")

  const generateReceipt = async (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId)
    if (!payment) return
    const existing = documents.find((d) => d.reference === `RCP-${payment.reference}`)
    if (existing) { toast.info("Receipt already exists"); return }
    const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: payment.studentId, type: "fee_receipt", title: `Fee Receipt - ${payment.reference}`, reference: `RCP-${payment.reference}` }) })
    if (res.ok) {
      const doc = await res.json()
      setDocuments([...documents, doc])
      toast.success("Receipt generated")
    }
  }

  const generateLetter = async (type: string, studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    const title = type === "acceptance" ? "Acceptance Letter" : "Transfer Letter"
    const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, type, title: `${title} - ${student?.firstName || ""} ${student?.lastName || ""}`, reference: `${type === "acceptance" ? "ACC" : "TRF"}-${Date.now()}` }) })
    if (res.ok) {
      const doc = await res.json()
      setDocuments([...documents, doc])
      toast.success(`${title} generated`)
    }
  }

  const confirmedPayments = payments.filter((p) => !documents.find((d) => d.reference === `RCP-${p.reference}`))

  if (loading) return <div className="p-4 md:p-6 space-y-4">{["h-24", "h-48"].map((h, i) => <div key={i} className={`${h} rounded-xl bg-muted animate-pulse`} />)}</div>

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Documents</h2>
        <p className="text-sm text-muted-foreground">Generate fee receipts, acceptance letters, and official documents</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all"><FileText className="h-4 w-4 mr-1" /> All Documents</TabsTrigger>
          <TabsTrigger value="receipts"><Receipt className="h-4 w-4 mr-1" /> Fee Receipts</TabsTrigger>
          <TabsTrigger value="letters"><ScrollText className="h-4 w-4 mr-1" /> Letters</TabsTrigger>
          <TabsTrigger value="generate"><Plus className="h-4 w-4 mr-1" /> Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            {documents.length === 0 ? <EmptyState title="No documents" description="Generate receipts and letters" /> : (
              <div className="space-y-2">
                {documents.slice().reverse().map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div>
                      <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground">{doc.reference} • {new Date(doc.generatedAt).toLocaleDateString()}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/15 text-green-600">{doc.status}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const w = window.open("", "_blank"); if (w) { w.document.write(`<html><head><title>${doc.title}</title><style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:auto}h1{text-align:center;color:#333}.header{text-align:center;margin-bottom:40px}.content{margin-top:30px;line-height:1.6}.footer{margin-top:60px;text-align:center;color:#666;font-size:12px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style></head><body><div class="header"><h1>ACCESS SCHOOL</h1><p>${doc.title}</p><p>Ref: ${doc.reference}</p></div><div class="content"><p>Date: ${new Date(doc.generatedAt).toLocaleDateString()}</p><p>Student: ${getStudentName(doc.studentId)}</p><p>This is to certify that the above-named student has been issued this document.</p></div><div class="footer"><p>This is a computer-generated document.</p></div></body></html>`); w.document.close(); w.print(); } }}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            {feeReceipts.length === 0 ? <EmptyState title="No receipts" description="Generate receipts from confirmed payments" /> : (
              <div className="space-y-2">
                {feeReceipts.slice().reverse().map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground">{doc.reference} • {getStudentName(doc.studentId)}</p></div>
                    <Button variant="ghost" size="sm"><Printer className="h-4 w-4 mr-1" /> Print</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="letters" className="mt-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            {letters.length === 0 ? <EmptyState title="No letters" description="Generate acceptance or transfer letters" /> : (
              <div className="space-y-2">
                {letters.slice().reverse().map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{doc.title}</p><p className="text-xs text-muted-foreground">{doc.reference}</p></div>
                    <Button variant="ghost" size="sm"><Printer className="h-4 w-4 mr-1" /> Print</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="generate" className="mt-4 space-y-4">
          <Card className="border-0 glass-card"><CardContent className="p-4">
            <h3 className="font-semibold mb-3">Generate Fee Receipts</h3>
            {confirmedPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No confirmed payments without receipts</p>
            ) : (
              <div className="space-y-2">
                {confirmedPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{getStudentName(p.studentId)}</p><p className="text-xs text-muted-foreground">{p.reference} • ₦{p.amount}</p></div>
                    <Button size="sm" variant="outline" onClick={() => generateReceipt(p.id)}><Receipt className="h-4 w-4 mr-1" /> Generate Receipt</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>

          <Card className="border-0 glass-card"><CardContent className="p-4">
            <h3 className="font-semibold mb-3">Generate Letters</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { const id = prompt("Enter Student ID (e.g., 1)"); if (id) generateLetter("acceptance", id) }}><FileCheck className="h-4 w-4 mr-1" /> Acceptance Letter</Button>
              <Button variant="outline" onClick={() => { const id = prompt("Enter Student ID (e.g., 1)"); if (id) generateLetter("transfer", id) }}><User className="h-4 w-4 mr-1" /> Transfer Letter</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
