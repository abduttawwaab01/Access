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
  gender?: string
  photo?: string
}

interface SchoolData {
  name: string
  shortName?: string
  logo?: string
  address?: string
}

interface StaffIDCardFrontProps {
  staff: StaffData
  school: SchoolData
}

export function StaffIDCardFront({ staff, school }: StaffIDCardFrontProps) {
  const initials = `${staff.firstName?.[0] || ""}${staff.lastName?.[0] || ""}`.toUpperCase()

  return (
    <div className="w-[340px] rounded-2xl overflow-hidden shadow-xl border border-border/40 bg-white">
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 p-5 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
        <div className="relative z-10">
          {school.logo ? (
            <img src={school.logo} alt="" className="h-11 w-11 mx-auto rounded-full border-2 border-white/30 object-cover mb-1" />
          ) : (
            <div className="h-11 w-11 mx-auto rounded-full bg-white/20 flex items-center justify-center text-base font-bold mb-1">
              {school.shortName?.[0] || "S"}
            </div>
          )}
          <p className="text-sm font-bold tracking-tight">{school.name}</p>
          <p className="text-[10px] opacity-80 mt-0.5">STAFF IDENTIFICATION CARD</p>
        </div>
      </div>

      <div className="p-5 flex gap-4 items-center">
        {staff.photo ? (
          <img src={staff.photo} alt="" className="h-20 w-20 rounded-xl border-2 border-indigo-200 object-cover shrink-0" />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-indigo-200 shrink-0">
            <span className="text-xl font-bold text-indigo-600">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-base font-bold text-gray-900 truncate">{staff.firstName} {staff.lastName}</p>
          <p className="text-xs font-medium text-indigo-600">{staff.role || "Staff"}</p>
          {staff.department && <p className="text-[11px] text-gray-500">{staff.department}</p>}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="font-mono">{staff.staffId}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-2.5 flex justify-between text-[10px] text-gray-500">
        <span>{staff.email || ""}</span>
        <span>{staff.phone || ""}</span>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2 border-t border-indigo-100">
        <p className="text-[8px] text-indigo-400 text-center">{school.address || "Authorized personnel only"}</p>
      </div>
    </div>
  )
}
