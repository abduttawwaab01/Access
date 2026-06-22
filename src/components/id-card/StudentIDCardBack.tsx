"use client"

import { QRCodeSVG } from "qrcode.react"

interface StudentData { id?: string; firstName: string; lastName: string; studentId: string; address?: string; phone?: string; email?: string; bloodGroup?: string; medicalNotes?: string; dateOfBirth?: string; gender?: string; parentName?: string; parentPhone?: string }
interface SchoolData { name: string; phone?: string; email?: string; address?: string }
interface IdCardConfig { backTitle?: string; showAddress?: boolean; showBloodGroup?: boolean; showEmergencyContact?: boolean; showMedicalNotes?: boolean; showRules?: boolean; rulesText?: string; customAddress?: string; customBloodGroup?: string; customEmergencyContact?: string; customMedicalNotes?: string; customFields?: { label: string; value: string }[] }
interface Props { student: StudentData; school: SchoolData; config?: IdCardConfig }

export function StudentIDCardBack({ student, school, config }: Props) {
  const cfg = config || { backTitle: "Student Information", showAddress: true, showBloodGroup: true, showEmergencyContact: true, showMedicalNotes: true, showRules: true, rulesText: "1. This card is the property of the school and must be returned upon request.\n2. Report lost or damaged cards immediately to the school office.\n3. This card is non-transferable and for official school use only.\n4. Students must present this card for identification and attendance purposes.\n5. Unauthorized modification of this card is prohibited.", customFields: [] }
  const qrData = JSON.stringify({ type: "student", id: student.id, code: student.studentId })

  return (
    <div className="w-[340px] rounded-2xl overflow-hidden shadow-xl border border-border/40 bg-white flex flex-col min-h-[480px]">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3.5 text-white text-center">
        <p className="text-sm font-bold tracking-wide">{cfg.backTitle || "Student Information"}</p>
      </div>
      <div className="flex-1 p-5 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <InfoRow label="Full Name" value={`${student.firstName} ${student.lastName}`} />
          <InfoRow label="Student ID" value={student.studentId} />
          {student.dateOfBirth && <InfoRow label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />}
          {student.gender && <InfoRow label="Gender" value={student.gender} />}
          {cfg.showBloodGroup && (cfg.customBloodGroup || student.bloodGroup) && <InfoRow label="Blood Group" value={cfg.customBloodGroup || student.bloodGroup || ""} />}
          {cfg.showAddress && (cfg.customAddress || student.address) && <InfoRow label="Address" value={cfg.customAddress || student.address || ""} />}
          {student.email && <InfoRow label="Email" value={student.email} />}
          {student.phone && <InfoRow label="Phone" value={student.phone} />}
          {student.parentName && <InfoRow label="Parent/Guardian" value={student.parentName} />}
          {cfg.showEmergencyContact && (cfg.customEmergencyContact || student.parentPhone) && <InfoRow label="Emergency" value={cfg.customEmergencyContact || student.parentPhone || ""} />}
          {(cfg.customFields || []).filter((f) => f.value).map((f, i) => <InfoRow key={i} label={f.label} value={f.value} />)}
        </div>
        {cfg.showMedicalNotes && (cfg.customMedicalNotes || student.medicalNotes) && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 mt-2">
            <p className="text-[10px] font-semibold text-red-700 mb-0.5">Medical Notes</p>
            <p className="text-xs text-red-600">{cfg.customMedicalNotes || student.medicalNotes}</p>
          </div>
        )}
      </div>
      {cfg.showRules && cfg.rulesText && (
        <div className="px-5 py-2 border-t border-gray-100 bg-amber-50/50">
          <p className="text-[8px] font-semibold text-amber-800 uppercase tracking-wider mb-1">Rules & Regulations</p>
          <pre className="text-[7px] text-amber-700 leading-tight whitespace-pre-wrap font-sans">{cfg.rulesText}</pre>
        </div>
      )}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="bg-white rounded-lg p-1 border border-gray-200 inline-block">
            <QRCodeSVG value={qrData} size={40} level="M" />
          </div>
          <p className="text-[8px] text-gray-400 mt-1">Scan QR</p>
        </div>
        <div className="text-[10px] text-gray-500 text-center leading-tight">
          <p className="font-semibold text-gray-700">{school.name}</p>
          {school.phone && <p>{school.phone}</p>}
          {school.email && <p className="text-[9px]">{school.email}</p>}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xs text-gray-700 truncate font-medium">{value}</p>
    </div>
  )
}
