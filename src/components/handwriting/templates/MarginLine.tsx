"use client"

interface MarginLineProps {
  color: string
  marginLeft: number
}

export function MarginLine({ color, marginLeft }: MarginLineProps) {
  return (
    <div
      className="absolute left-0 top-0 h-full"
      style={{
        width: marginLeft,
        borderRight: `2px solid ${color}`,
      }}
    />
  )
}
