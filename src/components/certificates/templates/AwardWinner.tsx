"use client"

import type { CertificateConfig } from "@/types"

export function AwardWinner({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#ff6b35"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: s(config.backgroundColor),
        color: s(config.textColor),
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Starry background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${10 + Math.random() * 80}%`,
              top: `${5 + Math.random() * 90}%`,
              fontSize: 8 + Math.random() * 12,
              color: s(config.accentColor) + "22",
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            &#9733;
          </div>
        ))}
      </div>

      {/* Colorful top ribbon */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${s(config.primaryColor)}, ${s(config.secondaryColor)}, ${s(config.accentColor)}, ${s(config.primaryColor)})`,
        }}
      />

      {/* Ribbon banner bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${s(config.accentColor)}, ${s(config.secondaryColor)}, ${s(config.primaryColor)}, ${s(config.accentColor)})`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "36px 48px", textAlign: "center" }}>
        {/* Top star */}
        <div
          style={{
            width: 48,
            height: 48,
            margin: "0 auto 12px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${s(config.accentColor)}, ${s(config.primaryColor)})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${s(config.accentColor)}44`,
          }}
        >
          <span style={{ color: "#fff", fontSize: 24 }}>&#9733;</span>
        </div>

        {config.schoolLogo && (
          <img src={config.schoolLogo} alt="Logo" style={{ height: 52, marginBottom: 8 }} />
        )}

        {config.schoolName && (
          <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: s(config.primaryColor), marginBottom: 2 }}>
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 10, color: s(config.textColor) + "88", marginBottom: 16 }}>{config.schoolMotto}</p>
        )}

        {/* Ribbon title */}
        <div style={{ display: "inline-block", background: s(config.primaryColor) + "15", padding: "4px 24px", borderRadius: 20, marginBottom: 12 }}>
          <p style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: s(config.primaryColor), fontWeight: 600 }}>
            Award of Excellence
          </p>
        </div>

        <p style={{ fontSize: 13, color: s(config.textColor) + "99", marginBottom: 8 }}>
          This award is proudly presented to
        </p>

        <h2
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: s(config.accentColor),
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div style={{ width: 80, height: 3, background: `linear-gradient(90deg, transparent, ${s(config.accentColor)}, transparent)`, margin: "0 auto 12px" }} />

        <p style={{ fontSize: 13, color: s(config.textColor) + "aa", marginBottom: 2 }}>
          For achieving the award of
        </p>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: s(config.primaryColor),
            marginBottom: 8,
          }}
        >
          {config.awardName || "Star Achievement Award"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 12, color: s(config.textColor) + "88", marginBottom: 8, maxWidth: 460, margin: "0 auto 8px", lineHeight: 1.5 }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 11, color: s(config.textColor) + "77", marginBottom: 16 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 20px", marginTop: 12 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.signatureName || "Signature"}</p>
            {config.signatureImage && <img src={config.signatureImage} alt="Signature" style={{ height: 32 }} />}
            <div style={{ width: 120, height: 1, background: s(config.textColor) + "44", margin: "2px auto" }} />
            <p style={{ fontSize: 9, color: s(config.textColor) + "77" }}>Signature</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.issuerTitle || "Principal"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.date || "Date"}</p>
            <div style={{ width: 120, height: 1, background: s(config.textColor) + "44", margin: "2px auto" }} />
            <p style={{ fontSize: 9, color: s(config.textColor) + "77" }}>Date</p>
          </div>
        </div>

        <p style={{ fontSize: 9, color: s(config.textColor) + "55", marginTop: 16 }}>{config.certificateId}</p>
      </div>
    </div>
  )
}
