"use client"

import { useState, useEffect } from "react"
import type { HandwritingConfig } from "@/types"
import { DEFAULT_HANDWRITING_CONFIG } from "@/types"
import { HandwritingConfigurator } from "./HandwritingConfigurator"
import { HandwritingPreview } from "./HandwritingPreview"
import { downloadPng, downloadPdf, openPrintWindow } from "@/lib/capture"

const STORAGE_KEY = "handwriting-sheets-config"

function loadSaved(): HandwritingConfig {
  if (typeof window === "undefined") return { ...DEFAULT_HANDWRITING_CONFIG }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { ...DEFAULT_HANDWRITING_CONFIG }
}

export function HandwritingGenerator() {
  const [config, setConfig] = useState<HandwritingConfig>(loadSaved)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const handleExportPng = () => {
    const el = document.querySelector("#handwriting-preview") as HTMLElement
    if (el) downloadPng(el, `handwriting-sheet-${config.sheetTitle.replace(/\s+/g, "-").toLowerCase()}`)
  }

  const handleExportPdf = () => {
    const el = document.querySelector("#handwriting-preview") as HTMLElement
    if (el) downloadPdf(el, `handwriting-sheet-${config.sheetTitle.replace(/\s+/g, "-").toLowerCase()}`)
  }

  const handlePrint = () => {
    const el = document.querySelector("#handwriting-preview") as HTMLElement
    if (el) openPrintWindow(el)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Handwriting Sheets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create printable handwriting practice sheets with customisable layouts and tracing guides
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
            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <HandwritingConfigurator config={config} onChange={setConfig} />
        <div className="min-w-0">
          <HandwritingPreview config={config} />
        </div>
      </div>
    </div>
  )
}
