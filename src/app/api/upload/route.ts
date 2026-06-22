import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })

    const folder = (formData.get("folder") as string) || "uploads"
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_")
    const pathname = `${folder}/${Date.now()}-${safeName}`

    try {
      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: false,
      })
      return NextResponse.json({ url: blob.url })
    } catch {
      // Vercel Blob unavailable — fallback to base64
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpeg"
      const base64 = buffer.toString("base64")
      return NextResponse.json({ url: `data:image/${ext};base64,${base64}` })
    }
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
