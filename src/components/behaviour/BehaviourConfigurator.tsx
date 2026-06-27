"use client"

import { useState } from "react"
import type { BehaviourConfig, BehaviourCategory, StudentBehaviourEntry, BehaviourReward, CATEGORY_PRESETS } from "@/types"
import { behaviourTemplates } from "./templates"

interface Props {
  config: BehaviourConfig
  onChange: (config: BehaviourConfig) => void
}

type Tab = "template" | "students" | "categories" | "colors" | "rewards"

export function BehaviourConfigurator({ config, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("template")
  const [newStudentName, setNewStudentName] = useState("")
  const [importBulk, setImportBulk] = useState("")

  const update = (patch: Partial<BehaviourConfig>) => onChange({ ...config, ...patch })

  const addStudent = () => {
    if (!newStudentName.trim()) return
    const entry: StudentBehaviourEntry = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      scores: {},
    }
    update({ students: [...config.students, entry] })
    setNewStudentName("")
  }

  const removeStudent = (id: string) => {
    update({ students: config.students.filter((s) => s.id !== id) })
  }

  const bulkImport = () => {
    const names = importBulk.split("\n").map((s) => s.trim()).filter(Boolean)
    const entries: StudentBehaviourEntry[] = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      scores: {},
    }))
    update({ students: [...config.students, ...entries] })
    setImportBulk("")
  }

  const addCategory = () => {
    const idx = config.categories.length + 1
    const cat: BehaviourCategory = {
      id: `cat_${Date.now()}`,
      label: `Category ${idx}`,
      emoji: "⭐",
      maxScore: 3,
    }
    update({ categories: [...config.categories, cat] })
  }

  const removeCategory = (id: string) => {
    update({ categories: config.categories.filter((c) => c.id !== id) })
  }

  const updateCategory = (id: string, patch: Partial<BehaviourCategory>) => {
    update({ categories: config.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  }

  const resetStudents = () => {
    const reset = config.students.map((s) => ({ ...s, scores: {} }))
    update({ students: reset })
  }

  const addReward = () => {
    update({ rewards: [...config.rewards, { threshold: 0, label: "" }] })
  }

  const removeReward = (i: number) => {
    update({ rewards: config.rewards.filter((_, idx) => idx !== i) })
  }

  const updateReward = (i: number, patch: Partial<BehaviourReward>) => {
    update({ rewards: config.rewards.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "template", label: "Template" },
    { key: "students", label: "Students" },
    { key: "categories", label: "Categories" },
    { key: "colors", label: "Colors" },
    { key: "rewards", label: "Rewards" },
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
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Template Tab */}
      {tab === "template" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {behaviourTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => update({ templateId: tpl.id })}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  config.templateId === tpl.id
                    ? "border-amber-400 bg-amber-50 shadow-md dark:border-amber-500 dark:bg-amber-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                }`}
              >
                <div className="text-lg font-bold" style={{ color: config.primaryColor }}>{tpl.name}</div>
                <p className="mt-1 text-[11px] leading-tight text-gray-500 dark:text-gray-400">{tpl.description}</p>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Chart Title</label>
            <input
              type="text"
              value={config.chartTitle}
              onChange={(e) => update({ chartTitle: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="block text-sm font-medium">Period Label (e.g. &quot;Week 1&quot;)</label>
            <input
              type="text"
              value={config.periodLabel}
              onChange={(e) => update({ periodLabel: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="block text-sm font-medium">School Name</label>
            <input
              type="text"
              value={config.schoolName}
              onChange={(e) => update({ schoolName: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Students Tab */}
      {tab === "students" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
              placeholder="Enter student name"
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
            />
            <button
              onClick={addStudent}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
            >
              Add
            </button>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400">
              Bulk import (paste names, one per line)
            </summary>
            <div className="mt-2 flex gap-2">
              <textarea
                value={importBulk}
                onChange={(e) => setImportBulk(e.target.value)}
                rows={4}
                placeholder="Student 1&#10;Student 2&#10;Student 3"
                className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              />
              <button
                onClick={bulkImport}
                className="self-end rounded-lg bg-amber-400 px-3 py-2 text-sm text-white hover:bg-amber-500"
              >
                Import
              </button>
            </div>
          </details>

          {config.students.length > 0 && (
            <>
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {config.students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-gray-600">
                    <span className="text-sm">{s.name}</span>
                    <button
                      onClick={() => removeStudent(s.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetStudents}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Reset All Stars
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["default", "academic", "conduct", "nursery"].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  const presets: Record<string, BehaviourCategory[]> = {
                    default: [
                      { id: "participation", label: "Participation", emoji: "🙋", maxScore: 3 },
                      { id: "homework", label: "Homework", emoji: "📚", maxScore: 3 },
                      { id: "behaviour", label: "Behaviour", emoji: "😊", maxScore: 3 },
                      { id: "cleanliness", label: "Cleanliness", emoji: "🧹", maxScore: 3 },
                      { id: "punctuality", label: "Punctuality", emoji: "⏰", maxScore: 3 },
                    ],
                    academic: [
                      { id: "reading", label: "Reading", emoji: "📖", maxScore: 3 },
                      { id: "writing", label: "Writing", emoji: "✏️", maxScore: 3 },
                      { id: "math", label: "Math", emoji: "🔢", maxScore: 3 },
                      { id: "science", label: "Science", emoji: "🔬", maxScore: 3 },
                      { id: "art", label: "Art & Creative", emoji: "🎨", maxScore: 3 },
                    ],
                    conduct: [
                      { id: "respect", label: "Respect", emoji: "🙏", maxScore: 3 },
                      { id: "honesty", label: "Honesty", emoji: "🤝", maxScore: 3 },
                      { id: "kindness", label: "Kindness", emoji: "💛", maxScore: 3 },
                      { id: "responsibility", label: "Responsibility", emoji: "✅", maxScore: 3 },
                      { id: "teamwork", label: "Teamwork", emoji: "👥", maxScore: 3 },
                    ],
                    nursery: [
                      { id: "sharing", label: "Sharing", emoji: "🧸", maxScore: 3 },
                      { id: "listening", label: "Listening", emoji: "👂", maxScore: 3 },
                      { id: "following", label: "Following Rules", emoji: "📏", maxScore: 3 },
                      { id: "tidy", label: "Tidying Up", emoji: "🧹", maxScore: 3 },
                      { id: "manners", label: "Good Manners", emoji: "🌷", maxScore: 3 },
                    ],
                  }
                  update({ categories: presets[preset] || presets.default })
                }}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-600"
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {config.categories.map((cat) => (
              <div key={cat.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 dark:border-gray-600">
                <input
                  value={cat.label}
                  onChange={(e) => updateCategory(cat.id, { label: e.target.value })}
                  className="flex-1 min-w-[100px] rounded border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Label"
                />
                <input
                  value={cat.emoji}
                  onChange={(e) => updateCategory(cat.id, { emoji: e.target.value })}
                  className="w-10 rounded border px-1 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700"
                  placeholder="😊"
                />
                <select
                  value={cat.maxScore}
                  onChange={(e) => updateCategory(cat.id, { maxScore: Number(e.target.value) })}
                  className="rounded border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                >
                  {[1, 2, 3, 5].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addCategory}
            className="rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600"
          >
            + Add Category
          </button>
        </div>
      )}

      {/* Colors Tab */}
      {tab === "colors" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { key: "primaryColor", label: "Primary" },
            { key: "starColor", label: "Star" },
            { key: "backgroundColor", label: "Background" },
            { key: "textColor", label: "Text" },
            { key: "borderColor", label: "Border" },
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

      {/* Rewards Tab */}
      {tab === "rewards" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={config.showRewardTrack}
                onChange={(e) => update({ showRewardTrack: e.target.checked })}
                className="rounded"
              />
              Show Reward Track
            </label>
          </div>
          {config.rewards.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 dark:border-gray-600">
              <input
                type="number"
                value={r.threshold}
                onChange={(e) => updateReward(i, { threshold: Number(e.target.value) })}
                className="w-16 rounded border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                placeholder="Stars"
              />
              <input
                value={r.label}
                onChange={(e) => updateReward(i, { label: e.target.value })}
                className="flex-1 rounded border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                placeholder="Reward label"
              />
              <button
                onClick={() => removeReward(i)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addReward}
            className="rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600"
          >
            + Add Reward
          </button>
        </div>
      )}
    </div>
  )
}
