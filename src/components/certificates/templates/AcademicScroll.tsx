"use client"

import type { CertificateConfig } from "@/types"

export function AcademicScroll({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#8b4513"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: s(config.backgroundColor),
        color: s(config.textColor),
        fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Palatino', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Parchment texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(139,90,43,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,90,43,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Scroll top/bottom rolls */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 8,
          height: 10,
          borderRadius: 5,
          background: `linear-gradient(180deg, ${s(config.primaryColor)}cc, ${s(config.primaryColor)}44)`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 8,
          height: 10,
          borderRadius: 5,
          background: `linear-gradient(0deg, ${s(config.primaryColor)}cc, ${s(config.primaryColor)}44)`,
          boxShadow: "0 -2px 6px rgba(0,0,0,0.15)",
        }}
      />

      {/* Ornate side borders */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 30,
          bottom: 30,
          width: 2,
          background: `linear-gradient(180deg, transparent, ${s(config.borderColor)}55, ${s(config.borderColor)}88, ${s(config.borderColor)}55, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 24,
          top: 30,
          bottom: 30,
          width: 2,
          background: `linear-gradient(180deg, transparent, ${s(config.borderColor)}55, ${s(config.borderColor)}88, ${s(config.borderColor)}55, transparent)`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "36px 48px", textAlign: "center" }}>
        {/* Decorative top line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ width: 60, height: 1, background: s(config.borderColor) }} />
          <span style={{ fontSize: 18, color: s(config.borderColor) }}>&#9758;</span>
          <span style={{ width: 60, height: 1, background: s(config.borderColor) }} />
        </div>

        {config.schoolLogo && (
          <img src={config.schoolLogo} alt="Logo" style={{ height: 56, marginBottom: 8 }} />
        )}

        {config.schoolName && (
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: s(config.primaryColor),
              marginBottom: 4,
            }}
          >
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 11, fontStyle: "italic", color: s(config.textColor) + "88", marginBottom: 20 }}>
            &ldquo;{config.schoolMotto}&rdquo;
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ width: 40, height: 1, background: s(config.borderColor) }} />
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: s(config.textColor) + "88" }}>Be it known that</span>
          <span style={{ width: 40, height: 1, background: s(config.borderColor) }} />
        </div>

        <h2
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: s(config.primaryColor),
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <p style={{ fontSize: 13, color: s(config.textColor) + "aa", marginBottom: 4, fontStyle: "italic" }}>
          hath been conferred the award of
        </p>

        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: s(config.accentColor),
            marginBottom: 12,
          }}
        >
          {config.awardName || "Academic Excellence"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 12, color: s(config.textColor) + "99", marginBottom: 8, maxWidth: 460, margin: "0 auto 8px", lineHeight: 1.6, fontStyle: "italic" }}>
            &ldquo;{config.reason}&rdquo;
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 12, color: s(config.textColor) + "77", marginBottom: 16 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div style={{ width: 100, height: 1, background: s(config.borderColor), margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", padding: "0 20px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 130, height: 1, background: s(config.borderColor), marginBottom: 4 }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.signatureName || "Signature"}</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>Signed</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 130, height: 1, background: s(config.borderColor), marginBottom: 4 }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.issuerTitle || "Principal"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 130, height: 1, background: s(config.borderColor), marginBottom: 4 }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>Given this</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.date || "N/A"}</p>
          </div>
        </div>

        {/* Seal/stamp */}
        {config.showBadge && (
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 40,
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `3px double ${s(config.primaryColor)}88`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: s(config.backgroundColor),
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}
          >
            <span style={{ fontSize: 22, color: s(config.primaryColor) }}>&#9872;</span>
          </div>
        )}

        <p style={{ fontSize: 8, color: s(config.textColor) + "55", marginTop: 16 }}>
          {config.certificateId}
        </p>
      </div>
    </div>
  )
}
