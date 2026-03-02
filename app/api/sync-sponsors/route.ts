import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { encryptText } from "@/lib/crypto"
import { fetchSponsorsSnapshot } from "@/lib/github"
import { getPlaceholderUserByGithubId, isPlaceholderMode, placeholderUsers } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (isPlaceholderMode()) {
      const user = getPlaceholderUserByGithubId(session.githubId || 0) || placeholderUsers[0]
      return NextResponse.json({
        success: true,
        username: user.github_username,
        totalEarningsUsd: user.total_earnings_usd,
        placeholder: true
      })
    }

    const snapshot = await fetchSponsorsSnapshot(session.accessToken)
    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return NextResponse.json({
        success: true,
        username: snapshot.username,
        totalEarningsUsd: snapshot.totalEarningsUsd,
        placeholder: true
      })
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          github_id: snapshot.githubId,
          github_username: snapshot.username,
          name: snapshot.name,
          avatar_url: snapshot.avatarUrl,
          bio: snapshot.bio,
          github_url: snapshot.githubUrl,
          total_earnings_usd: snapshot.totalEarningsUsd,
          monthly_recurring_usd: snapshot.monthlyRecurringUsd,
          sponsor_count: snapshot.sponsorCount,
          is_verified: true,
          open_to_sponsorship: true,
          verified_at: now,
          last_synced_at: now,
          github_access_token: encryptText(session.accessToken)
        },
        {
          onConflict: "github_id"
        }
      )
      .select("github_username")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.rpc("refresh_leaderboard")

    return NextResponse.json({
      success: true,
      username: data.github_username,
      totalEarningsUsd: snapshot.totalEarningsUsd
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sync sponsors data" },
      { status: 500 }
    )
  }
}
