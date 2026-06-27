"use client"

import type { BehaviourConfig as BC } from "@/types"
import { StarButton, RewardMilestone } from "../stars/StarButton"

interface Props {
  config: BC
  onToggle?: (studentId: string, goalId: string) => void
  onCycleColour?: (studentId: string) => void
}

const GOALS = ["Goal 1", "Goal 2", "Goal 3", "Goal 4"]

export function MonthlyGoalTracker({ config, onToggle }: Props) {
  const { students, primaryColor, starColor, starSize, showNames, showTotals, showRewardTrack, backgroundColor, textColor, borderColor, chartTitle, periodLabel, rewards } = config

  const getTotal = (studentId: string) =>
    GOALS.reduce((sum, _, i) => sum + (students.find((s) => s.id === studentId)?.scores[`goal_${i}`] || 0), 0)

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
        <table className="w-full min-w-[550px] border-collapse">
          <thead>
            <tr>
              {showNames && <th className="sticky left-0 bg-inherit px-3 py-2 text-left text-sm font-semibold">Name</th>}
              {GOALS.map((g, i) => (
                <th key={i} className="px-2 py-2 text-center text-xs font-medium" style={{ color: primaryColor }}>{g}</th>
              ))}
              {showTotals && <th className="px-2 py-2 text-center text-sm font-semibold">Total</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const total = getTotal(student.id)
              return (
                <tr key={student.id} className="border-t" style={{ borderColor }}>
                  {showNames && (
                    <td className="sticky left-0 bg-inherit px-3 py-2 text-sm font-medium">{student.name}</td>
                  )}
                  {GOALS.map((_, gIdx) => {
                    const score = student.scores[`goal_${gIdx}`] || 0
                    return (
                      <td key={gIdx} className="px-1 py-1 text-center">
                        <StarButton
                          filled={score > 0}
                          color={starColor}
                          size={starSize}
                          onClick={() => onToggle?.(student.id, `goal_${gIdx}`)}
                        />
                      </td>
                    )
                  })}
                  {showTotals && (
                    <td className="px-2 py-2 text-center">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: primaryColor }}
                      >
                        {total}
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={GOALS.length + (showNames ? 1 : 0) + (showTotals ? 1 : 0)} className="py-10 text-center text-sm opacity-40">
                  No students added yet — use the Students tab to add them
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRewardTrack && rewards.length > 0 && (
        <div className="mt-6 border-t pt-4" style={{ borderColor }}>
          <p className="mb-2 text-xs font-medium opacity-60">Reward Milestones</p>
          <div className="flex flex-wrap gap-2">
            {rewards.map((r, i) => (
              <RewardMilestone key={i} earned={false} threshold={r.threshold} label={r.label} color={primaryColor} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
