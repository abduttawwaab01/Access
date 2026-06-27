"use client"

import type { CertificateConfig } from "@/types"

export function Aurora({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#6366f1"

  return (
    <div
      style={{
        width: 800,
        minHeight: 560,
        background: `linear-gradient(135deg, ${s(config.backgroundColor)}, ${s(config.secondaryColor)}22, ${s(config.backgroundColor)})`,
        color: s(config.textColor),
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora gradient blobs */}
      <div
        style={{
          position: "absolute",
          left: "-10%",
          top: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${s(config.primaryColor)}22 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-10%",
          bottom: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${s(config.secondaryColor)}22 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "40%",
          top: "30%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${s(config.accentColor)}18 0%, transparent 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Glassmorphism card */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          background: config.theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          borderRadius: 16,
          border: `1px solid ${s(config.borderColor)}22`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, padding: "40px 48px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {config.schoolLogo && (
          <img src={config.schoolLogo} alt="Logo" style={{ height: 48, marginBottom: 8, display: "inline-block" }} />
        )}

        {config.schoolName && (
          <h1 style={{ fontSize: 15, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: s(config.primaryColor) + "cc", marginBottom: 2 }}>
            {config.schoolName}
          </h1>
        )}

        {config.schoolMotto && (
          <p style={{ fontSize: 10, color: s(config.textColor) + "77", marginBottom: 16 }}>{config.schoolMotto}</p>
        )}

        <div
          style={{
            width: 80,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${s(config.primaryColor)}66, transparent)`,
            margin: "0 auto 20px",
          }}
        />

        <p style={{ fontSize: 10, letterSpacing: 6, textTransform: "uppercase", color: s(config.textColor) + "77", marginBottom: 4, fontWeight: 500 }}>
          Certificate of Achievement
        </p>

        <p style={{ fontSize: 12, color: s(config.textColor) + "99", marginBottom: 8 }}>
          This certificate is presented to
        </p>

        <h2
          style={{
            fontSize: 36,
            fontWeight: 300,
            color: s(config.primaryColor),
            marginBottom: 6,
            letterSpacing: 1,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div
          style={{
            width: 60,
            height: 2,
            background: `linear-gradient(90deg, ${s(config.primaryColor)}66, ${s(config.accentColor)}66)`,
            margin: "0 auto 12px",
          }}
        />

        <p style={{ fontSize: 12, color: s(config.textColor) + "aa", marginBottom: 2 }}>
          For excellence in
        </p>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: s(config.accentColor),
            marginBottom: 8,
          }}
        >
          {config.awardName || "Aurora Excellence Award"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 11, color: s(config.textColor) + "88", marginBottom: 6, maxWidth: 440, margin: "0 auto 6px", lineHeight: 1.5 }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 11, color: s(config.textColor) + "77", marginBottom: 16 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-around", padding: "0 40px", marginTop: 8 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: s(config.textColor) + "aa" }}>{config.signatureName || "Signature"}</p>
            {config.signatureImage && <img src={config.signatureImage} alt="Signature" style={{ height: 24, marginTop: 2 }} />}
            <div style={{ width: 100, height: 1, background: s(config.textColor) + "33", margin: "2px auto" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: s(config.textColor) + "aa" }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 9, color: s(config.textColor) + "66" }}>{config.issuerTitle || "Principal"}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: s(config.textColor) + "aa" }}>{config.date || "Date"}</p>
            <div style={{ width: 100, height: 1, background: s(config.textColor) + "33", margin: "2px auto" }} />
          </div>
        </div>

        <p style={{ fontSize: 8, color: s(config.textColor) + "44", marginTop: 12 }}>{config.certificateId}</p>
      </div>
    </div>
  )
}
