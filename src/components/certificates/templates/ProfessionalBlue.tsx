"use client"

import type { CertificateConfig } from "@/types"

export function ProfessionalBlue({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#1e40af"

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
      {/* Header bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(135deg, ${s(config.primaryColor)}, ${s(config.primaryColor)}dd)`,
        }}
      />

      {/* Header wave */}
      <svg
        style={{ position: "absolute", top: 72, left: 0, right: 0, width: "100%", height: 16 }}
        viewBox="0 0 800 16"
        preserveAspectRatio="none"
      >
        <path d="M0,0 Q200,16 400,8 Q600,0 800,12 L800,0 L0,0 Z" fill={s(config.primaryColor)} />
      </svg>

      {/* Left sidebar accent */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: s(config.secondaryColor),
        }}
      />

      {/* Footer bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: s(config.primaryColor) + "cc",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "24px 48px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          {config.schoolLogo && (
            <img src={config.schoolLogo} alt="Logo" style={{ height: 48, width: "auto", objectFit: "contain" }} />
          )}
          <div>
            {config.schoolName && (
              <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#ffffff" }}>
                {config.schoolName}
              </h1>
            )}
            {config.schoolMotto && (
              <p style={{ fontSize: 10, color: "#ffffffaa", fontStyle: "italic" }}>{config.schoolMotto}</p>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <p style={{ fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: s(config.primaryColor) + "aa", marginBottom: 4 }}>
            Certificate of Achievement
          </p>

          <div style={{ width: 60, height: 3, background: s(config.secondaryColor), margin: "0 auto 12px" }} />

          <p style={{ fontSize: 13, color: s(config.textColor) + "99", marginBottom: 12 }}>
            This certificate is proudly awarded to
          </p>

          <h2
            style={{
              fontSize: 34,
              fontWeight: 300,
              color: s(config.primaryColor),
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            {config.recipientName || "Recipient Name"}
          </h2>

          <div style={{ width: 80, height: 1, background: s(config.secondaryColor) + "66", margin: "0 auto 12px" }} />

          <p style={{ fontSize: 13, color: s(config.textColor) + "bb", marginBottom: 4 }}>
            In recognition of achieving the award of
          </p>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: s(config.accentColor),
              marginBottom: 10,
            }}
          >
            {config.awardName || "Professional Excellence"}
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

          <div style={{ display: "flex", justifyContent: "space-around", padding: "0 40px", marginTop: 16 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.signatureName || "Signature"}</p>
              {config.signatureImage && <img src={config.signatureImage} alt="Signature" style={{ height: 28, marginTop: 4 }} />}
              <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "4px auto" }} />
              <p style={{ fontSize: 9, color: s(config.textColor) + "66" }}>Signature</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.issuerName || "Issuer"}</p>
              <p style={{ fontSize: 10, color: s(config.textColor) + "66" }}>{config.issuerTitle || "Director"}</p>
              <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "4px auto" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) }}>{config.date || "Date"}</p>
              <div style={{ width: 120, height: 1, background: s(config.primaryColor) + "44", margin: "4px auto 2px" }} />
              <p style={{ fontSize: 9, color: s(config.textColor) + "66" }}>Date</p>
            </div>
          </div>

          <p style={{ fontSize: 8, color: s(config.textColor) + "55", marginTop: 16 }}>{config.certificateId}</p>
        </div>
      </div>
    </div>
  )
}
