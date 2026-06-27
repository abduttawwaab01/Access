"use client"

import type { CertificateConfig } from "@/types"

export function PremiumDark({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#d4af37"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: config.theme === "dark" ? "#0d0d1a" : s(config.backgroundColor),
        color: config.theme === "dark" ? "#f0e6d3" : s(config.textColor),
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.theme === "dark" ? "#1a1a3e" : s(config.backgroundColor) + "33"} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Border frame */}
      <div
        style={{
          position: "absolute",
          inset: 14,
          border: `1px solid ${s(config.borderColor)}55`,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 18,
          border: `2px solid ${s(config.borderColor)}22`,
          borderRadius: 1,
        }}
      />

      {/* Corner diamonds */}
      {[
        { top: 18, left: 18 },
        { top: 18, right: 18 },
        { bottom: 18, left: 18 },
        { bottom: 18, right: 18 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            border: `1px solid ${s(config.borderColor)}66`,
            transform: "rotate(45deg)",
            ...pos,
          }}
        />
      ))}

      <div style={{ position: "relative", zIndex: 1, padding: "36px 48px", textAlign: "center" }}>
        {/* Watermark */}
        {config.showWatermark && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.03,
              fontSize: 90,
              fontWeight: 700,
              color: s(config.borderColor),
              transform: "rotate(-15deg)",
              pointerEvents: "none",
            }}
          >
            {config.schoolName || "EXCELLENCE"}
          </div>
        )}

        {config.schoolLogo && (
          <div style={{ marginBottom: 16 }}>
            <img src={config.schoolLogo} alt="Logo" style={{ height: 60, width: "auto", objectFit: "contain", filter: "brightness(1.2)" }} />
          </div>
        )}

        {config.schoolName && (
          <h1
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: s(config.primaryColor),
              marginBottom: 4,
            }}
          >
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 11, fontStyle: "italic", color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "77", marginBottom: 20 }}>
            {config.schoolMotto}
          </p>
        )}

        <div
          style={{
            width: 200,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}, transparent)`,
            margin: "0 auto 20px",
          }}
        />

        <p style={{ fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: s(config.primaryColor) + "cc", marginBottom: 4 }}>
          This Certificate is Awarded to
        </p>

        <h2
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: s(config.primaryColor),
            marginBottom: 8,
            letterSpacing: 2,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div
          style={{
            width: 60,
            height: 2,
            background: s(config.primaryColor),
            margin: "0 auto 16px",
          }}
        />

        <p style={{ fontSize: 13, color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "aa", marginBottom: 4 }}>
          For outstanding achievement in
        </p>

        <h3
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: s(config.accentColor),
            marginBottom: 12,
            fontStyle: "italic",
          }}
        >
          {config.awardName || "Excellence Award"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 12, color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "88", marginBottom: 8, maxWidth: 480, margin: "0 auto 8px", lineHeight: 1.5 }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 12, color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "77", marginBottom: 20 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div
          style={{
            width: 200,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}, transparent)`,
            margin: "0 auto 20px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 20px" }}>
          <div style={{ textAlign: "center" }}>
            {config.signatureImage && (
              <img src={config.signatureImage} alt="Signature" style={{ height: 36, marginBottom: 4, filter: "brightness(1.3)" }} />
            )}
            <div style={{ width: 130, height: 1, background: s(config.primaryColor) + "55", marginBottom: 4 }} />
            <p style={{ fontSize: 11, color: s(config.primaryColor) + "bb" }}>{config.signatureName || "Signature"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 130, height: 1, background: s(config.primaryColor) + "55", marginBottom: 4 }} />
            <p style={{ fontSize: 11, color: s(config.primaryColor) + "bb" }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 10, color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "66" }}>{config.issuerTitle || "Principal"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 130, height: 1, background: s(config.primaryColor) + "55", marginBottom: 4 }} />
            <p style={{ fontSize: 11, color: s(config.primaryColor) + "bb" }}>{config.date || "N/A"}</p>
            <p style={{ fontSize: 10, color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "66" }}>Date</p>
          </div>
        </div>

        <p style={{ fontSize: 9, color: (config.theme === "dark" ? "#f0e6d3" : s(config.textColor)) + "44", marginTop: 16 }}>
          ID: {config.certificateId}
        </p>
      </div>
    </div>
  )
}
