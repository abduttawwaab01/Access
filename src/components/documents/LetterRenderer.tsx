"use client"

import { useState } from "react"
import { EditableLetterData, getTemplateAccentColor } from "./letter-templates"

interface LetterRendererProps {
  data: EditableLetterData
  editable?: boolean
  onChange?: (field: string, value: string) => void
  letterType?: string
}

function EditableField({
  value,
  onChange,
  editable,
  multiline,
  className,
  style,
}: {
  value: string
  onChange?: (val: string) => void
  editable?: boolean
  multiline?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  if (!editable || !onChange) {
    if (multiline) {
      return (
        <div className={className} style={style}>
          {value.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < value.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>
      )
    }
    return <span className={className} style={style}>{value}</span>
  }

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-dashed border-blue-300 rounded px-1 bg-blue-50/30 resize-y focus:outline-none focus:border-blue-500 ${className || ""}`}
        style={{ ...style, minHeight: 80, fontFamily: "inherit" }}
        rows={Math.max(3, value.split("\n").length + 1)}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-dashed border-blue-300 rounded px-1 bg-blue-50/30 focus:outline-none focus:border-blue-500 ${className || ""}`}
      style={style}
    />
  )
}

function LetterHeader({ data }: { data: EditableLetterData }) {
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${getTemplateAccentColor("default")}, ${getTemplateAccentColor("default")}dd)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingTop: 8 }}>
        {data.schoolLogo && (
          <img src={data.schoolLogo} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#1e3a5f" }}>{data.schoolName}</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0" }}>{data.schoolMotto}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{data.schoolAddress}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.schoolPhone}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.schoolEmail}</p>
        </div>
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", marginBottom: 24 }} />
    </>
  )
}

function LetterFooter({ data }: { data: EditableLetterData }) {
  return (
    <>
      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginTop: 32, marginBottom: 12 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>This is a computer-generated document. It is valid without a physical signature.</p>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{data.schoolName} — {data.schoolPhone} | {data.schoolEmail}</p>
      </div>
    </>
  )
}

export function LetterRenderer({ data, editable = false, onChange, letterType }: LetterRendererProps) {
  const date = new Date(data.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  const accentColor = getTemplateAccentColor(letterType || "acceptance")
  const firstName = data.studentName.split(" ")[0]

  const update = (field: string) => (val: string) => {
    onChange?.(field, val)
  }

  const body = data.body || ""
  const subject = data.subject || "Letter"
  const recipient = data.recipient || "The Parent/Guardian"
  const salutation = data.salutation || "Dear Parent/Guardian,"
  const closing = data.closing || "Yours faithfully,"
  const signatory = data.signatory || "Principal"
  const signatoryTitle = data.signatoryTitle || data.schoolName

  return (
    <div className="bg-white text-black" style={{ width: 794, minHeight: 1123, padding: 40, fontFamily: "system-ui, sans-serif", position: "relative", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingTop: 8 }}>
        {data.schoolLogo && (
          <img src={data.schoolLogo} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#1e3a5f" }}>{data.schoolName}</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0" }}>{data.schoolMotto}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{data.schoolAddress}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.schoolPhone}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{data.schoolEmail}</p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: `2px solid ${accentColor}30`, marginBottom: 24 }} />

      <div style={{ textAlign: "right", marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>{date}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Ref: {data.reference}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: "#334155", margin: "0 0 4px", fontWeight: 500 }}>
          <EditableField value={recipient} editable={editable} onChange={update("recipient")} />
        </p>
        <p style={{ fontSize: 13, color: "#334155", margin: 0, fontWeight: 500 }}>{data.studentName}</p>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{data.studentClass} — ID: {data.studentId}</p>
        <p style={{ fontSize: 13, color: "#334155", margin: "8px 0 0" }}>
          <EditableField value={salutation} editable={editable} onChange={update("salutation")} />
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: accentColor, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
          <EditableField value={subject} editable={editable} onChange={update("subject")} style={{ color: accentColor, fontWeight: 700, fontSize: 15 }} />
        </h3>
      </div>

      <div style={{ lineHeight: 2, fontSize: 13, color: "#334155" }}>
        <EditableField
          value={body}
          editable={editable}
          onChange={update("body")}
          multiline
          style={{ lineHeight: 2, fontSize: 13, color: "#334155" }}
        />
      </div>

      <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>
            <EditableField value={closing} editable={editable} onChange={update("closing")} />
          </p>
          <div style={{ marginTop: 40, borderTop: "1px solid #cbd5e1", paddingTop: 8, width: 240 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: accentColor, margin: 0 }}>
              <EditableField value={signatory} editable={editable} onChange={update("signatory")} style={{ color: accentColor, fontWeight: 600 }} />
            </p>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              <EditableField value={signatoryTitle} editable={editable} onChange={update("signatoryTitle")} />
            </p>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginTop: 32, marginBottom: 12 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>This is a computer-generated document. It is valid without a physical signature.</p>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{data.schoolName} — {data.schoolPhone} | {data.schoolEmail}</p>
      </div>
    </div>
  )
}
