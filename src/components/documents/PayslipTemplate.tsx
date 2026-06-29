"use client"

import { useRef } from "react"

interface PayslipData {
  staffName: string
  staffId: string
  staffRole: string
  month: string
  year: string
  amount: number
  paidAt?: string
  schoolName: string
  schoolAddress?: string
  schoolLogo?: string
}

export function PayslipTemplate({ data }: { data: PayslipData }) {
  const {
    staffName, staffId, staffRole,
    month, year, amount, paidAt,
    schoolName, schoolAddress, schoolLogo,
  } = data

  const formatCurrency = (n: number) => `₦${n.toLocaleString()}`

  return (
    <div className="bg-white text-black" style={{ width: 794, minHeight: 500, padding: 40, fontFamily: "system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg, #2563eb, #1d4ed8)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingTop: 8 }}>
        {schoolLogo && (
          <img src={schoolLogo} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#1e3a5f" }}>{schoolName}</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{schoolAddress}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontWeight: 600 }}>PAYSLIP</p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #e2e8f0", marginBottom: 24 }} />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Salary Payment Advice</h2>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>For the period of {month} {year}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div style={{ flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 8px", color: "#64748b", width: 120, fontWeight: 500 }}>Employee Name</td>
                <td style={{ padding: "4px 8px", fontWeight: 600 }}>{staffName}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", color: "#64748b", width: 120, fontWeight: 500 }}>Staff ID</td>
                <td style={{ padding: "4px 8px" }}>{staffId}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", color: "#64748b", width: 120, fontWeight: 500 }}>Role</td>
                <td style={{ padding: "4px 8px" }}>{staffRole}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 8px", color: "#64748b", width: 120, fontWeight: 500 }}>Pay Period</td>
                <td style={{ padding: "4px 8px" }}>{month} {year}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", color: "#64748b", width: 120, fontWeight: 500 }}>Payment Date</td>
                <td style={{ padding: "4px 8px" }}>{paidAt ? new Date(paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f1f5f9", textAlign: "left", fontWeight: 600, color: "#334155", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</th>
            <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f1f5f9", textAlign: "right", fontWeight: 600, color: "#334155", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, width: 160 }}>Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px", color: "#334155" }}>Monthly Salary — {month} {year}</td>
            <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(amount)}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px", color: "#334155", fontSize: 12, fontStyle: "italic" }}>Deductions</td>
            <td style={{ border: "1px solid #e2e8f0", padding: "10px 12px", textAlign: "right", color: "#64748b", fontSize: 12 }}>—</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style={{ border: "1px solid #cbd5e1", padding: "10px 12px", background: "#f8fafc", fontWeight: 700, color: "#16a34a" }}>Net Pay</td>
            <td style={{ border: "1px solid #cbd5e1", padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#16a34a", fontSize: 16 }}>{formatCurrency(amount)}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 4px" }}>Payment Method</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Bank Transfer</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ marginTop: "auto", borderTop: "1px solid #cbd5e1", paddingTop: 8, width: 200 }}>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Authorised Signature</p>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginTop: 32, marginBottom: 12 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>This is a computer-generated payslip. It is valid without a physical signature.</p>
        <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{schoolName}</p>
      </div>
    </div>
  )
}
