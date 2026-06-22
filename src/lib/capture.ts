export async function captureElement(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string }
): Promise<HTMLCanvasElement> {
  const scale = options?.scale ?? 2
  const backgroundColor = options?.backgroundColor ?? "#ffffff"

  let html2canvasFn: any

  try {
    const mod = await import("html2canvas")
    html2canvasFn = mod.default || mod
  } catch {
    throw new Error("html2canvas library failed to load")
  }

  if (typeof html2canvasFn !== "function") {
    html2canvasFn = (html2canvasFn as any)?.default
  }
  if (typeof html2canvasFn !== "function") {
    throw new Error("html2canvas is not available")
  }

  const canvas = await html2canvasFn(element, {
    scale,
    useCORS: true,
    backgroundColor,
    logging: false,
    allowTaint: false,
    onclone: (clonedDoc: Document) => {
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
    },
  })

  return canvas
}

export async function elementToPngBlob(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string }
): Promise<Blob> {
  const canvas = await captureElement(element, options)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Canvas toBlob returned null"))
    }, "image/png")
  })
}

export async function elementToDataUrl(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string }
): Promise<string> {
  const canvas = await captureElement(element, options)
  return canvas.toDataURL("image/png")
}

export async function downloadPng(
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string }
): Promise<void> {
  const dataUrl = await elementToDataUrl(element, options)
  const link = document.createElement("a")
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function downloadPdf(
  element: HTMLElement,
  filename: string,
  options?: { scale?: number; backgroundColor?: string }
): Promise<void> {
  const dataUrl = await elementToDataUrl(element, { ...options, scale: 2 })

  let JsPdfClass: any
  try {
    const mod = await import("jspdf")
    JsPdfClass = mod.jsPDF
  } catch {
    throw new Error("jspdf library failed to load")
  }

  const pdf = new JsPdfClass("p", "mm", "a4")
  const pdfWidth = pdf.internal.pageSize.getWidth()

  const img = new Image()
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = dataUrl
  })

  const pdfHeight = (img.height * pdfWidth) / img.width
  let heightLeft = pdfHeight
  let position = 0
  const pageHeight = pdf.internal.pageSize.getHeight()

  pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - pdfHeight
    pdf.addPage()
    pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

export function openPrintWindow(element: HTMLElement, title?: string): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const styles = Array.from(document.styleSheets)
    .map((ss) => {
      try {
        return Array.from(ss.cssRules || []).map((r) => r.cssText).join("")
      } catch {
        return ss.href ? `@import url("${ss.href}");` : ""
      }
    })
    .join("")

  const fontLink = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="fonts"]')
  const fontLinkTag = fontLink ? `<link rel="stylesheet" href="${fontLink.href}">` : ""

  const scriptContent = "window.onload=function(){setTimeout(function(){window.print();window.close()},300)}"
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || "Print"}</title>
      ${fontLinkTag}
      <style>${styles}</style>
      <style>
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
