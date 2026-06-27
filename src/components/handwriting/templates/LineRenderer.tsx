"use client"

import type { HandwritingLineStyle, HandwritingLineSpacing } from "@/types"
import { LINE_SPACING_MAP } from "@/types"

interface LineRendererProps {
  count: number
  spacing: HandwritingLineSpacing
  lineStyle: HandwritingLineStyle
  lineColor: string
  marginLeft: number
  showMarginLine: boolean
  marginLineColor: string
  orientation: "portrait" | "landscape"
  children?: React.ReactNode
}

const lineStyleMap: Record<HandwritingLineStyle, string> = {
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
}

export function LineRenderer({
  count,
  spacing,
  lineStyle,
  lineColor,
  marginLeft,
  showMarginLine,
  marginLineColor,
  children,
}: LineRendererProps) {
  const lineH = LINE_SPACING_MAP[spacing]
  const lines = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="relative w-full" style={{ minHeight: count * lineH }}>
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

      {/* Writing lines */}
      {lines.map((i) => {
        const top = i * lineH + lineH / 2
        const isMidLine = lineStyle === "dashed" && i % 2 === 0
        const dashArray = lineStyle === "dashed" ? "8 4" : lineStyle === "dotted" ? "2 4" : "none"

        return (
          <div key={i} className="absolute left-0 w-full" style={{ top: top - 1, height: 0 }}>
            <svg width="100%" height="2" className="block">
              <line
                x1={showMarginLine ? marginLeft + 4 : 0}
                y1="1"
                x2="100%"
                y2="1"
                stroke={lineColor}
                strokeWidth={1.5}
                strokeDasharray={dashArray}
                strokeLinecap="round"
                opacity={isMidLine ? 0.5 : 0.8}
              />
            </svg>
          </div>
        )
      })}

      {/* Dotted middle line for primary/dotted-thirds (every pair) */}
      {(lineStyle === "dotted" || spacing === "wide") && (
        lines.map((i) => {
          if (i % 2 === 1) return null
          const top = i * lineH + lineH / 2 + lineH / 4
          return (
            <div key={`mid-${i}`} className="absolute left-0 w-full" style={{ top: top - 0.5, height: 0 }}>
              <svg width="100%" height="1" className="block">
                <line
                  x1={showMarginLine ? marginLeft + 4 : 0}
                  y1="0.5"
                  x2="100%"
                  y2="0.5"
                  stroke={lineColor}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity={0.4}
                />
              </svg>
            </div>
          )
        })
      )}

      {children}
    </div>
  )
}

export function DashedMidLine({
  lineH,
  marginLeft,
  lineColor,
}: {
  lineH: number
  marginLeft: number
  lineColor: string
}) {
  return (
    <div className="w-full" style={{ height: 0 }}>
      <svg width="100%" height="1" className="block">
        <line
          x1={marginLeft + 4}
          y1="0.5"
          x2="100%"
          y2="0.5"
          stroke={lineColor}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      </svg>
    </div>
  )
}
