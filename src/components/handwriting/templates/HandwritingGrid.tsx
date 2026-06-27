"use client"

import type { HandwritingConfig } from "@/types"
import { LINE_SPACING_MAP } from "@/types"

interface Props {
  config: HandwritingConfig
}

export function HandwritingGrid({ config }: Props) {
  const { lineSpacing, lineColor, margins, showMarginLine, marginLineColor, orientation, backgroundColor, textColor, primaryColor, sheetTitle, showTitleField, showNameField, studentName, showDateField, date } = config

  const cellSize = LINE_SPACING_MAP[lineSpacing]
  const marginLeft = margins
  const pageMaxH = orientation === "portrait" ? 1056 : 768
  const cols = orientation === "portrait" ? 10 : 14
  const rows = config.lineCount

  return (
    <div
      id="handwriting-preview"
      className="relative mx-auto rounded-sm p-8 shadow-xl"
      style={{
        background: backgroundColor,
        color: textColor,
        maxWidth: orientation === "portrait" ? 816 : 1056,
        minHeight: pageMaxH,
        fontFamily: "'Segoe Print', 'Comic Sans MS', cursive",
      }}
    >
      {/* Header */}
      {(showTitleField || showNameField || showDateField) && (
        <div className="mb-6 flex items-end justify-between border-b pb-2" style={{ borderColor: `${primaryColor}40` }}>
          <div className="flex-1">
            {showTitleField && (
              <h2 className="text-xl font-bold tracking-tight" style={{ color: primaryColor }}>{sheetTitle}</h2>
            )}
          </div>
          <div className="flex gap-6 text-sm">
            {showNameField && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-50">Name:</span>
                <span className="min-w-[100px] border-b border-dotted pb-0.5" style={{ borderColor: textColor }}>
                  {studentName || "_______________"}
                </span>
              </div>
            )}
            {showDateField && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-50">Date:</span>
                <span className="min-w-[80px] border-b border-dotted pb-0.5" style={{ borderColor: textColor }}>
                  {date || "_______________"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="relative overflow-hidden" style={{ minHeight: rows * cellSize }}>
        {showMarginLine && (
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: marginLeft,
              borderRight: `2px solid ${marginLineColor}`,
            }}
          />
        )}

        <svg
          width="100%"
          height={rows * cellSize}
          className="block"
          style={{ minHeight: rows * cellSize }}
        >
          {/* Horizontal lines */}
          {Array.from({ length: rows + 1 }, (_, r) => (
            <line
              key={`h-${r}`}
              x1={showMarginLine ? marginLeft + 4 : 0}
              y1={r * cellSize}
              x2="100%"
              y2={r * cellSize}
              stroke={lineColor}
              strokeWidth={r % 2 === 0 ? 1.5 : 0.8}
              opacity={r % 2 === 0 ? 0.7 : 0.35}
            />
          ))}
          {/* Vertical lines */}
          {Array.from({ length: cols + 1 }, (_, c) => (
            <line
              key={`v-${c}`}
              x1={(c / cols) * 100 + "%"}
              y1={0}
              x2={(c / cols) * 100 + "%"}
              y2={rows * cellSize}
              stroke={lineColor}
              strokeWidth={0.5}
              opacity={0.2}
            />
          ))}
          {/* Cross marks at intersections for letter placement */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const cx = (c / cols) * 100
              const cy = r * cellSize + cellSize * 0.5
              return (
                <g key={`cross-${r}-${c}`}>
                  <line
                    x1={`${cx}%`}
                    y1={cy - cellSize * 0.15}
                    x2={`${cx}%`}
                    y2={cy + cellSize * 0.15}
                    stroke={lineColor}
                    strokeWidth={0.4}
                    opacity={0.1}
                  />
                  <line
                    x1={`${cx - 100 / cols * 0.4}%`}
                    y1={cy}
                    x2={`${cx + 100 / cols * 0.4}%`}
                    y2={cy}
                    stroke={lineColor}
                    strokeWidth={0.4}
                    opacity={0.1}
                  />
                </g>
              )
            })
          )}
        </svg>
      </div>
    </div>
  )
}
