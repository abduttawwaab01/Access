"use client"

import type { BehaviourConfig as BC } from "@/types"
import { StarButton } from "../stars/StarButton"

interface Props {
  config: BC
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}

export function DailyStarChart({ config, onToggle }: Props) {
  const { students, categories, primaryColor, starColor, starSize, showNames, showTotals, showEmojis, backgroundColor, textColor, borderColor, chartTitle, periodLabel } = config

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

      <div className="overflow-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              {showNames && <th className="sticky left-0 bg-inherit px-2 py-2 text-left text-sm font-semibold">Name</th>}
              {categories.map((cat) => (
                <th key={cat.id} className="px-2 py-2 text-center text-xs font-medium" style={{ color: primaryColor }}>
                  <div className="flex flex-col items-center gap-0.5">
                    {showEmojis && <span className="text-lg">{cat.emoji}</span>}
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </div>
                </th>
              ))}
              {showTotals && <th className="px-2 py-2 text-center text-sm font-semibold">Total</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t" style={{ borderColor }}>
                {showNames && (
                  <td className="sticky left-0 bg-inherit px-2 py-2 text-sm font-medium">{student.name}</td>
                )}
                {categories.map((cat) => {
                  const score = student.scores[cat.id] || 0
                  return (
                    <td key={cat.id} className="px-1 py-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: cat.maxScore }, (_, i) => (
                          <StarButton
                            key={i}
                            filled={i < score}
                            color={starColor}
                            size={starSize}
                            onClick={() => onToggle?.(student.id, cat.id)}
                          />
                        ))}
                      </div>
                    </td>
                  )
                })}
                {showTotals && (
                  <td className="px-2 py-2 text-center">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: primaryColor }}
                    >
                      {getTotal(student.id)}
                    </span>
                  </td>
                )}
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={categories.length + (showNames ? 1 : 0) + (showTotals ? 1 : 0)} className="py-10 text-center text-sm opacity-40">
                  No students added yet — use the Students tab to add them
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
