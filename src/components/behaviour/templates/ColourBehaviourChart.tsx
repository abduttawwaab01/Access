"use client"

import type { BehaviourConfig as BC } from "@/types"
import { ColourDot } from "../stars/StarButton"

interface Props {
  config: BC
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}

const COLOUR_CYCLE = ["green", "yellow", "red", "grey"] as const

const trafficLabels: Record<string, string> = {
  green: "Excellent",
  yellow: "Warning",
  red: "Poor",
  grey: "Not Rated",
}

export function ColourBehaviourChart({ config, onCycleColour }: Props) {
  const { students, primaryColor, showNames, backgroundColor, textColor, borderColor, chartTitle, periodLabel } = config

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

      <div className="mb-4 flex justify-center gap-4">
        {(["green", "yellow", "red"] as const).map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs font-medium">
            <svg width={14} height={14}><circle cx="7" cy="7" r="6" fill={c === "green" ? "#22c55e" : c === "yellow" ? "#eab308" : "#ef4444"} /></svg>
            {trafficLabels[c]}
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {students.map((student) => {
          const colour = student.scores["colour"] || 3
          const currentColour = COLOUR_CYCLE[colour] || "grey"
          return (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:shadow-md"
              style={{ borderColor, background: `${backgroundColor}80` }}
            >
              {showNames && <span className="text-sm font-medium">{student.name}</span>}
              <ColourDot
                colour={currentColour}
                onClick={() => onCycleColour?.(student.id)}
              />
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
