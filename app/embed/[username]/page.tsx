import { formatCurrency } from "@/lib/format"
import { createAdminSupabaseClient } from "@/lib/supabase"
import { getPlaceholderUser, isPlaceholderMode } from "@/lib/placeholders"

export default async function EmbedProfilePage({ params }: { params: { username: string } }) {
  if (isPlaceholderMode()) {
    const user = getPlaceholderUser(params.username)
    if (!user) return <div className="p-6 text-sm">Profile unavailable</div>

    return (
      <div className="h-screen w-screen bg-white p-4 text-primary">
        <div className="h-full rounded-xl border border-border p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">OSS Earnings Profile</p>
          <h1 className="mt-1 text-xl font-bold">{user.name || user.github_username}</h1>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-slate-500">MRR</div><div className="font-bold">{formatCurrency(user.monthly_recurring_usd)}/mo</div></div>
            <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-slate-500">Sponsors</div><div className="font-bold">{user.sponsor_count}</div></div>
          </div>
        </div>
      </div>
    )
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) return <div className="p-6 text-sm">Profile unavailable</div>

  const { data: user } = await supabase
    .from("users")
    .select("github_username, name, monthly_recurring_usd, sponsor_count, has_verified_badge")
    .eq("github_username", params.username)
    .maybeSingle()

  if (!user) {
    return <div className="p-6 text-sm">Profile unavailable</div>
  }

  return (
    <div className="h-screen w-screen bg-white p-4 text-primary">
      <div className="h-full rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">OSS Earnings Profile</p>
        <h1 className="mt-1 text-xl font-bold">{user.name || user.github_username}</h1>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-slate-500">MRR</div><div className="font-bold">{formatCurrency(user.monthly_recurring_usd)}/mo</div></div>
          <div className="rounded-md bg-slate-50 p-3"><div className="text-xs text-slate-500">Sponsors</div><div className="font-bold">{user.sponsor_count}</div></div>
        </div>
      </div>
    </div>
  )
}
