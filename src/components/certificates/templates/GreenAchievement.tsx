"use client"

import type { CertificateConfig } from "@/types"

export function GreenAchievement({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#2d6a4f"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: s(config.backgroundColor),
        color: s(config.textColor),
        fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Leaf corner decorations */}
      {[
        { t: 0, l: 0, r: undefined, b: undefined, rot: 0 },
        { t: 0, l: undefined, r: 0, b: undefined, rot: 90 },
        { t: undefined, l: 0, r: undefined, b: 0, rot: -90 },
        { t: undefined, l: undefined, r: 0, b: 0, rot: 180 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            overflow: "hidden",
            top: pos.t,
            left: pos.l,
            right: pos.r,
            bottom: pos.b,
            transform: `rotate(${pos.rot}deg)`,
          }}
        >
          <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
            <path d="M0,0 Q40,20 80,0 Q60,40 80,80 Q40,60 0,80 Q20,40 0,0 Z" fill={s(config.primaryColor) + "18"} />
          </svg>
        </div>
      ))}

      {/* Vine border left */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 40,
          bottom: 40,
          width: 2,
          background: `repeating-linear-gradient(180deg, ${s(config.primaryColor)}22 0px, ${s(config.primaryColor)}22 8px, transparent 8px, transparent 16px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 16,
          top: 40,
          bottom: 40,
          width: 2,
          background: `repeating-linear-gradient(180deg, ${s(config.primaryColor)}22 0px, ${s(config.primaryColor)}22 8px, transparent 8px, transparent 16px)`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "36px 48px", textAlign: "center" }}>
        {/* Top leaf accent */}
        <div style={{ marginBottom: 12 }}>
          <svg width="32" height="20" viewBox="0 0 32 20" style={{ display: "inline-block" }}>
            <path d="M0,10 Q16,0 32,10 Q16,20 0,10 Z" fill={s(config.primaryColor)} />
          </svg>
        </div>

        {config.schoolLogo && (
          <img src={config.schoolLogo} alt="Logo" style={{ height: 52, marginBottom: 8 }} />
        )}

        {config.schoolName && (
          <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: s(config.primaryColor), marginBottom: 2 }}>
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 11, color: s(config.textColor) + "88", fontStyle: "italic", marginBottom: 16 }}>
            &ldquo;{config.schoolMotto}&rdquo;
          </p>
        )}

        <div
          style={{
            width: 120,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}55, transparent)`,
            margin: "0 auto 16px",
          }}
        />

        <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: s(config.primaryColor) + "99", marginBottom: 4 }}>
          This Certificate is Awarded to
        </p>

        <h2
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: s(config.primaryColor),
            marginBottom: 6,
            letterSpacing: 1,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div style={{ width: 50, height: 3, background: s(config.primaryColor) + "44", margin: "0 auto 12px" }} />

        <p style={{ fontSize: 13, color: s(config.textColor) + "aa", marginBottom: 4 }}>
          For outstanding achievement in
        </p>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: s(config.accentColor),
            marginBottom: 10,
          }}
        >
          {config.awardName || "Green Achievement Award"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 12, color: s(config.textColor) + "88", marginBottom: 8, maxWidth: 480, margin: "0 auto 8px", lineHeight: 1.5 }}>
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
            width: 120,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}55, transparent)`,
            margin: "0 auto 16px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 20px" }}>
          <div style={{ textAlign: "center" }}>
            {config.signatureImage && (
              <img src={config.signatureImage} alt="Signature" style={{ height: 32 }} />
            )}
            <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "4px auto" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.signatureName || "Signature"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "4px auto" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.issuerTitle || "Principal"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "4px auto" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.date || "Date"}</p>
          </div>
        </div>

        <p style={{ fontSize: 9, color: s(config.textColor) + "55", marginTop: 16 }}>{config.certificateId}</p>
      </div>
    </div>
  )
}
