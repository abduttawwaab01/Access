"use client"

import { forwardRef } from "react"
import type { CertificateConfig } from "@/types"
import { templateComponents } from "./templates"

interface Props {
  config: CertificateConfig
}

export const CertificatePreview = forwardRef<HTMLDivElement, Props>(function CertificatePreview({ config }, ref) {
  const Template = templateComponents[config.templateId]

  if (!Template) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Template not found
      </div>
    )
  }

  return (
    <div ref={ref} className="inline-block shadow-2xl rounded-lg overflow-hidden" style={{ maxWidth: "100%" }}>
      <div style={{ transform: "scale(var(--scale))", transformOrigin: "top left" }}>
        <Template config={config} />
      </div>
    </div>
  )
})
