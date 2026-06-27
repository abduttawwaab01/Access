export function cacheHeader(ttlSeconds = 30): { headers: Record<string, string> } {
  return { headers: { "Cache-Control": `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}` } }
}
