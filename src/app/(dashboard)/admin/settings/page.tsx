"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save, Palette, Building2, ImageIcon, FileText, Quote, Info } from "lucide-react"

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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setLogoPreview(dataUrl)
      update("logo", dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUrl = (value: string) => {
    update("logo", value)
    if (value) setLogoPreview(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch("/api/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input id="shortName" value={form.shortName} onChange={(e) => update("shortName", e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                  {logoPreview ? (
                    <img src={logoPreview} alt="School Logo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="logoUpload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-all hover:bg-muted">
                      Upload Image
                    </span>
                    <input
                      ref={fileInputRef}
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFile}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground">Upload a PNG or JPG (will be converted to base64)</p>
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
              <div className="grid grid-cols-3 gap-4">
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

        <Button type="submit" size="lg" className="animated-gradient w-full border-0 text-white shadow-lg shadow-primary/25" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  )
}

function Skeleton() {
  return <div className="h-24 rounded-xl bg-muted animate-pulse" />
}
