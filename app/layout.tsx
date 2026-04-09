import type React from "react"
import type { Metadata, Viewport } from "next"
import { Outfit, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { RootLayoutClient } from "./layout-client"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: "MWSC ERP - Mulonga Water Supply",
  description: "Mulonga Water Supply & Sanitation Company - Enterprise Resource Planning System",
  generator: "Next.js",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MWSC ERP",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className={`${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
        <Analytics />
      </body>
    </html>
  )
}
