import { QRCodeSVG } from "qrcode.react"
import type { ReactNode } from "react"

interface StudentData {
  id?: string
  firstName: string
  lastName: string
  studentId: string
  className?: string
  classId?: string
  passportPhoto?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
}

interface SchoolData {
  name: string
  shortName?: string
  logo?: string
  address?: string
  phone?: string
  email?: string
}

interface StudentIDCardFrontProps {
  student: StudentData
  school: SchoolData
  classes?: { id: string; name: string }[]
  className?: string
  style?: Record<string, string>
}

export function StudentIDCardFront({ student, school, classes, className, style }: StudentIDCardFrontProps) {
  const studentClass = classes?.find((c) => c.id === student.classId)?.name || student.className || "N/A"
  const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase()
  const qrData = JSON.stringify({ type: "student", id: student.id, code: student.studentId })

  return (
    <div className={`w-[340px] rounded-2xl overflow-hidden shadow-xl border border-border/40 ${className || ""}`} style={style}>
      <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10">
          {school.logo ? (
            <img src={school.logo} alt="" className="h-12 w-12 mx-auto rounded-full border-2 border-white/30 object-cover mb-1" />
          ) : (
            <div className="h-12 w-12 mx-auto rounded-full bg-white/20 flex items-center justify-center text-lg font-bold mb-1">
              {school.shortName?.[0] || "S"}
            </div>
          )}
          <p className="text-sm font-bold tracking-tight">{school.name}</p>
          <p className="text-[10px] opacity-80 mt-0.5">STUDENT ID CARD</p>
        </div>
      </div>

      <div className="bg-white p-5 flex gap-4">
        <div className="shrink-0">
          {student.passportPhoto ? (
            <img src={student.passportPhoto} alt="" className="h-20 w-20 rounded-xl border-2 border-primary/20 object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-2 border-primary/20">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-gray-900 truncate">{student.firstName} {student.lastName}</p>
          <p className="text-xs text-gray-500">{studentClass}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="font-mono">ID: {student.studentId}</span>
          </div>
          {student.dateOfBirth && (
            <p className="text-[10px] text-gray-400">DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</p>
          )}
          {student.gender && <p className="text-[10px] text-gray-400">Gender: {student.gender}</p>}
          {student.bloodGroup && <p className="text-[10px] text-gray-400">Blood: {student.bloodGroup}</p>}
        </div>
        <div className="shrink-0 flex flex-col items-center">
          <div className="bg-white rounded-lg p-1 border border-gray-200">
            <QRCodeSVG value={qrData} size={56} level="M" />
          </div>
          <p className="text-[7px] text-gray-400 mt-1">Scan for attendance</p>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-2.5 border-t border-gray-100">
        <p className="text-[9px] text-gray-400 text-center">{school.address || "Valid for current session"}</p>
      </div>
    </div>
  )
}
