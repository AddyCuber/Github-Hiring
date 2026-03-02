import Image from "next/image"
import Link from "next/link"
import { RecruiterLeadForm } from "@/components/forms/RecruiterLeadForm"
import { SponsoredSlotCard } from "@/components/SponsoredSlotCard"
import { formatCurrency } from "@/lib/format"
import { createAdminSupabaseClient } from "@/lib/supabase"
import { getPlaceholderSlot, getPlaceholderTalent, isPlaceholderMode } from "@/lib/placeholders"

export const dynamic = "force-dynamic"

async function getTalent(searchParams: { [key: string]: string | string[] | undefined }) {
  const minMrr = Number((Array.isArray(searchParams.minMrr) ? searchParams.minMrr[0] : searchParams.minMrr) || "0")
  const minTotal = Number((Array.isArray(searchParams.minTotal) ? searchParams.minTotal[0] : searchParams.minTotal) || "0")
  const availableOnly = (Array.isArray(searchParams.availableOnly) ? searchParams.availableOnly[0] : searchParams.availableOnly) === "1"
  const language = (Array.isArray(searchParams.language) ? searchParams.language[0] : searchParams.language) || ""

  if (isPlaceholderMode()) {
    return {
      data: getPlaceholderTalent({ minMrr, minTotal, availableOnly, language, limit: 100 }),
      slot: getPlaceholderSlot("recruiter_banner"),
      filters: { minMrr, minTotal, availableOnly, language }
    }
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return {
      data: getPlaceholderTalent({ minMrr, minTotal, availableOnly, language, limit: 100 }),
      slot: getPlaceholderSlot("recruiter_banner"),
      filters: { minMrr, minTotal, availableOnly, language }
    }
  }

  let query = supabase
    .from("recruiter_talent_view")
    .select("*")
    .gte("monthly_recurring_usd", minMrr)
    .gte("total_earnings_usd", minTotal)
    .order("monthly_recurring_usd", { ascending: false })
    .limit(100)

  if (availableOnly) query = query.eq("available_for_hire", true)
  if (language) query = query.ilike("primary_language", `%${language}%`)

  const { data } = await query

  const now = new Date().toISOString()
  const { data: slot } = await supabase
    .from("sponsored_slots")
    .select("*")
    .eq("placement_key", "recruiter_banner")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1)
    .maybeSingle()

  return {
    data: data || [],
    slot: slot || null,
    filters: { minMrr, minTotal, availableOnly, language }
  }
}

export default async function RecruitersPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { data, slot, filters } = await getTalent(searchParams)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black tracking-tight">Recruiter Dashboard</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Find maintainers with verified OSS revenue signals. Paid plans unlock advanced filtering, contact exports, and API.
      </p>

      <form className="mt-6 grid gap-3 rounded-xl border border-border bg-white p-4 md:grid-cols-4">
        <input name="minMrr" defaultValue={String(filters.minMrr || "")} placeholder="Min MRR (USD)" className="rounded-md border border-border px-3 py-2" />
        <input name="minTotal" defaultValue={String(filters.minTotal || "")} placeholder="Min Total (USD)" className="rounded-md border border-border px-3 py-2" />
        <input name="language" defaultValue={filters.language} placeholder="Language" className="rounded-md border border-border px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="availableOnly" value="1" defaultChecked={filters.availableOnly} />
          Available for hire only
        </label>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-4">Apply Filters</button>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-3">
          {data.map((dev: any) => (
            <article key={dev.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image src={dev.avatar_url || "https://avatars.githubusercontent.com/u/0?v=4"} alt={dev.github_username} width={48} height={48} className="rounded-full" />
                  <div>
                    <h2 className="font-bold text-primary">{dev.name || dev.github_username}</h2>
                    <p className="text-sm text-slate-600">{dev.primary_language || "Unknown stack"}{dev.location ? ` • ${dev.location}` : ""}</p>
                  </div>
                </div>
                <Link href={`/profile/${dev.github_username}`} className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold">View profile</Link>
              </div>

              <p className="mt-3 text-sm text-slate-700">{dev.bio || "No bio provided."}</p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md bg-slate-50 p-2"><div className="text-xs text-slate-500">MRR</div><div className="font-semibold">{formatCurrency(dev.monthly_recurring_usd)}/mo</div></div>
                <div className="rounded-md bg-slate-50 p-2"><div className="text-xs text-slate-500">Total</div><div className="font-semibold">{formatCurrency(dev.total_earnings_usd)}</div></div>
                <div className="rounded-md bg-slate-50 p-2"><div className="text-xs text-slate-500">Sponsors</div><div className="font-semibold">{dev.sponsor_count}</div></div>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          {slot ? <SponsoredSlotCard slot={slot} /> : null}

          <section className="rounded-xl border border-border bg-white p-4 text-sm">
            <h3 className="font-bold">Pricing</h3>
            <p className="mt-2">Recruiter: $49/mo</p>
            <p>Enterprise: $199/mo</p>
          </section>

          <RecruiterLeadForm />
        </aside>
      </div>
    </div>
  )
}
