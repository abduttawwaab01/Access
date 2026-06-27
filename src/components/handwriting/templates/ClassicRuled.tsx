"use client"

import type { HandwritingConfig } from "@/types"
import { LINE_SPACING_MAP } from "@/types"
import { LineRenderer } from "./LineRenderer"

interface Props {
  config: HandwritingConfig
}

export function ClassicRuled({ config }: Props) {
  const { lineSpacing, lineStyle, lineColor, margins, showMarginLine, marginLineColor, orientation, backgroundColor, textColor, primaryColor, sheetTitle, showTitleField, showNameField, studentName, showDateField, date } = config

  const lineH = LINE_SPACING_MAP[lineSpacing]
  const marginLeft = margins
  const pageMaxH = orientation === "portrait" ? 1056 : 768

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

      {/* Writing lines */}
      <LineRenderer
        count={config.lineCount}
        spacing={lineSpacing}
        lineStyle={lineStyle}
        lineColor={lineColor}
        marginLeft={marginLeft}
        showMarginLine={showMarginLine}
        marginLineColor={marginLineColor}
        orientation={orientation}
      />
    </div>
  )
}
