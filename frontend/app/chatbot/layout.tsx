import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

const _vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-terminal",
})

export const metadata: Metadata = {
  title: "RETRO CHAT v1.0",
  description: "A retro pixel-style AI chat interface",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_pressStart.variable} ${_vt323.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
