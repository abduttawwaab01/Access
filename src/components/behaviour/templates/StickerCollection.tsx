"use client"

import type { BehaviourConfig as BC } from "@/types"
import { StarButton } from "../stars/StarButton"

interface Props {
  config: BC
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}

export function StickerCollection({ config, onToggle }: Props) {
  const { students, primaryColor, starColor, starSize, showNames, showTotals, backgroundColor, textColor, borderColor, chartTitle, periodLabel, categories } = config

  const getTotal = (studentId: string) =>
    categories.reduce((sum, cat) => sum + (students.find((s) => s.id === studentId)?.scores[cat.id] || 0), 0)

  return (
    <div
      id="behaviour-preview"
      className="rounded-2xl border-2 p-6 shadow-lg"
      style={{ background: backgroundColor, borderColor, color: textColor }}
    >
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>{chartTitle}</h2>
        <p className="mt-1 text-sm opacity-60">{periodLabel}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => {
          const total = getTotal(student.id)
          return (
            <div
              key={student.id}
              className="rounded-xl border-2 p-4 transition-all hover:shadow-md"
              style={{ borderColor: `${borderColor}40`, background: `${backgroundColor}60` }}
            >
              {showNames && (
                <h3 className="mb-3 text-sm font-bold" style={{ color: primaryColor }}>{student.name}</h3>
              )}

              {/* Sticker circles */}
              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat) => {
                  const score = student.scores[cat.id] || 0
                  return (
                    <div key={cat.id} className="flex flex-col items-center gap-1">
                      <div
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 text-lg transition-all hover:scale-110"
                        style={{
                          borderColor: score > 0 ? starColor : `${borderColor}30`,
                          background: score > 0 ? `${starColor}20` : "transparent",
                        }}
                        onClick={() => onToggle?.(student.id, cat.id)}
                      >
                        {score > 0 ? "⭐" : "○"}
                      </div>
                      <span className="text-[9px] opacity-50">{cat.label.slice(0, 4)}</span>
                    </div>
                  )
                })}
              </div>

              {showTotals && (
                <div className="mt-3 text-center">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: primaryColor }}
                  >
                    ⭐ {total}
                  </span>
                </div>
              )}
            </div>
          )
        })}
        {students.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm opacity-40">
            No students added yet — use the Students tab to add them
          </div>
        )}
      </div>
    </div>
  )
}
