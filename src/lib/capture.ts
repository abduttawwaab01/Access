function hasUnsupportedColor(value: string): boolean {
  return /(^|[^-\w])lab\(|lch\(|oklab\(|oklch\(|color\(/.test(value)
}

function inlineComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source)
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i]
    const value = computed.getPropertyValue(prop)
    if (hasUnsupportedColor(value)) continue
    try {
      ;(target as HTMLElement).style.setProperty(prop, value)
    } catch {}
  }
  const sourceChildren = source.children
  const targetChildren = target.children
  for (let i = 0; i < sourceChildren.length && i < targetChildren.length; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i])
  }
}

function getFontLinks(): string {
  return `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">`
}

function copyCssVariables(sourceDoc: Document, targetDoc: Document): void {
  const props = ["--font-geist-sans", "--font-geist-mono", "--font-arabic"]
  const sourceHtml = sourceDoc.documentElement
  const targetHtml = targetDoc.documentElement
  for (const prop of props) {
    const val = sourceHtml.style.getPropertyValue(prop) ||
      getComputedStyle(sourceHtml).getPropertyValue(prop)
    if (val) {
      targetHtml.style.setProperty(prop, val)
    }
  }
}

function sanitizeUnsupportedColors(doc: Document): void {
  const all = doc.querySelectorAll("*")
  for (const el of all) {
    const styleAttr = (el as HTMLElement).getAttribute("style")
    if (styleAttr && hasUnsupportedColor(styleAttr)) {
      const safe = styleAttr
        .replace(/lab\([^)]*\)/gi, "transparent")
        .replace(/lch\([^)]*\)/gi, "transparent")
        .replace(/oklab\([^)]*\)/gi, "transparent")
        .replace(/oklch\([^)]*\)/gi, "transparent")
        .replace(/color\([^)]*\)/gi, "transparent")
      ;(el as HTMLElement).setAttribute("style", safe)
    }
  }
}

export async function captureElement(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string; inlineStyles?: boolean }
): Promise<HTMLCanvasElement> {
  const scale = options?.scale ?? 2
  const backgroundColor = options?.backgroundColor ?? "#ffffff"
  const shouldInlineStyles = options?.inlineStyles ?? true

  let html2canvasFn: any

  try {
    const mod = await import("html2canvas")
    html2canvasFn = mod.default || mod
  } catch (err) {
    console.error("Failed to load html2canvas:", err)
    throw new Error("html2canvas library failed to load")
  }

  if (typeof html2canvasFn !== "function") {
    html2canvasFn = (html2canvasFn as any)?.default
  }
  if (typeof html2canvasFn !== "function") {
    console.error("html2canvas is not available")
    throw new Error("html2canvas is not available")
  }

  const canvas = await html2canvasFn(element, {
    scale,
    useCORS: true,
    backgroundColor,
    logging: false,
    allowTaint: true,
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      const fontLinkEl = clonedDoc.createElement("head")
      fontLinkEl.innerHTML = getFontLinks()
      for (const child of Array.from(fontLinkEl.children)) {
        clonedDoc.head.appendChild(child)
      }

      const style = clonedDoc.createElement("style")
      style.textContent = `
        .animated-gradient {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7) !important;
        }
        .glass-card {
          background: rgba(255,255,255,0.9) !important;
        }
        [class*="bg-gradient-"] {
          background-image: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7) !important;
        }
      `
      clonedDoc.head.appendChild(style)

      copyCssVariables(document, clonedDoc)

      if (shouldInlineStyles) {
        try {
          inlineComputedStyles(element, clonedElement)
        } catch {}
      }

      sanitizeUnsupportedColors(clonedDoc)
    },
  })

  return canvas
}

export async function elementToPngBlob(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string; inlineStyles?: boolean }
): Promise<Blob> {
  try {
    const canvas = await captureElement(element, options)
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob returned null"))
      }, "image/png")
    })
  } catch (err) {
    console.error("Failed to convert element to PNG blob:", err)
    throw err
  }
}

export async function elementToDataUrl(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string; inlineStyles?: boolean }
): Promise<string> {
  try {
    const canvas = await captureElement(element, options)
    return canvas.toDataURL("image/png")
  } catch (err) {
    console.error("Failed to convert element to PNG data URL:", err)
    throw err
  }
}

export async function downloadPng(
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string; inlineStyles?: boolean }
): Promise<void> {
  try {
    const canvas = await captureElement(element, { ...options, scale: options?.scale ?? 2 })
    const link = document.createElement("a")
    link.download = filename
    link.href = canvas.toDataURL("image/png")
    link.click()
  } catch (err) {
    console.error("PNG export error:", err)
    throw err
  }
}

export async function downloadPdf(
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string; inlineStyles?: boolean }
): Promise<void> {
  const canvas = await captureElement(element, { ...options, scale: options?.scale ?? 2 })
  const dataUrl = canvas.toDataURL("image/png")

  let JsPdfClass: any
  try {
    const mod = await import("jspdf")
    JsPdfClass = mod.jsPDF
  } catch (err) {
    console.error("Failed to load jspdf:", err)
    throw new Error("jspdf library failed to load")
  }

  const pdf = new JsPdfClass({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] })
  pdf.addImage(dataUrl, "PNG", 0, 0, canvas.width, canvas.height)
  pdf.save(filename)
}

export function downloadCsv(data: Record<string, any>[], filename: string): void {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const escapeCell = (val: any) => {
    const s = String(val ?? "")
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csvContent = [headers.join(","), ...data.map((row) => headers.map((h) => escapeCell(row[h])).join(","))].join("\n")
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function downloadDoc(element: HTMLElement, filename: string, title?: string): void {
  const html = element.outerHTML
  const styles = Array.from(document.styleSheets)
    .map((ss) => {
      try { return Array.from(ss.cssRules || []).map((r) => r.cssText).join("") }
      catch { return ss.href ? `@import url("${ss.href}");` : "" }
    })
    .join("")

  const docHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${title || filename}</title>
    <style>${styles}
      body { font-family: Arial, sans-serif; padding: 20px; }
      .animated-gradient { background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7) !important; }
      .glass-card { background: rgba(255,255,255,0.9) !important; }
    </style>
    </head>
    <body>${html}</body>
    </html>
  `

  const blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith(".doc") ? filename : `${filename}.doc`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function openPrintWindow(element: HTMLElement, title?: string): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    console.error("Failed to open print window")
    return
  }

  const styles = Array.from(document.styleSheets)
    .map((ss) => {
      try {
        return Array.from(ss.cssRules || []).map((r) => r.cssText).join("")
      } catch {
        return ss.href ? `@import url("${ss.href}");` : ""
      }
    })
    .join("")

  const sourceHtml = document.documentElement
  const cssVarProps = ["--font-geist-sans", "--font-geist-mono", "--font-arabic"]
  const cssVarStyles = cssVarProps.map((p) => {
    const val = sourceHtml.style.getPropertyValue(p) || getComputedStyle(sourceHtml).getPropertyValue(p)
    return val ? `${p}: ${val};` : ""
  }).filter(Boolean).join("")

  const scriptContent = "window.onload=function(){setTimeout(function(){window.print();window.close()},300)}"
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || "Print"}</title>
      ${getFontLinks()}
      <style>${styles}</style>
      <style>
        :root { ${cssVarStyles} }
        @page { size: A4; margin: 0; }
        body { margin: 0; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; background: #fff; }
      </style>
    </head>
    <body><script>${scriptContent}<` + `/script>
      ${element.outerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
}
