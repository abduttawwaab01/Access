"use client"

import { useRef } from "react"
import type { HandwritingConfig } from "@/types"
import { handwritingTemplateComponents } from "./templates"

interface Props {
  config: HandwritingConfig
}

export function HandwritingPreview({ config }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const TemplateComponent = handwritingTemplateComponents[config.templateId]

  if (!TemplateComponent) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-dashed p-12 text-sm text-gray-400">
        Template not found
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="handwriting-preview-wrapper flex items-start justify-center overflow-auto rounded-2xl bg-gray-100 p-4 dark:bg-gray-900"
      style={{ minHeight: 600 }}
    >
      <div className="transition-all" style={{ transform: "scale(var(--preview-scale, 0.85))", transformOrigin: "top center" }}>
        <TemplateComponent config={config} />
      </div>
    </div>
  )
}
