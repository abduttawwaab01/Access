"use client"

import { useState } from "react"
import { GraduationCap, CheckCircle } from "lucide-react"

export default function ApplyPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "", classApplyingFor: "", previousSchool: "", address: "", parentName: "", parentPhone: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-6">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h1 className="mb-2 text-2xl font-bold">Application Submitted!</h1>
          <p className="text-muted-foreground">We&apos;ll review your application and get back to you soon.</p>
        </div>
      </div>
    )
  }

  const fields = [
    { label: "First Name", key: "firstName", type: "text" },
    { label: "Last Name", key: "lastName", type: "text" },
    { label: "Email", key: "email", type: "email" },
    { label: "Phone", key: "phone", type: "tel" },
    { label: "Date of Birth", key: "dateOfBirth", type: "date" },
    { label: "Gender", key: "gender", type: "select", options: ["Male", "Female", "Other"] },
    { label: "Class Applying For", key: "classApplyingFor", type: "select", options: ["Grade 10A", "Grade 10B", "Grade 11A", "Grade 11B", "Grade 12A", "Grade 12B"] },
    { label: "Previous School", key: "previousSchool", type: "text" },
    { label: "Home Address", key: "address", type: "textarea" },
    { label: "Parent/Guardian Name", key: "parentName", type: "text" },
    { label: "Parent/Guardian Phone", key: "parentPhone", type: "tel" },
  ]

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <div className="animated-gradient mx-auto mb-4 inline-flex rounded-xl p-3"><GraduationCap className="h-6 w-6 text-white" /></div>
          <h1 className="mb-2 text-2xl font-bold">Application Form</h1>
          <p className="text-sm text-muted-foreground">Fill out the form below to apply for admission.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium">{f.label}</label>
              {f.type === "select" ? (
                <select value={form[f.key as keyof typeof form]} onChange={(e) => update(f.key, e.target.value)} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Select...</option>
                  {f.options?.map((o) => <option key={o} value={o.split(" ")[1] || o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea value={form[f.key as keyof typeof form]} onChange={(e) => update(f.key, e.target.value)} required rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              ) : (
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => update(f.key, e.target.value)} required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              )}
            </div>
          ))}
          <button type="submit" disabled={loading} className="animated-gradient w-full rounded-lg py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  )
}
