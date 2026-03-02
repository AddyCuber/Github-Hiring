"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()
  const provider = process.env.NEXT_PUBLIC_PLACEHOLDER_MODE === "true" ? "demo" : "github"

  return (
    <header className="fixed top-0 z-50 w-full border-b border-foreground bg-[var(--background)] px-4">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href="/" className="cursor-target text-xl font-black tracking-tighter text-foreground uppercase">
          Sponsors<span className="text-primary italic">Rank</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/recruiters" className="cursor-target text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
            Recruiters
          </Link>
          <Link href="/jobs" className="cursor-target text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
            Jobs
          </Link>
          <Link href="/pro" className="cursor-target text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
            Pro Dev
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-xs font-bold uppercase tracking-widest text-muted-foreground md:inline">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="cursor-target retro-button text-xs uppercase tracking-widest"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn(provider)}
              className="cursor-target retro-button retro-button-primary text-xs uppercase tracking-widest"
            >
              {provider === "demo" ? "Demo Sign In" : "Sign In"}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
