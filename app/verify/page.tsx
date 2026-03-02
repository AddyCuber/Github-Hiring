"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"

type SyncResult = {
  username: string
  totalEarningsUsd: number
}

export default function VerifyPage() {
  const { data: session, status } = useSession()
  const provider = process.env.NEXT_PUBLIC_PLACEHOLDER_MODE === "true" ? "demo" : "github"
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function syncSponsors() {
    setSyncing(true)
    setError(null)

    try {
      const res = await fetch("/api/sync-sponsors", { method: "POST" })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || "Failed syncing sponsors data")
      setResult(body)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error")
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && !result && !syncing) {
      syncSponsors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  if (status === "loading") {
    return <div className="mx-auto max-w-3xl px-4 py-10">Checking session...</div>
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Verify Your Earnings</h1>
        <p className="mt-3 text-slate-600">Connect your GitHub account to sync Sponsors data and appear in talent discovery.</p>
        <button
          className="mt-6 rounded-md bg-primary px-5 py-2.5 font-semibold text-white"
          onClick={() => signIn(provider, { callbackUrl: "/verify" })}
        >
          {provider === "demo" ? "Continue with Demo Account" : "Continue with GitHub"}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black">Verification Status</h1>
      <p className="mt-2 text-slate-600">Connected as {session.user?.name || "GitHub user"}.</p>

      {syncing && <p className="mt-4">Syncing sponsors data...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 rounded-xl border border-border bg-white p-5">
          <p className="font-semibold text-success">Verified successfully.</p>
          <p className="mt-2">Lifetime earnings synced: ${result.totalEarningsUsd.toLocaleString("en-US")}</p>
          <div className="mt-4 flex gap-3">
            <Link href={`/profile/${result.username}`} className="rounded-md bg-accent px-4 py-2 text-white">
              View profile
            </Link>
            <Link href="/checkout" className="rounded-md border border-border px-4 py-2">
              Upgrade to Pro Dev
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
