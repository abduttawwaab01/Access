"use client"

import { QRCodeSVG } from "qrcode.react"

interface StaffData { id?: string; firstName: string; lastName: string; staffId: string; role?: string; department?: string; phone?: string; email?: string; gender?: string; photo?: string }
interface SchoolData { name: string; shortName?: string; logo?: string; address?: string }
interface Props { staff: StaffData; school: SchoolData }

export function StaffIDCardFront({ staff, school }: Props) {
  const initials = `${staff.firstName?.[0] || ""}${staff.lastName?.[0] || ""}`.toUpperCase()
  const qrData = JSON.stringify({ type: "staff", id: staff.id || staff.staffId, code: staff.staffId })

  return (
    <div className="w-[340px] rounded-2xl overflow-hidden shadow-xl border border-border/40 bg-white">
      <div className="relative bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 px-5 pt-5 pb-14 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
        <div className="relative z-10">
          {school.logo ? (
            <img src={school.logo} alt="" className="h-12 w-12 mx-auto rounded-full border-2 border-white/30 object-cover mb-1.5" />
          ) : (
            <div className="h-12 w-12 mx-auto rounded-full bg-white/20 flex items-center justify-center text-lg font-bold mb-1.5">
              {school.shortName?.[0] || "S"}
            </div>
          )}
          <p className="text-sm font-bold tracking-tight leading-tight">{school.name}</p>
          <p className="text-[9px] uppercase tracking-widest opacity-80 mt-0.5 font-medium">Staff Identification Card</p>
        </div>
      </div>
      <div className="relative px-5 pb-4">
        <div className="flex justify-center -mt-10 mb-3">
          <div className="h-24 w-24 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
            {staff.photo ? (
              <img src={staff.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">{initials}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mb-3">
          <p className="text-base font-bold text-gray-900">{staff.firstName} {staff.lastName}</p>
          <p className="text-xs font-semibold text-indigo-600">{staff.role || "Staff"}</p>
          {staff.department && <p className="text-[11px] text-gray-500">{staff.department}</p>}
          <div className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-muted px-3 py-0.5">
            <span className="text-[10px] font-mono text-muted-foreground">{staff.staffId}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500 border-t border-gray-100 pt-2.5 mb-3">
          {staff.email && <><span className="font-medium text-gray-400">Email</span><span className="text-right truncate">{staff.email}</span></>}
          {staff.phone && <><span className="font-medium text-gray-400">Phone</span><span className="text-right">{staff.phone}</span></>}
          {staff.gender && <><span className="font-medium text-gray-400">Gender</span><span className="text-right">{staff.gender}</span></>}
        </div>
        <div className="flex items-center justify-center gap-3 border-t border-gray-100 pt-2.5">
          <div className="bg-white rounded-lg p-1 border border-gray-200">
            <QRCodeSVG value={qrData} size={48} level="M" />
          </div>
          <div className="text-[9px] text-gray-400 leading-tight">
            <p className="font-medium text-gray-500">{school.name}</p>
            {school.address && <p>{school.address}</p>}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2 border-t border-indigo-100">
        <p className="text-[8px] text-center text-indigo-400">Authorized personnel • Scan QR for verification</p>
      </div>
    </div>
  )
}
