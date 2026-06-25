export function toCsv(rows: any[]): string {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v)
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s
  }
  const bom = "\uFEFF"
  return bom + [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n")
}

export function toIsoDate(v: any): string {
  if (!v) return ""
  if (typeof v === "string") return v.split("T")[0]
  try { return new Date(v).toISOString().split("T")[0] } catch { return "" }
}

export function flattenForExport(rows: any[], skipFields: string[] = []): any[] {
  return rows.map((row) => {
    const out: any = {}
    for (const [k, v] of Object.entries(row)) {
      if (skipFields.includes(k)) continue
      if (v instanceof Date) { out[k] = v.toISOString(); continue }
      if (Array.isArray(v) || (typeof v === "object" && v !== null)) { out[k] = JSON.stringify(v); continue }
      out[k] = v
    }
    return out
  })
}
