import Link from "next/link"
import { LeaderboardTable } from "@/components/LeaderboardTable"
import { SponsoredSlotCard } from "@/components/SponsoredSlotCard"
import { createAdminSupabaseClient } from "@/lib/supabase"
import {
  getPlaceholderLeaderboard,
  getPlaceholderSlot,
  isPlaceholderMode,
  placeholderJobs
} from "@/lib/placeholders"

export const dynamic = "force-dynamic"

async function getHomeData() {
  if (isPlaceholderMode()) {
    return {
      topTen: getPlaceholderLeaderboard("total", 10),
      jobs: placeholderJobs.slice(0, 3),
      slot: getPlaceholderSlot("home_banner")
    }
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return {
      topTen: getPlaceholderLeaderboard("total", 10),
      jobs: placeholderJobs.slice(0, 3),
      slot: getPlaceholderSlot("home_banner")
    }
  }

  const [{ data: topTen }, { data: jobs }, { data: slot }] = await Promise.all([
    supabase.from("leaderboard_rankings").select("*").limit(10),
    supabase.from("job_listings").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(3),
    supabase
      .from("sponsored_slots")
      .select("*")
      .eq("placement_key", "home_banner")
      .eq("is_active", true)
      .lte("starts_at", new Date().toISOString())
      .gte("ends_at", new Date().toISOString())
      .limit(1)
      .maybeSingle()
  ])

  return {
    topTen: topTen || [],
    jobs: jobs || [],
    slot: slot || null
  }
}

export default async function HomePage() {
  const { topTen, jobs, slot } = await getHomeData()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10">
      <section className="rounded-2xl border border-border bg-white p-8">
        <h1 className="text-4xl font-black tracking-tight text-primary md:text-5xl">Verified OSS Revenue Intelligence for Hiring</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Track top GitHub Sponsors maintainers, verify earnings via OAuth, and help recruiters source proven OSS talent.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/recruiters" className="cursor-target rounded-md bg-primary px-5 py-3 font-semibold text-white">
            Recruiter Dashboard
          </Link>
          <Link href="/leaderboard" className="cursor-target rounded-md border border-border px-5 py-3 font-semibold">
            Public Leaderboard
          </Link>
          <Link href="/verify" className="cursor-target rounded-md border border-border px-5 py-3 font-semibold">
            Verify as Developer
          </Link>
        </div>
      </section>

      {slot ? <SponsoredSlotCard slot={slot} /> : null}

      <section>
        <h2 className="mb-4 text-2xl font-bold">Live Leaderboard Preview</h2>
        <LeaderboardTable rows={topTen} showExact={false} />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="text-xl font-bold">Free</h3>
          <p className="mt-2 text-3xl font-black">$0</p>
          <p className="mt-2 text-sm text-slate-600">Leaderboard visibility, profile with earnings tiers, and embed widget.</p>
          <Link href="/verify" className="cursor-target mt-4 inline-block rounded-md border border-border px-4 py-2 font-semibold">
            Claim Profile
          </Link>
        </div>
        <div className="rounded-xl border border-primary bg-primary-muted p-6">
          <h3 className="text-xl font-bold">Pro Dev</h3>
          <p className="mt-2 text-3xl font-black">$5/mo</p>
          <p className="mt-2 text-sm text-slate-600">Exact earnings, hire/sponsor flags, portfolio, testimonials, priority placement.</p>
          <Link href="/checkout?plan=pro_dev" className="cursor-target mt-4 inline-block rounded-md bg-primary px-4 py-2 text-white">
            Upgrade
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="text-xl font-bold">Job Listing</h3>
          <p className="mt-2 text-3xl font-black">$299/mo</p>
          <p className="mt-2 text-sm text-slate-600">Post a job and reach verified OSS maintainers and recruiters.</p>
          <Link href="/jobs/post" className="cursor-target mt-4 inline-block rounded-md bg-primary px-4 py-2 text-white">
            Post a Job
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="text-xl font-bold">Recruiter</h3>
          <p className="mt-2 text-3xl font-black">$299/mo</p>
          <p className="mt-2 text-sm text-slate-600">Talent filtering, contact info, shortlist exports, and API access.</p>
          <Link href="/recruiters" className="cursor-target mt-4 inline-block rounded-md bg-primary px-4 py-2 text-white">
            Start Hiring
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Sponsored Jobs</h3>
          <Link href="/jobs/post" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Post a Job — $299/mo
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {jobs.map((job: any) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-4 py-3">
              <p className="font-semibold">{job.company_name} - {job.title}</p>
              <Link href={job.apply_url} target="_blank" className="text-sm font-semibold text-accent">
                Apply
              </Link>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-sm text-slate-600">No active jobs yet.</p>}
        </div>
      </section>
    </div>
  )
}
