import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { PWARegister } from "@/components/PWARegister"
import { PWAInstallBanner } from "@/components/PWAInstallBanner"
import { OfflineIndicator } from "@/components/OfflineIndicator"
import { SkipToContent } from "@/components/SkipToContent"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Access — School Management Platform",
  description:
    "A modern, mobile-first school management and computer-based testing platform for schools, teachers, and parents.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Access",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: { url: "/icons/icon-192.svg", sizes: "192x192" },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1121" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="mask-icon" href="/icons/icon-192.svg" color="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipToContent />
        <OfflineIndicator />
        <div id="main-content">{children}</div>
        <PWAInstallBanner />
        <PWARegister />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
