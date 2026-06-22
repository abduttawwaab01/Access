export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
  folder?: string
}

export function compressImage(file: File, options: CompressOptions = {}): Promise<Blob> {
  const { maxWidth = 800, maxHeight, quality = 0.6, format = "webp" } = options
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth }
      if (maxHeight && h > maxHeight) { w = (w * maxHeight) / h; h = maxHeight }
      const canvas = document.createElement("canvas")
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Compression failed"))
        },
        `image/${format}`,
        quality,
      )
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

export async function compressAndUpload(file: File, options: CompressOptions = {}): Promise<string> {
  const compressed = await compressImage(file, options)
  const formData = new FormData()
  const fmt = options.format || "webp"
  const ext = fmt === "png" ? "png" : fmt === "jpeg" ? "jpg" : "webp"
  const folder = options.folder || "uploads"
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_")
  formData.append("file", compressed, `${Date.now()}-${safeName}`)
  formData.append("folder", folder)
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  if (!res.ok) throw new Error("Upload failed")
  const data = await res.json()
  return data.url
}
