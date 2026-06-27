"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { toast } from "sonner"
import { Download, FileDown, Printer, Eye, EyeOff, RefreshCw } from "lucide-react"
import { downloadPng, downloadPdf, openPrintWindow } from "@/lib/capture"
import { CertificateConfigurator } from "./CertificateConfigurator"
import { CertificatePreview } from "./CertificatePreview"
import { certificateTemplates } from "./templates"
import { DEFAULT_CERTIFICATE_CONFIG } from "@/types"
import type { CertificateConfig } from "@/types"

const STORAGE_KEY = "certificate-generator-config"

export function CertificateGenerator() {
  const [config, setConfig] = useState<CertificateConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CERTIFICATE_CONFIG
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_CERTIFICATE_CONFIG, ...JSON.parse(saved) } : DEFAULT_CERTIFICATE_CONFIG
    } catch {
      return DEFAULT_CERTIFICATE_CONFIG
    }
  })
  const [showPreview, setShowPreview] = useState(true)
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {}
  }, [config])

  useEffect(() => {
    const updateScale = () => {
      if (scaleRef.current) {
        const parent = scaleRef.current.parentElement
        if (parent) {
          const availableWidth = parent.clientWidth - 40
          const scale = Math.min(1, availableWidth / 800)
          scaleRef.current.style.setProperty("--scale", scale.toString())
        }
      }
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [showPreview])

  const handleSelectTemplate = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, templateId: id }))
  }, [])

  const handleExportPng = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const name = (config.recipientName || "certificate").replace(/\s+/g, "_")
      await downloadPng(previewRef.current, `${name}_Certificate.png`, {
        scale: 4,
        backgroundColor: config.backgroundColor || "#ffffff",
        inlineStyles: true,
      })
      toast.success("Certificate downloaded as PNG")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export PNG")
    }
    setExporting(false)
  }

  const handleExportPdf = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const name = (config.recipientName || "certificate").replace(/\s+/g, "_")
      await downloadPdf(previewRef.current, `${name}_Certificate.pdf`, {
        scale: 4,
        backgroundColor: config.backgroundColor || "#ffffff",
        inlineStyles: true,
      })
      toast.success("Certificate downloaded as PDF")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export PDF")
    }
    setExporting(false)
  }

  const handlePrint = () => {
    if (!previewRef.current) return
    openPrintWindow(previewRef.current, "Certificate")
  }

  const handleReset = () => {
    setConfig({ ...DEFAULT_CERTIFICATE_CONFIG, certificateId: `CERT-${Date.now().toString(36).toUpperCase()}` })
    toast.success("Config reset to defaults")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configurator Panel */}
      <div className="space-y-4">
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="h-4 w-4 text-primary" />
                Certificate Settings
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CertificateConfigurator
              config={config}
              onChange={setConfig}
              templates={certificateTemplates}
              onSelectTemplate={handleSelectTemplate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview & Export Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Certificate Preview</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs"
            >
              {showPreview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showPreview ? "Hide" : "Show"}
            </Button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPng} disabled={exporting}>
              <Download className="h-3.5 w-3.5 mr-1" /> PNG
            </Button>
            <Button size="sm" className="animated-gradient border-0 text-white shadow-lg shadow-primary/25" onClick={handleExportPdf} disabled={exporting}>
              <FileDown className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
          </div>
        </div>

        {showPreview && (
          <Card className="glass-card border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-center bg-muted/30 rounded-xl p-4 overflow-auto min-h-[400px] items-center">
                <div ref={scaleRef}>
                  <CertificatePreview ref={previewRef} config={config} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick info */}
        {config.recipientName && (
          <Card className="glass-card border-0">
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold">
                {config.recipientName}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Award: {config.awardName}</span>
                <span>{config.recipientType === "student" ? "Class: " : "Dept: "}{config.classOrDepartment || "N/A"}</span>
                <span>Template: {certificateTemplates.find((t) => t.id === config.templateId)?.name || "N/A"}</span>
                <span>Date: {config.date || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
