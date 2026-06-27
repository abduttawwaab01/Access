"use client"

import type { BehaviourConfig as BC } from "@/types"
import { StarButton, RewardMilestone } from "../stars/StarButton"

interface Props {
  config: BC
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}

export function RewardLadder({ config, onToggle }: Props) {
  const { students, primaryColor, starColor, starSize, showNames, showTotals, showRewardTrack, backgroundColor, textColor, borderColor, chartTitle, periodLabel, rewards, categories } = config

  const getTotal = (studentId: string) =>
    categories.reduce((sum, cat) => sum + (students.find((s) => s.id === studentId)?.scores[cat.id] || 0), 0)

  const maxTotal = Math.max(1, ...students.map((s) => getTotal(s.id)))
  const ladderRungs = Math.max(5, Math.ceil(maxTotal / 5) * 5)

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
              {categories.map((cat) => (
                <th key={cat.id} className="px-2 py-2 text-center text-xs font-medium" style={{ color: primaryColor }}>
                  {cat.label}
                </th>
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
                  {categories.map((cat) => {
                    const score = student.scores[cat.id] || 0
                    return (
                      <td key={cat.id} className="px-1 py-1 text-center">
                        <StarButton
                          filled={score > 0}
                          color={starColor}
                          size={starSize}
                          onClick={() => onToggle?.(student.id, cat.id)}
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
                <td colSpan={categories.length + (showNames ? 1 : 0) + (showTotals ? 1 : 0)} className="py-10 text-center text-sm opacity-40">
                  No students added yet — use the Students tab to add them
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Progress ladder */}
      {students.length > 0 && (
        <div className="mt-6 border-t pt-4" style={{ borderColor }}>
          <p className="mb-3 text-xs font-medium opacity-60">Progress Ladder</p>
          <div className="flex gap-6 overflow-auto pb-2">
            {students.map((student) => {
              const total = getTotal(student.id)
              const pct = Math.min(100, (total / ladderRungs) * 100)
              return (
                <div key={student.id} className="flex flex-col items-center gap-1 min-w-[80px]">
                  <span className="text-[10px] font-medium truncate max-w-[80px] text-center">{student.name}</span>
                  <div className="relative h-[100px] w-5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full rounded-full transition-all duration-500"
                      style={{
                        height: `${pct}%`,
                        background: `linear-gradient(to top, ${primaryColor}, ${starColor})`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: primaryColor }}>{total}/{ladderRungs}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showRewardTrack && rewards.length > 0 && (
        <div className="mt-4 border-t pt-3" style={{ borderColor }}>
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
