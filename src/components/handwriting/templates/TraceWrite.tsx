"use client"

import type { HandwritingConfig } from "@/types"
import { LINE_SPACING_MAP } from "@/types"

interface Props {
  config: HandwritingConfig
}

export function TraceWrite({ config }: Props) {
  const { lineSpacing, lineColor, margins, showMarginLine, marginLineColor, orientation, backgroundColor, textColor, primaryColor, sheetTitle, showTitleField, showNameField, studentName, showDateField, date, contentType, tracingText, fontSize } = config

  const lineH = LINE_SPACING_MAP[lineSpacing]
  const marginLeft = margins
  const pageMaxH = orientation === "portrait" ? 1056 : 768

  const getTracingContent = () => {
    if (contentType === "tracing-letters") {
      return "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz"
    }
    return tracingText || "The quick brown fox jumps over the lazy dog."
  }

  const tracingWords = getTracingContent().split(/\s+/)
  const wordsPerLine = Math.max(2, Math.floor((orientation === "portrait" ? 60 : 90) / (fontSize / 3)))
  const lines = Array.from({ length: config.lineCount }, (_, i) => i)
  const lineGroups: string[][] = []
  for (let i = 0; i < tracingWords.length; i += wordsPerLine) {
    lineGroups.push(tracingWords.slice(i, i + wordsPerLine))
  }

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

      {/* Trace & Write lines */}
      <div className="relative w-full" style={{ minHeight: config.lineCount * lineH }}>
        {showMarginLine && (
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: marginLeft,
              borderRight: `2px solid ${marginLineColor}`,
            }}
          />
        )}

        {lines.map((i) => {
          const top = i * lineH
          const wordGroup = lineGroups[i] || []
          const isTracingLine = i < lineGroups.length

          return (
            <div
              key={i}
              className="absolute left-0 flex w-full items-center px-1"
              style={{ top, height: lineH }}
            >
              {/* Line */}
              <svg width="100%" height={lineH} className="absolute left-0 top-0">
                <line
                  x1={showMarginLine ? marginLeft + 4 : 0}
                  y1={lineH}
                  x2="100%"
                  y2={lineH}
                  stroke={lineColor}
                  strokeWidth={1.5}
                  opacity={0.8}
                />
                {/* Dashed mid line */}
                <line
                  x1={showMarginLine ? marginLeft + 4 : 0}
                  y1={lineH * 0.5}
                  x2="100%"
                  y2={lineH * 0.5}
                  stroke={lineColor}
                  strokeWidth={0.8}
                  strokeDasharray="4 4"
                  opacity={0.35}
                />
              </svg>

              {/* Tracing text on specific lines */}
              {isTracingLine && (
                <div
                  className="relative z-10 flex items-center gap-2"
                  style={{
                    marginLeft: showMarginLine ? marginLeft + 8 : 4,
                    fontSize,
                    lineHeight: `${lineH}px`,
                    color: textColor,
                    opacity: 0.25,
                    fontStyle: "italic",
                    fontFamily: "'Segoe Print', 'Comic Sans MS', cursive",
                  }}
                >
                  {wordGroup.map((word, wi) => (
                    <span key={wi}>{word}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
