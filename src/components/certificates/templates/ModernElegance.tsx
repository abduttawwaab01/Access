"use client"

import type { CertificateConfig } from "@/types"

export function ModernElegance({ config }: { config: CertificateConfig }) {
  const s = (v: string) => v || "#6366f1"

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
      {/* Bold left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 12,
          background: `linear-gradient(180deg, ${s(config.primaryColor)}, ${s(config.secondaryColor)})`,
        }}
      />

      {/* Top thin accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${s(config.primaryColor)}, ${s(config.secondaryColor)}, ${s(config.accentColor)})`,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "40px 48px 40px 60px" }}>
        {/* Floating geometric accent */}
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: s(config.secondaryColor) + "15",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: s(config.primaryColor) + "10",
            pointerEvents: "none",
          }}
        />

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
              fontSize: 100,
              fontWeight: 900,
              color: s(config.primaryColor),
              transform: "rotate(-20deg)",
              pointerEvents: "none",
            }}
          >
            {config.schoolName || "CERTIFICATE"}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          {config.schoolLogo && (
            <img src={config.schoolLogo} alt="Logo" style={{ height: 56, width: "auto", objectFit: "contain" }} />
          )}
          <div>
            {config.schoolName && (
              <h1 style={{ fontSize: 18, fontWeight: 300, letterSpacing: 6, textTransform: "uppercase", color: s(config.textColor) + "bb" }}>
                {config.schoolName}
              </h1>
            )}
            {config.schoolMotto && (
              <p style={{ fontSize: 11, fontStyle: "italic", color: s(config.textColor) + "77" }}>{config.schoolMotto}</p>
            )}
          </div>
        </div>

        <div style={{ width: 80, height: 3, background: s(config.primaryColor), marginBottom: 24 }} />

        <p style={{ fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: s(config.textColor) + "88", marginBottom: 8 }}>
          Certificate of Achievement
        </p>

        <p style={{ fontSize: 13, color: s(config.textColor) + "99", marginBottom: 16 }}>
          This certificate is proudly awarded to
        </p>

        <h2
          style={{
            fontSize: 40,
            fontWeight: 200,
            color: s(config.primaryColor),
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          {config.recipientName || "Recipient Name"}
        </h2>

        <div style={{ width: 120, height: 1, background: s(config.secondaryColor), margin: "0 0 16px" }} />

        <p style={{ fontSize: 14, color: s(config.textColor) + "bb", marginBottom: 4 }}>
          For achieving the award of
        </p>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: s(config.accentColor),
            marginBottom: 12,
          }}
        >
          {config.awardName || "Excellence Award"}
        </h3>

        {config.reason && (
          <p style={{ fontSize: 13, color: s(config.textColor) + "99", marginBottom: 8, maxWidth: 500, lineHeight: 1.6 }}>
            {config.reason}
          </p>
        )}

        {config.classOrDepartment && (
          <p style={{ fontSize: 12, color: s(config.textColor) + "77", marginBottom: 20 }}>
            {config.recipientType === "student" ? "Class" : "Department"}: {config.classOrDepartment}
          </p>
        )}

        <div style={{ display: "flex", gap: 48, marginTop: 20 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) + "bb" }}>{config.issuerName || "Issuer"}</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.issuerTitle || "Principal"}</p>
            {config.signatureImage && (
              <img src={config.signatureImage} alt="Signature" style={{ height: 32, marginTop: 4 }} />
            )}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: s(config.textColor) + "bb" }}>Date</p>
            <p style={{ fontSize: 10, color: s(config.textColor) + "77" }}>{config.date || "N/A"}</p>
          </div>
        </div>

        <p style={{ fontSize: 9, color: s(config.textColor) + "55", marginTop: 20 }}>
          {config.certificateId}
        </p>
      </div>
    </div>
  )
}
