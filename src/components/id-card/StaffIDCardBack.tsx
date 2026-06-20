import { QRCodeSVG } from "qrcode.react"

interface StaffData {
  id?: string
  firstName: string
  lastName: string
  staffId: string
  role?: string
  department?: string
  phone?: string
  email?: string
  address?: string
  qualification?: string
  employmentDate?: string
  gender?: string
  emergencyContact?: string
}

interface SchoolData {
  name: string
  phone?: string
  email?: string
  address?: string
}

interface IdCardConfig {
  backTitle?: string
  showDepartment?: boolean
  showEmergencyContact?: boolean
  customDepartment?: string
  customEmergencyContact?: string
  customFields?: { label: string; value: string }[]
}

interface StaffIDCardBackProps {
  staff: StaffData
  school: SchoolData
  config?: IdCardConfig
}

export function StaffIDCardBack({ staff, school, config }: StaffIDCardBackProps) {
  const cfg = config || { backTitle: "Staff Information", showDepartment: true, showEmergencyContact: true, customFields: [] }
  const qrData = JSON.stringify({ type: "staff", id: staff.id || staff.staffId, code: staff.staffId })

  return (
    <div className="w-[340px] rounded-2xl overflow-hidden shadow-xl border border-border/40 bg-white">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white text-center">
        <p className="text-sm font-bold">{cfg.backTitle || "Staff Information"}</p>
      </div>

      <div className="p-5 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <InfoRow label="Full Name" value={`${staff.firstName} ${staff.lastName}`} />
          <InfoRow label="Staff ID" value={staff.staffId} />
          {staff.role && <InfoRow label="Role" value={staff.role} />}
          {cfg.showDepartment && (cfg.customDepartment || staff.department) && <InfoRow label="Department" value={cfg.customDepartment || staff.department || ""} />}
          {staff.gender && <InfoRow label="Gender" value={staff.gender} />}
          {staff.qualification && <InfoRow label="Qualification" value={staff.qualification} />}
          {staff.employmentDate && <InfoRow label="Employed" value={new Date(staff.employmentDate).toLocaleDateString()} />}
          {staff.email && <InfoRow label="Email" value={staff.email} />}
          {staff.phone && <InfoRow label="Phone" value={staff.phone} />}
          {staff.address && <InfoRow label="Address" value={staff.address} />}
          {cfg.showEmergencyContact && (cfg.customEmergencyContact || staff.emergencyContact) && <InfoRow label="Emergency" value={cfg.customEmergencyContact || staff.emergencyContact || ""} />}
          {(cfg.customFields || []).map((f, i) => (
            f.value ? <InfoRow key={i} label={f.label} value={f.value} /> : null
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-center gap-4">
          <div className="text-center">
            <QRCodeSVG value={qrData} size={44} level="M" />
            <p className="text-[8px] text-gray-400 mt-1">Staff ID</p>
          </div>
          <div className="text-[10px] text-gray-500 text-center">
            <p className="font-semibold text-gray-700">{school.name}</p>
            {school.phone && <p>{school.phone}</p>}
            {school.email && <p>{school.email}</p>}
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
