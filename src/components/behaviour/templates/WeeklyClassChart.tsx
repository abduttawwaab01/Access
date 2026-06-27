"use client"

import type { BehaviourConfig as BC } from "@/types"
import { StarButton } from "../stars/StarButton"

interface Props {
  config: BC
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

export function WeeklyClassChart({ config, onToggle }: Props) {
  const { students, primaryColor, starColor, starSize, showNames, showTotals, backgroundColor, textColor, borderColor, chartTitle, periodLabel } = config

  const getTotal = (studentId: string) => (students.find((s) => s.id === studentId)?.scores["total"] || 0)
  const getDayScore = (studentId: string, dayIdx: number) => (students.find((s) => s.id === studentId)?.scores[`day_${dayIdx}`] || 0)

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
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr>
              {showNames && <th className="sticky left-0 bg-inherit px-3 py-2 text-left text-sm font-semibold">Name</th>}
              {DAYS.map((d, i) => (
                <th key={i} className="px-2 py-2 text-center text-xs font-medium" style={{ color: primaryColor }}>{d}</th>
              ))}
              {showTotals && <th className="px-2 py-2 text-center text-sm font-semibold">Total</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t" style={{ borderColor }}>
                {showNames && (
                  <td className="sticky left-0 bg-inherit px-3 py-2 text-sm font-medium">{student.name}</td>
                )}
                {DAYS.map((_, dIdx) => {
                  const score = getDayScore(student.id, dIdx)
                  return (
                    <td key={dIdx} className="px-1 py-1 text-center">
                      <div className="flex items-center justify-center">
                        <StarButton
                          filled={score > 0}
                          color={starColor}
                          size={starSize}
                          onClick={() => onToggle?.(student.id, `day_${dIdx}`)}
                        />
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
                <td colSpan={DAYS.length + (showNames ? 1 : 0) + (showTotals ? 1 : 0)} className="py-10 text-center text-sm opacity-40">
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
