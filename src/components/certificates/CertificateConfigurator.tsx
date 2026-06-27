"use client"

import type { CertificateConfig, CertificateTemplate } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button-enhanced"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Palette, Type, Image, Award, FileSignature, Check } from "lucide-react"

interface Props {
  config: CertificateConfig
  onChange: (config: CertificateConfig) => void
  templates: CertificateTemplate[]
  onSelectTemplate: (id: string) => void
}

const RECIPIENT_TYPES = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
]

const AWARD_PRESETS = [
  "Certificate of Achievement",
  "Certificate of Excellence",
  "Best Student Award",
  "Best Teacher Award",
  "Outstanding Performance",
  "Academic Excellence",
  "Most Improved Student",
  "Leadership Award",
  "Sports Achievement",
  "Attendance Award",
  "Staff of the Month",
  "Employee of the Year",
  "Long Service Award",
  "Merit Certificate",
  "Participation Certificate",
]

export function CertificateConfigurator({ config, onChange, templates, onSelectTemplate }: Props) {
  const update = (field: keyof CertificateConfig, value: any) => {
    onChange({ ...config, [field]: value })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      update("schoolLogo", ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      update("signatureImage", ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex flex-wrap w-full gap-1">
          <TabsTrigger value="basic" className="text-xs px-3"><FileSignature className="h-3 w-3 mr-1" /> Details</TabsTrigger>
          <TabsTrigger value="template" className="text-xs px-3"><Award className="h-3 w-3 mr-1" /> Template</TabsTrigger>
          <TabsTrigger value="school" className="text-xs px-3"><Image className="h-3 w-3 mr-1" /> School</TabsTrigger>
          <TabsTrigger value="colors" className="text-xs px-3"><Palette className="h-3 w-3 mr-1" /> Colors</TabsTrigger>
          <TabsTrigger value="signature" className="text-xs px-3"><Type className="h-3 w-3 mr-1" /> Sign &amp; ID</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label className="text-xs">Recipient Type</Label>
            <div className="flex gap-2">
              {RECIPIENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => update("recipientType", t.value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    config.recipientType === t.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Recipient Name</Label>
            <Input
              placeholder="Enter recipient name"
              value={config.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Class / Department</Label>
            <Input
              placeholder={config.recipientType === "student" ? "e.g. Grade 5A" : "e.g. Science Department"}
              value={config.classOrDepartment}
              onChange={(e) => update("classOrDepartment", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Award / Certificate Name</Label>
            <div className="flex gap-2">
              <input
                list="award-presets"
                value={config.awardName}
                onChange={(e) => update("awardName", e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type or select a preset"
              />
              <datalist id="award-presets">
                {AWARD_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Reason / Description</Label>
            <textarea
              value={config.reason}
              onChange={(e) => update("reason", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the reason for this award..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Date of Issue</Label>
            <Input
              type="date"
              value={config.date}
              onChange={(e) => update("date", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-3 mt-3">
          <Label className="text-xs">Choose a Template</Label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTemplate(t.id)}
                className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                  config.templateId === t.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                {config.templateId === t.id && (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <p className="text-sm font-semibold truncate">{t.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[8px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="school" className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <Label className="text-xs">School Name</Label>
            <Input
              placeholder="Enter school name"
              value={config.schoolName}
              onChange={(e) => update("schoolName", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">School Motto</Label>
            <Input
              placeholder="Enter school motto"
              value={config.schoolMotto}
              onChange={(e) => update("schoolMotto", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">School Logo</Label>
            <div className="flex items-center gap-3">
              {config.schoolLogo && (
                <img src={config.schoolLogo} alt="Logo" className="h-12 w-12 rounded-lg object-contain border border-border" />
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-muted transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {config.schoolLogo ? "Change Logo" : "Upload Logo"}
                </div>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {config.schoolLogo && (
                <button
                  onClick={() => update("schoolLogo", "")}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Theme</Label>
            <div className="flex gap-2">
              {(["light", "dark", "custom"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update("theme", t)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all ${
                    config.theme === t
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                />
                <input
                  value={config.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => update("secondaryColor", e.target.value)}
                  className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                />
                <input
                  value={config.secondaryColor}
                  onChange={(e) => update("secondaryColor", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                />
                <input
                  value={config.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => update("backgroundColor", e.target.value)}
                  className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                />
                <input
                  value={config.backgroundColor}
                  onChange={(e) => update("backgroundColor", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => update("textColor", e.target.value)}
                  className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                />
                <input
                  value={config.textColor}
                  onChange={(e) => update("textColor", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Border Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.borderColor}
                  onChange={(e) => update("borderColor", e.target.value)}
                  className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                />
                <input
                  value={config.borderColor}
                  onChange={(e) => update("borderColor", e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showBadge}
                onChange={(e) => update("showBadge", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs font-medium">Show Badge</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showWatermark}
                onChange={(e) => update("showWatermark", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs font-medium">Show Watermark</span>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="signature" className="space-y-3 mt-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Signature Name</Label>
            <Input
              placeholder="Signatory name"
              value={config.signatureName}
              onChange={(e) => update("signatureName", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Signature Image</Label>
            <div className="flex items-center gap-3">
              {config.signatureImage && (
                <img src={config.signatureImage} alt="Signature" className="h-10 rounded border border-border" />
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-muted transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {config.signatureImage ? "Change Signature" : "Upload Signature"}
                </div>
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
              </label>
              {config.signatureImage && (
                <button onClick={() => update("signatureImage", "")} className="text-xs text-destructive hover:underline">
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Issuer Name</Label>
            <Input
              placeholder="e.g. Principal's name"
              value={config.issuerName}
              onChange={(e) => update("issuerName", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Issuer Title</Label>
            <Input
              placeholder="e.g. Principal, Director"
              value={config.issuerTitle}
              onChange={(e) => update("issuerTitle", e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Certificate ID</Label>
            <div className="flex gap-2">
              <Input
                value={config.certificateId}
                onChange={(e) => update("certificateId", e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => update("certificateId", `CERT-${Date.now().toString(36).toUpperCase()}`)}
                className="text-xs shrink-0"
              >
                Regenerate
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
