import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://access-school.vercel.app"

  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/admin`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/teacher`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/parent`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/student`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ]
}
