"use client"

import type { HandwritingConfig } from "@/types"
import { LINE_SPACING_MAP } from "@/types"

interface Props {
  config: HandwritingConfig
}

export function DottedThirds({ config }: Props) {
  const { lineSpacing, lineColor, margins, showMarginLine, marginLineColor, orientation, backgroundColor, textColor, primaryColor, sheetTitle, showTitleField, showNameField, studentName, showDateField, date } = config

  const lineH = LINE_SPACING_MAP[lineSpacing]
  const marginLeft = margins
  const pageMaxH = orientation === "portrait" ? 1056 : 768
  const lines = Array.from({ length: config.lineCount }, (_, i) => i)

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

      {/* Dotted thirds lines - each "third" is a group of 3 lines: bottom (solid), dotted (mid), top (solid) */}
      <div className="relative w-full" style={{ minHeight: config.lineCount * lineH * 3 }}>
        {/* Margin line */}
        {showMarginLine && (
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: marginLeft,
              borderRight: `2px solid ${marginLineColor}`,
            }}
          />
        )}

        {lines.map((group) => {
          const baseY = group * lineH * 3
          return (
            <div key={group} className="absolute left-0 w-full" style={{ top: baseY }}>
              {/* Bottom line - solid */}
              <svg width="100%" height={lineH * 3} className="block">
                <line
                  x1={showMarginLine ? marginLeft + 4 : 0}
                  y1={lineH * 3}
                  x2="100%"
                  y2={lineH * 3}
                  stroke={lineColor}
                  strokeWidth={1.5}
                  opacity={0.8}
                />
                {/* Middle line - dotted */}
                <line
                  x1={showMarginLine ? marginLeft + 4 : 0}
                  y1={lineH * 1.5}
                  x2="100%"
                  y2={lineH * 1.5}
                  stroke={lineColor}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
                {/* Top line - solid */}
                <line
                  x1={showMarginLine ? marginLeft + 4 : 0}
                  y1={0}
                  x2="100%"
                  y2={0}
                  stroke={lineColor}
                  strokeWidth={1.5}
                  opacity={0.3}
                />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
