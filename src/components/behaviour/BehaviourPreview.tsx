"use client"

import { useRef } from "react"
import type { BehaviourConfig } from "@/types"
import { behaviourTemplateComponents } from "./templates"

interface Props {
  config: BehaviourConfig
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}

export function BehaviourPreview({ config, onToggle, onCycleColour }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const TemplateComponent = behaviourTemplateComponents[config.templateId]

  if (!TemplateComponent) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-dashed p-12 text-sm text-gray-400">
        Template not found
      </div>
    )
  }

  return (
    <div ref={ref} className="behaviour-preview-wrapper">
      <TemplateComponent config={config} onToggle={onToggle} onCycleColour={onCycleColour} />
    </div>
  )
}
