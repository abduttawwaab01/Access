import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  let file: File | null = null
  try {
    const formData = await request.formData()
    file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    const blob = await put(file.name, file, { access: "public" })
    return NextResponse.json({ url: blob.url })
  } catch (err: any) {
    if (err.code === "BLOB_READ_WRITE_TOKEN_MISSING" && file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString("base64")
      return NextResponse.json({ url: `data:${file.type || "image/jpeg"};base64,${base64}` })
    }
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 })
  }
}
