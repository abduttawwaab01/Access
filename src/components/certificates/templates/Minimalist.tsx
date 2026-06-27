"use client"

import type { CertificateConfig } from "@/types"

export function Minimalist({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#333333"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: s(config.backgroundColor),
        color: s(config.textColor),
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Thin border */}
      <div
        style={{
          position: "absolute",
          inset: 20,
          border: `1px solid ${s(config.borderColor)}33`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 24,
          border: `1px solid ${s(config.borderColor)}15`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "48px 56px", textAlign: "center" }}>
        {/* Tiny accent line top */}
        <div
          style={{
            width: 40,
            height: 2,
            background: s(config.primaryColor),
            margin: "0 auto 24px",
          }}
        />

        {config.schoolLogo && (
          <img src={config.schoolLogo} alt="Logo" style={{ height: 44, marginBottom: 16 }} />
        )}

        {config.schoolName && (
          <h1
            style={{
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: s(config.textColor) + "88",
              marginBottom: 4,
            }}
          >
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 10, color: s(config.textColor) + "55", marginBottom: 24, letterSpacing: 2 }}>
            {config.schoolMotto}
          </p>
        )}

        <div
          style={{
            width: 40,
            height: 1,
            background: s(config.textColor) + "22",
            margin: "0 auto 24px",
          }}
        />

        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: s(config.textColor) + "66", marginBottom: 4 }}>
          This certificate is awarded to
        </p>

        <h2
          style={{
            fontSize: 32,
            fontWeight: 300,
            color: s(config.textColor),
            marginBottom: 4,
            letterSpacing: 1,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <p style={{ fontSize: 11, color: s(config.textColor) + "77", marginBottom: 16, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 16px" }}>
          In recognition of achieving the award of <strong style={{ color: s(config.accentColor) }}>{config.awardName || "Achievement"}</strong>
        </p>

        {config.reason && (
          <p style={{ fontSize: 11, color: s(config.textColor) + "66", marginBottom: 8, maxWidth: 420, margin: "0 auto 8px", lineHeight: 1.5 }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 10, color: s(config.textColor) + "55", marginBottom: 24 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div
          style={{
            width: 40,
            height: 1,
            background: s(config.textColor) + "22",
            margin: "0 auto 24px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 48px", fontSize: 10, color: s(config.textColor) + "66" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: s(config.textColor) + "88", marginBottom: 2 }}>{config.signatureName || "Signature"}</p>
            {config.signatureImage && <img src={config.signatureImage} alt="Signature" style={{ height: 24 }} />}
            <div style={{ width: 100, height: 1, background: s(config.textColor) + "22", margin: "2px auto" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: s(config.textColor) + "88", marginBottom: 2 }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 9, color: s(config.textColor) + "55" }}>{config.issuerTitle || "Principal"}</p>
            <div style={{ width: 100, height: 1, background: s(config.textColor) + "22", margin: "2px auto" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, color: s(config.textColor) + "88", marginBottom: 2 }}>{config.date || "Date"}</p>
            <div style={{ width: 100, height: 1, background: s(config.textColor) + "22", margin: "2px auto" }} />
          </div>
        </div>

        <p style={{ fontSize: 8, color: s(config.textColor) + "44", marginTop: 24, letterSpacing: 1 }}>{config.certificateId}</p>

        {/* Tiny accent line bottom */}
        <div
          style={{
            width: 40,
            height: 2,
            background: s(config.primaryColor),
            margin: "24px auto 0",
          }}
        />
      </div>
    </div>
  )
}
