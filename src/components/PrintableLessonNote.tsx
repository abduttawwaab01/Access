"use client"

import { forwardRef, useMemo } from "react"

interface LessonNoteData {
  schoolName: string
  schoolLogo?: string
  schoolMotto?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  title: string
  subject: string
  className: string
  week: number
  term: string
  session: string
  teacherName: string
  content: string
  resources?: string
  quiz?: { questionText?: string; question?: string; type: string; options?: string[]; correctAnswer: string; points: number }[]
  createdAt?: string
}

export const PrintableLessonNote = forwardRef<HTMLDivElement, { data: LessonNoteData }>(({ data }, ref) => {
  const safeContent = data.content || ""

  const stripHtml = (html: string) => {
    if (!html) return ""
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerText || ""
  }

  const plainContent = useMemo(() => stripHtml(safeContent), [safeContent])
  const plainResources = useMemo(() => data.resources ? stripHtml(data.resources) : "", [data.resources])

  const lines = plainContent.split("\n").filter(Boolean)
  const resourceLines = plainResources.split("\n").filter(Boolean)

  return (
    <div
      ref={ref}
      className="bg-white shadow-xl overflow-hidden font-[family-name:var(--font-geist-sans),var(--font-arabic)]"
      style={{ width: "210mm", minHeight: "297mm", fontSize: "10pt", lineHeight: "1.6" }}
    >
      {/* ── School Header ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
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

      {/* ── Lesson Note Metadata ── */}
      <div className="border-b-2 border-indigo-200 bg-indigo-50/50 px-6 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div><span className="font-semibold text-indigo-700">Subject:</span> <span className="text-gray-700">{data.subject}</span></div>
          <div><span className="font-semibold text-indigo-700">Class:</span> <span className="text-gray-700">{data.className}</span></div>
          <div><span className="font-semibold text-indigo-700">Week:</span> <span className="text-gray-700">{data.week}</span></div>
          <div><span className="font-semibold text-indigo-700">Term:</span> <span className="text-gray-700">{data.term}</span></div>
          <div><span className="font-semibold text-indigo-700">Session:</span> <span className="text-gray-700">{data.session}</span></div>
          <div><span className="font-semibold text-indigo-700">Teacher:</span> <span className="text-gray-700">{data.teacherName}</span></div>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-lg font-bold text-gray-900 text-center uppercase tracking-wide">{data.title}</h2>
      </div>

      {/* ── Lesson Content ── */}
      <div className="px-6 pb-4">
        <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3 border-b border-indigo-100 pb-1">Lesson Content</h3>
        <div className="text-gray-800 space-y-2">
          {lines.length > 0 ? (
            lines.map((line, i) => {
              const trimmed = line.trim()
              if (trimmed.startsWith("## ")) {
                return <h4 key={i} className="text-base font-bold text-gray-900 mt-4 mb-1">{trimmed.replace(/^##\s*/, "")}</h4>
              }
              if (trimmed.startsWith("# ")) {
                return <h4 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-1">{trimmed.replace(/^#\s*/, "")}</h4>
              }
              if (trimmed.startsWith("- ")) {
                return <li key={i} className="text-sm ml-4 list-disc text-gray-700">{trimmed.replace(/^-\s*/, "")}</li>
              }
              if (trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                return <li key={i} className="text-sm ml-4 list-disc text-gray-700">{trimmed.replace(/^[\*\•]\s*/, "")}</li>
              }
              if (/^\d+\./.test(trimmed)) {
                return <li key={i} className="text-sm ml-4 list-decimal text-gray-700">{trimmed}</li>
              }
              return <p key={i} className="text-sm text-gray-700">{trimmed}</p>
            })
          ) : (
            <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: safeContent }} />
          )}
        </div>
      </div>

      {/* ── Resources ── */}
      {resourceLines.length > 0 && (
        <div className="px-6 pb-4">
          <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">Resources / References</h3>
          <ul className="space-y-1">
            {resourceLines.map((r, i) => (
              <li key={i} className="text-sm text-gray-700 ml-4 list-disc">{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Quiz ── */}
      {data.quiz && data.quiz.length > 0 && (
        <div className="px-6 pb-4">
          <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">Review Questions</h3>
          <div className="space-y-3">
            {data.quiz.map((q, i) => (
              <div key={i} className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3">
                <p className="text-sm font-medium text-gray-900">
                  {i + 1}. {q.questionText || q.question || ""}
                  <span className="text-xs text-gray-500 ml-2">[{q.points} {q.points === 1 ? "pt" : "pts"}]</span>
                </p>
                {q.options && q.options.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-0.5">
                    {q.options.map((o, oi) => (
                      <span key={oi} className={o === q.correctAnswer ? "font-bold text-green-700" : ""}>
                        {String.fromCharCode(65 + oi)}. {o}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-green-700 mt-1">
                  <span className="font-semibold">Answer:</span> {q.correctAnswer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="border-t border-gray-200 px-6 py-3 text-center text-xs text-gray-400">
        <p>{data.schoolName} &mdash; Lesson Note &mdash; {data.term} {data.session}</p>
        {data.createdAt && <p>Generated: {new Date(data.createdAt).toLocaleDateString()}</p>}
        <p className="mt-1 text-[9px] opacity-60">This is a computer-generated document &bull; Access School Management Platform</p>
      </div>
    </div>
  )
})

PrintableLessonNote.displayName = "PrintableLessonNote"
