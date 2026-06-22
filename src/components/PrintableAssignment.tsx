"use client"

import { forwardRef } from "react"

interface AssignmentData {
  schoolName: string
  schoolLogo?: string
  schoolMotto?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  title: string
  description: string
  subject: string
  className: string
  dueDate?: string
  teacherName?: string
  createdAt?: string
}

export const PrintableAssignment = forwardRef<HTMLDivElement, { data: AssignmentData }>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white shadow-xl overflow-hidden font-[family-name:var(--font-geist-sans),var(--font-arabic)]"
      style={{ width: "210mm", minHeight: "297mm", fontSize: "11pt", lineHeight: "1.6" }}
    >
      {/* School Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10 p-6 text-center">
          {data.schoolLogo && (
            <img src={data.schoolLogo} alt="" className="h-16 w-16 rounded-full border-2 border-white/30 object-cover mx-auto mb-2" />
          )}
          <h1 className="text-xl font-bold">{data.schoolName}</h1>
          {data.schoolMotto && <p className="text-sm opacity-80 italic">&ldquo;{data.schoolMotto}&rdquo;</p>}
          <div className="flex justify-center gap-3 text-xs opacity-70 mt-1">
            {data.schoolAddress && <span>{data.schoolAddress}</span>}
            {data.schoolPhone && <span>{data.schoolPhone}</span>}
            {data.schoolEmail && <span>{data.schoolEmail}</span>}
          </div>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="border-b-2 border-emerald-200 bg-emerald-50/50 px-6 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div><span className="font-semibold text-emerald-700">Subject:</span> <span className="text-gray-700">{data.subject}</span></div>
          <div><span className="font-semibold text-emerald-700">Class:</span> <span className="text-gray-700">{data.className}</span></div>
          {data.dueDate && <div><span className="font-semibold text-emerald-700">Due Date:</span> <span className="text-gray-700">{data.dueDate}</span></div>}
          {data.teacherName && <div><span className="font-semibold text-emerald-700">Teacher:</span> <span className="text-gray-700">{data.teacherName}</span></div>}
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-lg font-bold text-gray-900 text-center uppercase tracking-wide">{data.title}</h2>
      </div>

      {/* Description / Instructions */}
      <div className="px-6 pb-4">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3 border-b border-emerald-100 pb-1">Instructions</h3>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.description}</div>
      </div>

      {/* Answer Space */}
      <div className="px-6 pb-4">
        <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3 border-b border-emerald-100 pb-1">Answer Space</h3>
        <div className="border-2 border-dashed border-gray-200 rounded-lg" style={{ minHeight: "200mm" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-dashed border-gray-100" style={{ height: "50mm" }} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-3 text-center text-xs text-gray-400">
        <p>{data.schoolName} &mdash; Assignment</p>
        {data.createdAt && <p>Generated: {new Date(data.createdAt).toLocaleDateString()}</p>}
        <p className="mt-1 text-[9px] opacity-60">This is a computer-generated document &bull; Access School Management Platform</p>
      </div>
    </div>
  )
})

PrintableAssignment.displayName = "PrintableAssignment"
