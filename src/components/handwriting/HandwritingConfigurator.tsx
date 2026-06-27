"use client"

import { useState } from "react"
import type { HandwritingConfig } from "@/types"
import { handwritingTemplates } from "./templates"

interface Props {
  config: HandwritingConfig
  onChange: (config: HandwritingConfig) => void
}

type Tab = "template" | "layout" | "content" | "colors"

export function HandwritingConfigurator({ config, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("template")

  const update = (patch: Partial<HandwritingConfig>) => onChange({ ...config, ...patch })

  const tabs: { key: Tab; label: string }[] = [
    { key: "template", label: "Template" },
    { key: "layout", label: "Layout" },
    { key: "content", label: "Content" },
    { key: "colors", label: "Colors" },
  ]

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1 border-b pb-3 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Template Tab */}
      {tab === "template" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {handwritingTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => update({ templateId: tpl.id })}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                config.templateId === tpl.id
                  ? "border-indigo-400 bg-indigo-50 shadow-md dark:border-indigo-500 dark:bg-indigo-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="text-lg font-bold" style={{ color: config.primaryColor }}>{tpl.name}</div>
              <p className="mt-1 text-[11px] leading-tight text-gray-500 dark:text-gray-400">{tpl.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Layout Tab */}
      {tab === "layout" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Orientation</label>
              <select
                value={config.orientation}
                onChange={(e) => update({ orientation: e.target.value as "portrait" | "landscape" })}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Paper Size</label>
              <select
                value={config.paperSize}
                onChange={(e) => update({ paperSize: e.target.value as "a4" | "letter" })}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Line Spacing</label>
              <select
                value={config.lineSpacing}
                onChange={(e) => update({ lineSpacing: e.target.value as "narrow" | "medium" | "wide" })}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="narrow">Narrow (24px)</option>
                <option value="medium">Medium (36px)</option>
                <option value="wide">Wide (48px)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Line Style</label>
              <select
                value={config.lineStyle}
                onChange={(e) => update({ lineStyle: e.target.value as "solid" | "dashed" | "dotted" })}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">
              Line Count: {config.lineCount}
            </label>
            <input
              type="range"
              min={4}
              max={30}
              value={config.lineCount}
              onChange={(e) => update({ lineCount: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>4</span>
              <span>30</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={config.showMarginLine}
                onChange={(e) => update({ showMarginLine: e.target.checked })}
                className="rounded"
              />
              Show Margin Line
            </label>
            {config.showMarginLine && (
              <div className="flex items-center gap-2">
                <label className="text-xs">Color:</label>
                <input
                  type="color"
                  value={config.marginLineColor}
                  onChange={(e) => update({ marginLineColor: e.target.value })}
                  className="h-7 w-7 cursor-pointer rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Margins (px): {config.margins}</label>
            <input
              type="range"
              min={5}
              max={60}
              value={config.margins}
              onChange={(e) => update({ margins: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Template-specific: picture box for story-sheet */}
          {config.templateId === "story-sheet" && (
            <div className="rounded-lg border bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={config.pictureBox}
                  onChange={(e) => update({ pictureBox: e.target.checked })}
                  className="rounded"
                />
                Show Picture Box
              </label>
              {config.pictureBox && (
                <div className="mt-2">
                  <label className="mb-1 block text-xs">Box Height: {config.pictureBoxHeight}px</label>
                  <input
                    type="range"
                    min={80}
                    max={250}
                    value={config.pictureBoxHeight}
                    onChange={(e) => update({ pictureBoxHeight: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content Tab */}
      {tab === "content" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Sheet Title</label>
            <input
              type="text"
              value={config.sheetTitle}
              onChange={(e) => update({ sheetTitle: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={config.showTitleField}
                onChange={(e) => update({ showTitleField: e.target.checked })}
                className="rounded"
              />
              Show Title
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={config.showNameField}
                onChange={(e) => update({ showNameField: e.target.checked })}
                className="rounded"
              />
              Name Field
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={config.showDateField}
                onChange={(e) => update({ showDateField: e.target.checked })}
                className="rounded"
              />
              Date Field
            </label>
          </div>

          {config.templateId === "trace-write" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium">Content Type</label>
                <select
                  value={config.contentType}
                  onChange={(e) => update({ contentType: e.target.value as "blank" | "tracing-text" | "tracing-letters" })}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="tracing-text">Custom Text</option>
                  <option value="tracing-letters">Alphabet (Aa-Zz)</option>
                </select>
              </div>
              {config.contentType === "tracing-text" && (
                <div>
                  <label className="mb-1 block text-xs font-medium">Tracing Text</label>
                  <textarea
                    value={config.tracingText}
                    onChange={(e) => update({ tracingText: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Enter words or sentences to trace..."
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium">Font Size: {config.fontSize}px</label>
                <input
                  type="range"
                  min={12}
                  max={36}
                  value={config.fontSize}
                  onChange={(e) => update({ fontSize: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Colors Tab */}
      {tab === "colors" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { key: "primaryColor", label: "Accent" },
            { key: "lineColor", label: "Lines" },
            { key: "backgroundColor", label: "Paper" },
            { key: "textColor", label: "Text" },
            { key: "marginLineColor", label: "Margin" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(config as any)[key] || "#000000"}
                  onChange={(e) => update({ [key]: e.target.value } as any)}
                  className="h-8 w-8 cursor-pointer rounded border"
                />
                <input
                  type="text"
                  value={(config as any)[key] || ""}
                  onChange={(e) => update({ [key]: e.target.value } as any)}
                  className="flex-1 rounded border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
