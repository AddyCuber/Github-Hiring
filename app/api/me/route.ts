import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getPlaceholderUserByGithubId, isPlaceholderMode, placeholderUsers } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.githubId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isPlaceholderMode()) {
    const user = getPlaceholderUserByGithubId(session.githubId) || placeholderUsers[0]
    return NextResponse.json({
      id: user.id,
      github_username: user.github_username,
      has_verified_badge: user.has_verified_badge,
      badge_expires_at: user.badge_expires_at,
      pro_plan_expires_at: user.pro_plan_expires_at,
      available_for_hire: user.available_for_hire,
      open_to_sponsorship: user.open_to_sponsorship,
      placeholder: true
    })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    const user = getPlaceholderUserByGithubId(session.githubId) || placeholderUsers[0]
    return NextResponse.json({
      id: user.id,
      github_username: user.github_username,
      has_verified_badge: user.has_verified_badge,
      badge_expires_at: user.badge_expires_at,
      pro_plan_expires_at: user.pro_plan_expires_at,
      available_for_hire: user.available_for_hire,
      open_to_sponsorship: user.open_to_sponsorship,
      placeholder: true
    })
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, github_username, has_verified_badge, badge_expires_at, pro_plan_expires_at, available_for_hire, open_to_sponsorship"
    )
    .eq("github_id", session.githubId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}
