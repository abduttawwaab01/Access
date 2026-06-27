"use client"

import type { CertificateConfig } from "@/types"

export function RoyalPurple({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#6b21a8"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: `linear-gradient(135deg, ${s(config.backgroundColor)}, ${s(config.backgroundColor)}ee)`,
        color: s(config.textColor),
        fontFamily: "'Playfair Display', 'Georgia', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Outer border */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          border: `2px solid ${s(config.borderColor)}55`,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 14,
          border: `1px solid ${s(config.borderColor)}33`,
          borderRadius: 2,
        }}
      />

      {/* Crest corners */}
      {[
        { top: 14, left: 14 },
        { top: 14, right: 14 },
        { bottom: 14, left: 14 },
        { bottom: 14, right: 14 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28">
            <path
              d="M14,2 C18,6 22,6 26,14 C22,22 18,22 14,26 C10,22 6,22 2,14 C6,6 10,6 14,2 Z"
              fill="none"
              stroke={s(config.borderColor) + "66"}
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="3" fill={s(config.borderColor) + "44"} />
          </svg>
        </div>
      ))}

      <div style={{ position: "relative", zIndex: 1, padding: "36px 48px", textAlign: "center" }}>
        {/* Crown / crest */}
        {config.showBadge && (
          <div style={{ marginBottom: 8 }}>
            <svg width="40" height="28" viewBox="0 0 40 28" style={{ display: "inline-block" }}>
              <path d="M4,24 L8,6 L16,14 L20,2 L24,14 L32,6 L36,24 Z" fill={s(config.accentColor)} opacity="0.3" />
              <rect x="4" y="22" width="32" height="4" rx="2" fill={s(config.accentColor)} opacity="0.3" />
            </svg>
          </div>
        )}

        {config.schoolLogo && (
          <img src={config.schoolLogo} alt="Logo" style={{ height: 52, marginBottom: 8 }} />
        )}

        {config.schoolName && (
          <h1
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: s(config.primaryColor),
              marginBottom: 2,
            }}
          >
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 10, color: s(config.textColor) + "88", fontStyle: "italic", marginBottom: 16 }}>{config.schoolMotto}</p>
        )}

        <div style={{ width: 60, height: 2, background: s(config.primaryColor) + "44", margin: "0 auto 16px" }} />

        <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: s(config.primaryColor) + "aa", marginBottom: 4 }}>
          By Royal Decree
        </p>

        <p style={{ fontSize: 13, color: s(config.textColor) + "99", marginBottom: 8, fontStyle: "italic" }}>
          Let it be known that
        </p>

        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: s(config.primaryColor),
            marginBottom: 6,
            letterSpacing: 2,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div style={{ width: 100, height: 2, background: s(config.accentColor) + "55", margin: "0 auto 12px" }} />

        <p style={{ fontSize: 13, color: s(config.textColor) + "aa", marginBottom: 2 }}>
          Hath been conferred the honour of
        </p>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: s(config.accentColor),
            marginBottom: 10,
          }}
        >
          {config.awardName || "Royal Honour Award"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 12, color: s(config.textColor) + "88", marginBottom: 8, maxWidth: 460, margin: "0 auto 8px", lineHeight: 1.5, fontStyle: "italic" }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 11, color: s(config.textColor) + "77", marginBottom: 20 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div
          style={{
            width: 160,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}66, transparent)`,
            margin: "0 auto 20px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 24px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.primaryColor) + "cc" }}>{config.signatureName || "Signature"}</p>
            {config.signatureImage && <img src={config.signatureImage} alt="Signature" style={{ height: 28 }} />}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.primaryColor) + "cc" }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.issuerTitle || "Grand Chancellor"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.primaryColor) + "cc" }}>{config.date || "Date"}</p>
          </div>
        </div>

        <p style={{ fontSize: 9, color: s(config.textColor) + "55", marginTop: 16, letterSpacing: 2 }}>{config.certificateId}</p>
      </div>
    </div>
  )
}
