import Link from "next/link"
import { LeaderboardTable } from "@/components/LeaderboardTable"
import { SponsoredSlotCard } from "@/components/SponsoredSlotCard"
import { createAdminSupabaseClient } from "@/lib/supabase"
import { getPlaceholderLeaderboard, getPlaceholderSlot, isPlaceholderMode } from "@/lib/placeholders"

export const dynamic = "force-dynamic"

async function getLeaderboard(sort: "total" | "mrr") {
  if (isPlaceholderMode()) {
    return getPlaceholderLeaderboard(sort, 100)
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) return getPlaceholderLeaderboard(sort, 100)

  if (sort === "mrr") {
    const { data } = await supabase
      .from("users")
      .select(
        "id, github_username, name, avatar_url, total_earnings_usd, monthly_recurring_usd, sponsor_count, is_verified, has_verified_badge"
      )
      .eq("is_verified", true)
      .order("monthly_recurring_usd", { ascending: false })
      .limit(100)

    return (data || []).map((row: any, idx: number) => ({ rank: idx + 1, ...row }))
  }

  const { data } = await supabase.from("leaderboard_rankings").select("*").limit(100)
  return data || []
}

export default async function LeaderboardPage({
  searchParams
}: {
  searchParams: { sort?: string | string[] }
}) {
  const rawSort = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort
  const sort = rawSort === "mrr" ? "mrr" : "total"
  const rows = await getLeaderboard(sort)

  const slot = isPlaceholderMode()
    ? getPlaceholderSlot("leaderboard_banner")
    : await (async () => {
      const supabase = createAdminSupabaseClient()
      if (!supabase) return getPlaceholderSlot("leaderboard_banner")
      const { data } = await supabase
        .from("sponsored_slots")
        .select("*")
        .eq("placement_key", "leaderboard_banner")
        .eq("is_active", true)
        .lte("starts_at", new Date().toISOString())
        .gte("ends_at", new Date().toISOString())
        .limit(1)
        .maybeSingle()
      return data || null
    })()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black tracking-tight">GitHub Sponsors Leaderboard</h1>
          <p className="mt-2 text-slate-600">Top 100 verified developers by Sponsors earnings.</p>
        </div>
        <div className="flex gap-2 text-sm font-semibold">
          <Link href="/leaderboard?sort=total" className={`rounded-md px-3 py-2 ${sort === "total" ? "bg-primary text-white" : "border border-border bg-white"}`}>
            Sort by Total
          </Link>
          <Link href="/leaderboard?sort=mrr" className={`rounded-md px-3 py-2 ${sort === "mrr" ? "bg-primary text-white" : "border border-border bg-white"}`}>
            Sort by MRR
          </Link>
        </div>
      </div>

      <LeaderboardTable rows={rows} showExact={false} />
      {slot && <div className="mt-6"><SponsoredSlotCard slot={slot} /></div>}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border bg-white p-5">
          <h2 className="text-lg font-bold">Hire From This Leaderboard</h2>
          <p className="mt-2 text-sm text-slate-600">Use recruiter filters to shortlist maintainers by MRR, total earnings, and availability.</p>
          <Link href="/recruiters" className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Open Recruiter Dashboard
          </Link>
        </div>
        <div className="rounded-xl border border-primary bg-primary-muted p-5">
          <h2 className="text-lg font-bold">Hiring OSS Developers?</h2>
          <p className="mt-2 text-sm text-slate-600">Post a job listing and reach every developer on this leaderboard. $299/mo.</p>
          <Link href="/jobs/post" className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Post a Job
          </Link>
        </div>
      </section>
    </div>
  )
}
