import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "@/app/styles/globals.css"
import { Providers } from "./providers"

const sans = localFont({
  src: "../fonts/SF-Pro.ttf",
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Medical",
  description: "Welcome ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sans.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
