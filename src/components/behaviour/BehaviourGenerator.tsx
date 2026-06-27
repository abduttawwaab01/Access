"use client"

import { useState, useCallback, useEffect } from "react"
import type { BehaviourConfig, StudentBehaviourEntry } from "@/types"
import { DEFAULT_BEHAVIOUR_CONFIG } from "@/types"
import { BehaviourConfigurator } from "./BehaviourConfigurator"
import { BehaviourPreview } from "./BehaviourPreview"
import { downloadPng, downloadPdf, openPrintWindow } from "@/lib/capture"

const STORAGE_KEY = "behaviour-chart-config"

function loadSaved(): BehaviourConfig {
  if (typeof window === "undefined") return { ...DEFAULT_BEHAVIOUR_CONFIG }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { ...DEFAULT_BEHAVIOUR_CONFIG }
}

export function BehaviourGenerator() {
  const [config, setConfig] = useState<BehaviourConfig>(loadSaved)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const handleToggle = useCallback((studentId: string, categoryId: string) => {
    setConfig((prev) => {
      const newStudents = prev.students.map((s) => {
        if (s.id !== studentId) return s
        const current = s.scores[categoryId] || 0
        const maxScore = prev.categories.find((c) => c.id === categoryId)?.maxScore || 3
        const next = current >= maxScore ? 0 : current + 1
        return { ...s, scores: { ...s.scores, [categoryId]: next } }
      })
      return { ...prev, students: newStudents }
    })
  }, [])

  const handleCycleColour = useCallback((studentId: string) => {
    setConfig((prev) => {
      const COLOUR_CYCLE = [0, 1, 2, 3]
      const newStudents = prev.students.map((s) => {
        if (s.id !== studentId) return s
        const current = s.scores["colour"] ?? 3
        const next = (current + 1) % COLOUR_CYCLE.length
        return { ...s, scores: { ...s.scores, colour: next } }
      })
      return { ...prev, students: newStudents }
    })
  }, [])

  const handleExportPng = () => {
    const el = document.querySelector("#behaviour-preview") as HTMLElement
    if (el) downloadPng(el, `behaviour-chart-${config.periodLabel.replace(/\s+/g, "-")}`)
  }

  const handleExportPdf = () => {
    const el = document.querySelector("#behaviour-preview") as HTMLElement
    if (el) downloadPdf(el, `behaviour-chart-${config.periodLabel.replace(/\s+/g, "-")}`)
  }

  const handlePrint = () => {
    const el = document.querySelector("#behaviour-preview") as HTMLElement
    if (el) openPrintWindow(el)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Behaviour &amp; Star Achievement Chart</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track student behaviour with interactive star ratings, colour codes, and reward milestones
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPng}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-600"
          >
            Download PNG
          </button>
          <button
            onClick={handleExportPdf}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-600"
          >
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg bg-amber-400 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
          >
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <BehaviourConfigurator config={config} onChange={setConfig} />
        <div className="min-w-0">
          <BehaviourPreview config={config} onToggle={handleToggle} onCycleColour={handleCycleColour} />
        </div>
      </div>
    </div>
  )
}
