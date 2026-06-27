"use client"

interface PictureBoxProps {
  height: number
  borderColor: string
  backgroundColor: string
}

export function PictureBox({ height, borderColor, backgroundColor }: PictureBoxProps) {
  return (
    <div
      className="relative mb-4 flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed"
      style={{
        height,
        borderColor: `${borderColor}60`,
        background: `${backgroundColor}40`,
      }}
    >
      <div className="flex flex-col items-center gap-1 opacity-30">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={borderColor} strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span className="text-[10px]" style={{ color: borderColor }}>Draw your picture here</span>
      </div>
    </div>
  )
}
