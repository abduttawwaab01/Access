import { QRCodeSVG } from "qrcode.react"

interface StudentData {
  id?: string
  firstName: string
  lastName: string
  studentId: string
  className?: string
  classId?: string
  address?: string
  phone?: string
  email?: string
  bloodGroup?: string
  medicalNotes?: string
  dateOfBirth?: string
  gender?: string
  parentName?: string
  parentPhone?: string
}

interface SchoolData {
  name: string
  phone?: string
  email?: string
  address?: string
}

interface IdCardConfig {
  backTitle?: string
  showAddress?: boolean
  showBloodGroup?: boolean
  showEmergencyContact?: boolean
  showMedicalNotes?: boolean
  customAddress?: string
  customBloodGroup?: string
  customEmergencyContact?: string
  customMedicalNotes?: string
  customFields?: { label: string; value: string }[]
}

interface StudentIDCardBackProps {
  student: StudentData
  school: SchoolData
  config?: IdCardConfig
}

export function StudentIDCardBack({ student, school, config }: StudentIDCardBackProps) {
  const cfg = config || { backTitle: "Student Information", showAddress: true, showBloodGroup: true, showEmergencyContact: true, showMedicalNotes: true, customFields: [] }
  const qrData = JSON.stringify({ type: "student", id: student.id, code: student.studentId })

  return (
    <div className="w-[340px] rounded-2xl overflow-hidden shadow-xl border border-border/40 bg-white">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white text-center">
        <p className="text-sm font-bold">{cfg.backTitle || "Student Information"}</p>
      </div>

      <div className="p-5 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoRow label="Full Name" value={`${student.firstName} ${student.lastName}`} />
          <InfoRow label="Student ID" value={student.studentId} />
          {student.dateOfBirth && <InfoRow label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />}
          {student.gender && <InfoRow label="Gender" value={student.gender} />}
          {cfg.showBloodGroup && (cfg.customBloodGroup || student.bloodGroup) && <InfoRow label="Blood Group" value={cfg.customBloodGroup || student.bloodGroup || ""} />}
          {cfg.showAddress && (cfg.customAddress || student.address) && <InfoRow label="Address" value={cfg.customAddress || student.address || ""} />}
          {student.email && <InfoRow label="Email" value={student.email} />}
          {student.phone && <InfoRow label="Phone" value={student.phone} />}
          {student.parentName && <InfoRow label="Parent/Guardian" value={student.parentName} />}
          {cfg.showEmergencyContact && (cfg.customEmergencyContact || student.parentPhone) && <InfoRow label="Emergency Contact" value={cfg.customEmergencyContact || student.parentPhone || ""} />}
          {(cfg.customFields || []).map((f, i) => (
            f.value ? <InfoRow key={i} label={f.label} value={f.value} /> : null
          ))}
        </div>

        {cfg.showMedicalNotes && (cfg.customMedicalNotes || student.medicalNotes) && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3">
            <p className="text-[10px] font-semibold text-red-700 mb-0.5">Medical Notes</p>
            <p className="text-xs text-red-600">{cfg.customMedicalNotes || student.medicalNotes}</p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <div className="text-center">
              <QRCodeSVG value={qrData} size={40} level="M" />
              <p className="mt-1">Student QR</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">{school.name}</p>
              {school.phone && <p>{school.phone}</p>}
              {school.email && <p>{school.email}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
      <p className="text-xs text-gray-700 truncate">{value}</p>
    </div>
  )
}
