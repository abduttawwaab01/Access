const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

export interface FetchResult {
  found: boolean
  title: string
  extract: string
  url: string
}

export async function fetchWikipediaExtract(topic: string): Promise<FetchResult> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "extracts",
    exintro: "1",
    explaintext: "1",
    origin: "*",
    redirects: "1",
    titles: topic,
  })

  try {
    const res = await fetch(`${WIKIPEDIA_API}?${params}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { found: false, title: topic, extract: "", url: "" }

    const data = await res.json()
    const pages = data.query?.pages
    if (!pages) return { found: false, title: topic, extract: "", url: "" }

    const pageId = Object.keys(pages)[0]
    if (pageId === "-1" || !pages[pageId]?.extract) {
      return { found: false, title: topic, extract: "", url: "" }
    }

    const page = pages[pageId]
    const extract = page.extract.trim()

    return {
      found: true,
      title: page.title || topic,
      extract,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title || topic)}`,
    }
  } catch {
    return { found: false, title: topic, extract: "", url: "" }
  }
}
