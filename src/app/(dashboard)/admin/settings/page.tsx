"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save, Palette, Building2, ImageIcon, FileText, Quote, Info, Loader2, CreditCard, QrCode, Download, Key, Eye, EyeOff, GraduationCap, Plus, Trash2 } from "lucide-react"
import { captureElement } from "@/lib/capture"
import { QRCodeSVG } from "qrcode.react"
import { compressAndUpload } from "@/lib/imageUtils"

export default function SchoolSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    email: "",
    phone: "",
    address: "",
    motto: "",
    logo: "",
    aboutText: "",
    exportDefaultExamHeader: "",
    primaryColor: "#6366f1",
    secondaryColor: "#06b6d4",
    accentColor: "#f59e0b",
    studentIdCardConfig: { backTitle: "Student Information", showAddress: true, showBloodGroup: true, showEmergencyContact: true, showMedicalNotes: true, showRules: true, rulesText: "1. This card is the property of the school and must be returned upon request.\n2. Report lost or damaged cards immediately.\n3. This card is non-transferable.\n4. Students must present this card for identification.\n5. Unauthorized modification is prohibited.", customAddress: "", customBloodGroup: "", customEmergencyContact: "", customMedicalNotes: "", customFields: [] as Array<{label:string;value:string}> },
    staffIdCardConfig: { backTitle: "Staff Information", showDepartment: true, showEmergencyContact: true, showRules: true, rulesText: "1. This card is the property of the school.\n2. Report lost or damaged cards immediately.\n3. This card is non-transferable.\n4. Staff must present this card for identification.\n5. Unauthorized modification is prohibited.", customDepartment: "", customEmergencyContact: "", customFields: [] as Array<{label:string;value:string}> },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/school")
      .then((r) => r.json())
      .then((data) => {
        setForm(data)
        if (data.logo) setLogoPreview(data.logo)
        setLoading(false)
      })
  }, [])

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
      const url = await compressAndUpload(file, { maxWidth: 400, quality: 0.6, format: "webp", folder: "logos" })
      update("logo", url)
      toast.success("Logo uploaded and compressed")
    } catch {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setLogoPreview(dataUrl)
        update("logo", dataUrl)
        toast.warning("Upload failed, stored as base64")
      }
      reader.readAsDataURL(file)
    }
    setLogoUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleLogoUrl = (value: string) => {
    update("logo", value)
    if (value) setLogoPreview(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { studentIdCardConfig, staffIdCardConfig, ...rest } = form
      await fetch("/api/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, studentIdCardConfig, staffIdCardConfig }),
      })
      document.documentElement.style.setProperty("--primary", form.primaryColor)
      document.documentElement.style.setProperty("--secondary", form.secondaryColor)
      document.documentElement.style.setProperty("--accent", form.accentColor)
      toast.success("School settings updated")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4 space-y-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">School Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your school&apos;s branding and information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-12" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input id="shortName" value={form.shortName} onChange={(e) => update("shortName", e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motto" className="flex items-center gap-1">
                  <Quote className="h-3.5 w-3.5 text-muted-foreground" />
                  School Motto
                </Label>
                <Input id="motto" value={form.motto} onChange={(e) => update("motto", e.target.value)} placeholder="e.g. Excellence in Education" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutText" className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  About School
                </Label>
                <Textarea id="aboutText" value={form.aboutText} onChange={(e) => update("aboutText", e.target.value)} rows={4} placeholder="Brief description of your school..." />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-primary" />
                School Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-20 w-20 shrink-0 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                  {logoPreview ? (
                    <img src={logoPreview} alt="School Logo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="space-y-2 w-full sm:flex-1">
                  <Label htmlFor="logoUpload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted min-h-[44px]">
                      {logoUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing...</> : <><ImageIcon className="h-4 w-4" /> Upload Image</>}
                    </span>
                    <input
                      ref={fileInputRef}
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={logoUploading}
                      onChange={handleLogoFile}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground">Upload a PNG or JPG (compressed and stored on Vercel Blob)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Or use a logo URL</Label>
                <Input id="logoUrl" value={form.logo?.startsWith("data:") ? "" : form.logo} onChange={(e) => handleLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="h-12" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" />
                Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace("Color", " Color")}</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent"
                      />
                      <span className="text-xs font-mono text-muted-foreground">{form[key]}</span>
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.studentIdCardConfig?.showRules ?? true}
                    onChange={(e) => setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, showRules: e.target.checked } })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Rules &amp; Regulations</span>
                </label>
                {form.studentIdCardConfig?.showRules && (
                  <Textarea value={form.studentIdCardConfig?.rulesText || ""}
                    onChange={(e) => setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, rulesText: e.target.value } })}
                    rows={4} className="text-xs" placeholder="Enter rules and regulations for this card..." />
                )}
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                <span className="text-sm font-medium block mb-1">Custom Back Fields</span>
                <p className="text-[10px] text-muted-foreground mb-2">Additional fields shown on the back of the card.</p>
                {((form.studentIdCardConfig?.customFields) || []).map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <Input value={f.label} onChange={(e) => {
                      const cf: Array<{label:string;value:string}> = [...(form.studentIdCardConfig?.customFields || [])]
                      cf[i] = { ...cf[i], label: e.target.value }
                      setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, customFields: cf } })
                    }} placeholder="Label" className="h-8 text-xs flex-1" />
                    <Input value={f.value} onChange={(e) => {
                      const cf: Array<{label:string;value:string}> = [...(form.studentIdCardConfig?.customFields || [])]
                      cf[i] = { ...cf[i], value: e.target.value }
                      setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, customFields: cf } })
                    }} placeholder="Value" className="h-8 text-xs flex-1" />
                    <button type="button" onClick={() => {
                      const cf: Array<{label:string;value:string}> = (form.studentIdCardConfig?.customFields || []).filter((_: any, j: number) => j !== i)
                      setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, customFields: cf } })
                    }} className="text-danger hover:text-danger/80 p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  const cf: Array<{label:string;value:string}> = [...(form.studentIdCardConfig?.customFields || []), { label: "", value: "" }]
                  setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, customFields: cf } })
                }} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                  <Plus className="h-3 w-3" /> Add custom field
                </button>
              </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2 rounded-xl border border-border/50 p-3">
                <div className="flex-1 h-8 rounded-lg" style={{ background: form.primaryColor }} />
                <div className="flex-1 h-8 rounded-lg" style={{ background: form.secondaryColor }} />
                <div className="flex-1 h-8 rounded-lg" style={{ background: form.accentColor }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Export Defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exportDefaultExamHeader">Default Exam Header Template</Label>
                <Textarea
                  id="exportDefaultExamHeader"
                  value={form.exportDefaultExamHeader}
                  onChange={(e) => update("exportDefaultExamHeader", e.target.value)}
                  rows={3}
                  placeholder="e.g. Answer all questions. Time allowed: {duration} minutes. Total: {questions} questions."
                />
                <p className="text-xs text-muted-foreground">
                  Available placeholders: <code className="text-xs bg-muted px-1 rounded">{`{examTitle}, {duration}, {questions}, {schoolName}`}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                ID Card Back Settings (Student)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Configure what appears on the back of student ID cards. Type custom text to override student data.</p>
              <div className="space-y-2">
                <Label>Back Panel Title</Label>
                <Input value={form.studentIdCardConfig?.backTitle || "Student Information"} onChange={(e) => setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, backTitle: e.target.value } })} />
              </div>
              <div className="space-y-4">
                {[
                  { key: "showAddress", label: "Address", customKey: "customAddress" },
                  { key: "showBloodGroup", label: "Blood Group", customKey: "customBloodGroup" },
                  { key: "showEmergencyContact", label: "Emergency Contact", customKey: "customEmergencyContact" },
                  { key: "showMedicalNotes", label: "Medical Notes", customKey: "customMedicalNotes" },
                ].map(({ key, label, customKey }) => (
                  <div key={key} className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.studentIdCardConfig as any)?.[key] ?? true}
                        onChange={(e) => setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, [key]: e.target.checked } })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                    <Input placeholder={`Custom ${label.toLowerCase()} (overrides student data)`}
                      value={(form.studentIdCardConfig as any)?.[customKey] || ""}
                      onChange={(e) => setForm({ ...form, studentIdCardConfig: { ...form.studentIdCardConfig, [customKey]: e.target.value } })}
                      className="h-9 text-xs" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                ID Card Back Settings (Staff)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Configure what appears on the back of staff ID cards. Type custom text to override staff data.</p>
              <div className="space-y-2">
                <Label>Back Panel Title</Label>
                <Input value={form.staffIdCardConfig?.backTitle || "Staff Information"} onChange={(e) => setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, backTitle: e.target.value } })} />
              </div>
              <div className="space-y-4">
                {[
                  { key: "showEmergencyContact", label: "Emergency Contact", customKey: "customEmergencyContact" },
                ].map(({ key, label, customKey }) => (
                  <div key={key} className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.staffIdCardConfig as any)?.[key] ?? true}
                        onChange={(e) => setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, [key]: e.target.checked } })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                    <Input placeholder={`Custom ${label.toLowerCase()} (overrides staff data)`}
                      value={(form.staffIdCardConfig as any)?.[customKey] || ""}
                      onChange={(e) => setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, [customKey]: e.target.value } })}
                      className="h-9 text-xs" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.staffIdCardConfig?.showRules ?? true}
                    onChange={(e) => setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, showRules: e.target.checked } })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Rules &amp; Regulations</span>
                </label>
                {form.staffIdCardConfig?.showRules && (
                  <Textarea value={form.staffIdCardConfig?.rulesText || ""}
                    onChange={(e) => setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, rulesText: e.target.value } })}
                    rows={4} className="text-xs" placeholder="Enter rules and regulations for this card..." />
                )}
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                <span className="text-sm font-medium block mb-1">Custom Back Fields</span>
                <p className="text-[10px] text-muted-foreground mb-2">Additional fields shown on the back of the card.</p>
                {((form.staffIdCardConfig?.customFields) || []).map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <Input value={f.label} onChange={(e) => {
                      const cf: Array<{label:string;value:string}> = [...(form.staffIdCardConfig?.customFields || [])]
                      cf[i] = { ...cf[i], label: e.target.value }
                      setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, customFields: cf } })
                    }} placeholder="Label" className="h-8 text-xs flex-1" />
                    <Input value={f.value} onChange={(e) => {
                      const cf: Array<{label:string;value:string}> = [...(form.staffIdCardConfig?.customFields || [])]
                      cf[i] = { ...cf[i], value: e.target.value }
                      setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, customFields: cf } })
                    }} placeholder="Value" className="h-8 text-xs flex-1" />
                    <button type="button" onClick={() => {
                      const cf: Array<{label:string;value:string}> = (form.staffIdCardConfig?.customFields || []).filter((_: any, j: number) => j !== i)
                      setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, customFields: cf } })
                    }} className="text-danger hover:text-danger/80 p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  const cf: Array<{label:string;value:string}> = [...(form.staffIdCardConfig?.customFields || []), { label: "", value: "" }]
                  setForm({ ...form, staffIdCardConfig: { ...form.staffIdCardConfig, customFields: cf } })
                }} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                  <Plus className="h-3 w-3" /> Add custom field
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>

      <UserPasswordManager />
      <SchoolQRCodeSettings />
      <GradingConfigSettings />
    </div>
  )
}

function GradingConfigSettings() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/grading-config").then((r) => r.json()).then((data) => {
      setConfig(data)
      setLoading(false)
    })
  }, [])

  const updateConfig = (field: string, value: any) => setConfig((prev: any) => ({ ...prev, [field]: value }))

  const addBoundary = () => {
    const boundaries = config?.gradeBoundaries || []
    const lastMin = boundaries.length > 0 ? boundaries[boundaries.length - 1].min - 10 : 0
    updateConfig("gradeBoundaries", [...boundaries, { min: Math.max(0, lastMin), grade: "", remark: "" }])
  }

  const removeBoundary = (idx: number) => {
    const boundaries = config?.gradeBoundaries || []
    updateConfig("gradeBoundaries", boundaries.filter((_: any, i: number) => i !== idx))
  }

  const updateBoundary = (idx: number, field: string, value: any) => {
    const boundaries = config?.gradeBoundaries || []
    boundaries[idx] = { ...boundaries[idx], [field]: value }
    updateConfig("gradeBoundaries", [...boundaries])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/grading-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      toast.success("Grading configuration saved")
    } catch {
      toast.error("Failed to save")
    }
    setSaving(false)
  }

  if (loading) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4 text-primary" />
            Grading Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Configure CA/Exam score limits and grade boundaries used for report cards.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>CA Maximum Score</Label>
              <Input type="number" min={0} max={100} value={config?.caMax ?? 40}
                onChange={(e) => updateConfig("caMax", Number(e.target.value))} className="h-12" />
            </div>
            <div className="space-y-1.5">
              <Label>Exam Maximum Score</Label>
              <Input type="number" min={0} max={100} value={config?.examMax ?? 60}
                onChange={(e) => updateConfig("examMax", Number(e.target.value))} className="h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Grade Boundaries</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBoundary}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-1.5">
              {(config?.gradeBoundaries || []).map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input type="number" min={0} max={100} value={b.min}
                      onChange={(e) => updateBoundary(i, "min", Number(e.target.value))}
                      placeholder="Min %" className="h-10 text-xs" />
                  </div>
                  <div className="w-20">
                    <Input value={b.grade} onChange={(e) => updateBoundary(i, "grade", e.target.value)}
                      placeholder="Grade" className="h-10 text-xs text-center font-bold" maxLength={2} />
                  </div>
                  <div className="flex-[2]">
                    <Input value={b.remark} onChange={(e) => updateBoundary(i, "remark", e.target.value)}
                      placeholder="Remark" className="h-10 text-xs" />
                  </div>
                  {i > 0 && (
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-danger" onClick={() => removeBoundary(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Boundaries are checked top-down (highest min first). The last boundary must have min=0.</p>
          </div>
          <Button type="button" onClick={handleSave} disabled={saving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25 w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save Grading Config
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SchoolQRCodeSettings() {
  const [school, setSchool] = useState<any>(null)
  const [qrValue, setQrValue] = useState("")
  const [saving, setSaving] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/school").then((r) => r.json()).then((data) => {
      setSchool(data)
      setQrValue(data.schoolQRCode || JSON.stringify({ type: "school_attendance", school: data.name || "Access School", id: "school_1" }))
    })
  }, [])

  const handleDownload = async () => {
    if (!qrRef.current) return
    try {
      const canvas = await captureElement(qrRef.current, { scale: 3, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `${(school?.name || "School").replace(/\s+/g, "_")}_Attendance_QR.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("QR code downloaded")
    } catch (err) {
      console.error("QR download error:", err)
      toast.error("Failed to download")
    }
  }

  const handleSaveQR = async () => {
    setSaving(true)
    try {
      await fetch("/api/school", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schoolQRCode: qrValue }) })
      toast.success("School QR data saved")
    } catch { toast.error("Failed to save") }
    setSaving(false)
  }

  if (!school) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-4 w-4 text-primary" />
            School Attendance QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Generate a QR code for staff attendance. Display at school entrance for staff to scan.
          </p>
          <div className="flex justify-center">
            <div ref={qrRef} className="inline-block bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                {school?.logo ? <img src={school.logo} alt="" className="h-8 w-8 rounded-full object-cover" /> : <Building2 className="h-6 w-6 text-gray-400" />}
                <span className="text-sm font-bold text-gray-800">{school?.name || "School"}</span>
              </div>
              <QRCodeSVG value={qrValue} size={180} level="H" includeMargin />
              <p className="text-[10px] text-gray-400 mt-2">Scan to mark attendance</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>QR Code Data (JSON)</Label>
            <textarea
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-1" /> Download PNG
            </Button>
            <Button onClick={handleSaveQR} disabled={saving} className="animated-gradient border-0 text-white shadow-lg shadow-primary/25 flex-1">
              {saving ? "Saving..." : "Save QR Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function UserPasswordManager() {
  const [userType, setUserType] = useState<"students" | "staff" | "parents">("students")
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userSearch, setUserSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    setSelectedUserId("")
    fetch(`/api/${userType}`).then(r => r.json()).then(data => { setUsers(data); setLoading(false) }).catch(() => setLoading(false))
  }, [userType])

  const filteredUsers = users.filter((u) => {
    const name = `${u.firstName || ""} ${u.lastName || ""} ${u.email || ""} ${u.studentId || u.staffId || ""}`.toLowerCase()
    return name.includes(userSearch.toLowerCase())
  })

  const handleReset = async () => {
    if (!selectedUserId || !newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/${userType}/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })
      if (res.ok) { toast.success("Password updated successfully"); setNewPassword(""); setSelectedUserId("") }
      else toast.error("Failed to update password")
    } catch { toast.error("Failed to update password") }
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4 text-primary" />
            User Password Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Reset passwords for any student, teacher, or parent account.</p>
          <div className="space-y-2">
            <Label>User Type</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              {(["students", "staff", "parents"] as const).map((t) => (
                <button key={t} type="button"
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${userType === t ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  onClick={() => setUserType(t)}
                >{t === "staff" ? "Teachers/Staff" : t === "parents" ? "Parents" : "Students"}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Search {userType === "staff" ? "teacher" : userType}</Label>
            <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Type name, email or ID..." className="h-10" />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border/50 p-1">
            {loading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No users found</div>
            ) : (
              filteredUsers.slice(0, 50).map((u) => (
                <button key={u.id} type="button"
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${selectedUserId === u.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <span className="font-medium">{u.firstName} {u.lastName}</span>
                  <span className="text-xs text-muted-foreground ml-2">{u.email || u.studentId || u.staffId || u.id}</span>
                </button>
              ))
            )}
          </div>
          {selectedUserId && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary">
                Resetting for: {users.find((u) => u.id === selectedUserId)?.firstName} {users.find((u) => u.id === selectedUserId)?.lastName}
              </p>
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password (min 6 chars)" className="h-10 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button size="sm" className="animated-gradient border-0 text-white shadow-lg shadow-primary/25 w-full" onClick={handleReset} disabled={saving || newPassword.length < 6}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Key className="h-4 w-4 mr-1" />}
                Reset Password
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function Skeleton() {
  return <div className="h-24 rounded-xl bg-muted animate-pulse" />
}
