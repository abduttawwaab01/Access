"use client"

import { motion } from "framer-motion"

interface StarButtonProps {
  filled: boolean
  color: string
  size: "sm" | "md" | "lg"
  onClick: () => void
  disabled?: boolean
}

const sizeMap = { sm: 16, md: 22, lg: 28 }

export function StarButton({ filled, color, size, onClick, disabled }: StarButtonProps) {
  const px = sizeMap[size]
  const emptyColor = "#d1d5db"

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.2 } : undefined}
      whileTap={!disabled ? { scale: 0.85 } : undefined}
      animate={filled ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="inline-flex items-center justify-center rounded-full p-1 transition-opacity disabled:opacity-40"
      style={{ width: px + 8, height: px + 8 }}
    >
      {filled ? (
        <svg width={px} height={px} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke={emptyColor} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </motion.button>
  )
}

interface ColourDotProps {
  colour: "green" | "yellow" | "red" | "grey"
  onClick: () => void
  disabled?: boolean
}

const dotColours: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  grey: "#d1d5db",
}

export function ColourDot({ colour, onClick, disabled }: ColourDotProps) {
  const c = dotColours[colour] || "#d1d5db"

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center justify-center rounded-full transition-opacity disabled:opacity-40"
      style={{ width: 30, height: 30 }}
    >
      <svg width={22} height={22} viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="10" fill={c} stroke={colour === "grey" ? "#9ca3af" : c} strokeWidth="1" />
        {colour === "red" && (
          <line x1="7" y1="7" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
        )}
        {colour === "yellow" && (
          <text x="11" y="15" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">!</text>
        )}
        {colour === "green" && (
          <polyline points="6,11 9.5,14.5 16,8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </motion.button>
  )
}

interface RewardMilestoneProps {
  earned: boolean
  threshold: number
  label: string
  color: string
}

export function RewardMilestone({ earned, threshold, label, color }: RewardMilestoneProps) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] transition-all ${earned ? "shadow-sm" : "opacity-50"}`}
      style={{
        background: earned ? `${color}20` : "#f3f4f6",
        border: `1px solid ${earned ? color : "#e5e7eb"}`,
        color: earned ? color : "#9ca3af",
      }}>
      <svg width={12} height={12} viewBox="0 0 24 24" fill={earned ? color : "#d1d5db"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="font-medium">{threshold}</span>
      <span>{label}</span>
    </div>
  )
}
