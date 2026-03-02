import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getPlaceholderUserByGithubId, isPlaceholderMode, placeholderUsers } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.githubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    availableForHire?: boolean
    openToSponsorship?: boolean
    profileTagline?: string
    primaryLanguage?: string
    location?: string
    hireEmail?: string
    portfolioLinks?: string[]
    testimonials?: string[]
  }

  if (isPlaceholderMode()) {
    const user = getPlaceholderUserByGithubId(session.githubId) || placeholderUsers[0]
    return NextResponse.json({ success: true, username: user.github_username, placeholder: true, payload: body })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    const user = getPlaceholderUserByGithubId(session.githubId) || placeholderUsers[0]
    return NextResponse.json({ success: true, username: user.github_username, placeholder: true, payload: body })
  }

  const updatePayload = {
    available_for_hire: body.availableForHire ?? false,
    open_to_sponsorship: body.openToSponsorship ?? true,
    profile_tagline: body.profileTagline || null,
    primary_language: body.primaryLanguage || null,
    location: body.location || null,
    hire_email: body.hireEmail || null,
    portfolio_links: body.portfolioLinks || [],
    testimonials: body.testimonials || []
  }

  const { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("github_id", session.githubId)
    .select("github_username")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, username: data.github_username })
}
