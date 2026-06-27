"use client"

interface TracingTextProps {
  text: string
  fontSize: number
  textColor: string
  opacity?: number
}

export function TracingText({ text, fontSize, textColor, opacity = 0.25 }: TracingTextProps) {
  return (
    <span
      className="block font-handwriting leading-relaxed tracking-wide"
      style={{
        fontSize,
        color: textColor,
        opacity,
        fontStyle: "italic",
        fontFamily: "'Segoe Print', 'Comic Sans MS', cursive",
      }}
    >
      {text}
    </span>
  )
}
