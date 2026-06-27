"use client"

import type { CertificateConfig } from "@/types"

export function ClassicGold({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#b8860b"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: s(config.backgroundColor),
        color: s(config.textColor),
        fontFamily: "'Times New Roman', 'Georgia', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Outer ornate border */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          border: `3px solid ${s(config.borderColor)}`,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 16,
          border: `1px solid ${s(config.borderColor)}80`,
          borderRadius: 2,
        }}
      />

      {/* Corner decorations */}
      {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            [pos.includes("left") ? "left" : "right"]: 14,
            [pos.includes("top") ? "top" : "bottom"]: 14,
            borderLeft: pos.includes("left") ? `3px solid ${s(config.borderColor)}` : "none",
            borderRight: pos.includes("right") ? `3px solid ${s(config.borderColor)}` : "none",
            borderTop: pos.includes("top") ? `3px solid ${s(config.borderColor)}` : "none",
            borderBottom: pos.includes("bottom") ? `3px solid ${s(config.borderColor)}` : "none",
          }}
        />
      ))}

      <div style={{ position: "relative", zIndex: 1, padding: "40px 48px", textAlign: "center" }}>
        {/* Watermark */}
        {config.showWatermark && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.04,
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: 8,
              color: s(config.borderColor),
              transform: "rotate(-30deg)",
              pointerEvents: "none",
            }}
          >
            {config.schoolName || "AWARD"}
          </div>
        )}

        {/* School Logo */}
        {config.schoolLogo && (
          <div style={{ marginBottom: 12 }}>
            <img
              src={config.schoolLogo}
              alt="School Logo"
              style={{ height: 64, width: "auto", objectFit: "contain" }}
            />
          </div>
        )}

        {config.schoolName && (
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: s(config.accentColor),
              marginBottom: 4,
            }}
          >
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 12, fontStyle: "italic", color: s(config.textColor) + "99", marginBottom: 16 }}>
            {config.schoolMotto}
          </p>
        )}

        <div style={{ width: 120, height: 1, background: s(config.borderColor), margin: "0 auto 20px" }} />

        <p style={{ fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: s(config.accentColor), marginBottom: 8 }}>
          This Certificate is Proudly Presented To
        </p>

        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: s(config.primaryColor),
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div style={{ width: 200, height: 2, background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}, transparent)`, margin: "0 auto 16px" }} />

        <p style={{ fontSize: 14, color: s(config.textColor) + "cc", marginBottom: 4, lineHeight: 1.6 }}>
          For achieving the award of
        </p>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: s(config.accentColor),
            marginBottom: 12,
          }}
        >
          {config.awardName || "Certificate of Achievement"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 13, color: s(config.textColor) + "bb", marginBottom: 12, maxWidth: 500, margin: "0 auto 12px", lineHeight: 1.5 }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 13, color: s(config.textColor) + "99", marginBottom: 16 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div style={{ width: 80, height: 1, background: s(config.borderColor), margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24, padding: "0 20px" }}>
          <div style={{ textAlign: "center" }}>
            {config.signatureImage ? (
              <img src={config.signatureImage} alt="Signature" style={{ height: 40, marginBottom: 4 }} />
            ) : (
              <div style={{ height: 40, marginBottom: 4 }} />
            )}
            <div style={{ width: 140, height: 1, background: s(config.borderColor), margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.signatureName || "Signature"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.issuerName || "Issuer"}</p>
            <div style={{ width: 140, height: 1, background: s(config.borderColor), margin: "4px auto" }} />
            <p style={{ fontSize: 10, color: s(config.textColor) + "88" }}>{config.issuerTitle || "Principal"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, color: s(config.textColor) }}>Date</p>
            <div style={{ width: 140, height: 1, background: s(config.borderColor), margin: "4px auto" }} />
            <p style={{ fontSize: 10, color: s(config.textColor) + "88" }}>{config.date || "N/A"}</p>
          </div>
        </div>

        <p style={{ fontSize: 9, color: s(config.textColor) + "66", marginTop: 20 }}>
          Certificate ID: {config.certificateId}
        </p>

        {/* Badge */}
        {config.showBadge && (
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 40,
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${s(config.primaryColor)}, ${s(config.accentColor)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>&#9733;</span>
          </div>
        )}
      </div>
    </div>
  )
}
