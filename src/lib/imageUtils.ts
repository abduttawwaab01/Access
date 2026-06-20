export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
}

export function compressImage(file: File, options: CompressOptions = {}): Promise<Blob> {
  const { maxWidth = 800, quality = 0.7, format = "jpeg" } = options
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth }
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
  const ext = options.format === "png" ? "png" : options.format === "webp" ? "webp" : "jpg"
  formData.append("file", compressed, `${Date.now()}.${ext}`)
  const res = await fetch("/api/upload", { method: "POST", body: formData })
  if (!res.ok) throw new Error("Upload failed")
  const data = await res.json()
  return data.url
}
