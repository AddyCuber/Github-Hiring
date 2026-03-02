import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { ProfileCard } from "@/components/ProfileCard"
import { SponsoredSlotCard } from "@/components/SponsoredSlotCard"
import { DeveloperPreferencesForm } from "@/components/forms/DeveloperPreferencesForm"
import { authOptions } from "@/lib/auth"
import { createAdminSupabaseClient } from "@/lib/supabase"
import { getPlaceholderSlot, getPlaceholderUser, isPlaceholderMode } from "@/lib/placeholders"

export const dynamic = "force-dynamic"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions)

  const placeholderUser = getPlaceholderUser(params.username)
  if (isPlaceholderMode()) {
    if (!placeholderUser) notFound()
    const isOwner = session?.githubId === placeholderUser.github_id
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ProfileCard user={placeholderUser} />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {getPlaceholderSlot("profile_sidebar") && <SponsoredSlotCard slot={getPlaceholderSlot("profile_sidebar")!} />}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="font-bold">Shareable Embed</h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-slate-100 p-3 text-xs">
{`<iframe src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/embed/${placeholderUser.github_username}" width="420" height="220"></iframe>`}
            </pre>
          </section>
        </div>
        {isOwner && <div className="mt-6"><DeveloperPreferencesForm user={placeholderUser} /></div>}
      </div>
    )
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    if (!placeholderUser) notFound()
    return <div className="mx-auto max-w-4xl px-4 py-10"><ProfileCard user={placeholderUser} /></div>
  }

  const { data: user } = await supabase.from("users").select("*").eq("github_username", params.username).single()
  if (!user) notFound()

  const now = new Date().toISOString()
  const { data: profileSlot } = await supabase
    .from("sponsored_slots")
    .select("*")
    .eq("placement_key", "profile_sidebar")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .limit(1)
    .maybeSingle()

  const isOwner = session?.githubId === user.github_id

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ProfileCard user={user} />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {profileSlot && <SponsoredSlotCard slot={profileSlot} />}
        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-bold">Shareable Embed</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-100 p-3 text-xs">
{`<iframe src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/embed/${user.github_username}" width="420" height="220"></iframe>`}
          </pre>
        </section>
      </div>
      {isOwner && <div className="mt-6"><DeveloperPreferencesForm user={user} /></div>}
    </div>
  )
}
