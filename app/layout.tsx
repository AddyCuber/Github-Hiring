import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { Providers } from "@/app/providers"
import { Navbar } from "@/components/Navbar"
import TargetCursor from "@/components/TargetCursor"

export const metadata: Metadata = {
  title: "GitHub Sponsors Leaderboard",
  description: "See who's making the most from open source."
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--background)]">
        <Providers>
          <TargetCursor
            spinDuration={5}
            hideDefaultCursor
            parallaxOn
            hoverDuration={0.1}
          />
          <Navbar />
          <main className="min-h-screen pt-24">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
