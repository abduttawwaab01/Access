"use client"

interface LetterData {
  studentName: string
  studentId: string
  studentClass: string
  reference: string
  createdAt: string
  schoolName: string
  schoolMotto: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  schoolLogo: string
}

export function TransferLetterTemplate({ data }: { data: LetterData }) {
  const {
    studentName, studentId, studentClass,
    reference, createdAt,
    schoolName, schoolMotto, schoolAddress,
    schoolPhone, schoolEmail, schoolLogo,
  } = data

  const date = new Date(createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="bg-white text-black" style={{ width: 794, minHeight: 500, padding: 40, fontFamily: "system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg, #2563eb, #1d4ed8)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingTop: 8 }}>
        {schoolLogo && (
          <img src={schoolLogo} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#1e3a5f" }}>{schoolName}</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0" }}>{schoolMotto}</p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{schoolAddress}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{schoolPhone}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{schoolEmail}</p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", marginBottom: 24 }} />

      <div style={{ textAlign: "right", marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>{date}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Ref: {reference}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: "#334155", margin: "0 0 4px", fontWeight: 500 }}>The Principal</p>
        <p style={{ fontSize: 13, color: "#334155", margin: 0, fontWeight: 500 }}>{studentName}</p>
        <p style={{ fontSize: 13, color: "#334155", margin: "4px 0 0" }}>Dear Sir/Ma&apos;am,</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Letter of Transfer / Withdrawal</h3>
      </div>

      <div style={{ lineHeight: 2, fontSize: 13, color: "#334155" }}>
        <p>This is to certify that <strong>{studentName}</strong> (Student ID: {studentId}) was a student of <strong>{schoolName}</strong> in <strong>{studentClass}</strong>.</p>
        <p>During their time at our institution, {studentName.split(" ")[0]} demonstrated commendable character and academic diligence. We have no record of any disciplinary issues or outstanding financial obligations.</p>
        <p>We wish {studentName.split(" ")[0]} the very best in their future academic endeavours and trust that they will continue to uphold the values and standards instilled during their time at {schoolName}.</p>
        <p>This transfer letter is issued upon the request of the parent/guardian for the purpose of transferring to another educational institution.</p>
      </div>

      <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>Yours faithfully,</p>
          <div style={{ marginTop: 40, borderTop: "1px solid #cbd5e1", paddingTop: 8, width: 240 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f", margin: 0 }}>Principal</p>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{schoolName}</p>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginTop: 32, marginBottom: 12 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>This is a computer-generated document. It is valid without a physical signature.</p>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{schoolName} — {schoolPhone} | {schoolEmail}</p>
      </div>
    </div>
  )
}
