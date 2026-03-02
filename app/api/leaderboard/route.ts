import { NextRequest, NextResponse } from "next/server"
import { getPlaceholderLeaderboard, isPlaceholderMode } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const sort = request.nextUrl.searchParams.get("sort") === "mrr" ? "mrr" : "total"
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 100), 100)

  if (isPlaceholderMode()) {
    return NextResponse.json(
      { data: getPlaceholderLeaderboard(sort, limit), sort, limit, placeholder: true },
      { headers: { "Cache-Control": "public, s-maxage=300" } }
    )
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ data: getPlaceholderLeaderboard(sort, limit), sort, limit, placeholder: true })
  }

  if (sort === "mrr") {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, github_username, name, avatar_url, total_earnings_usd, monthly_recurring_usd, sponsor_count, is_verified, has_verified_badge"
      )
      .eq("is_verified", true)
      .order("monthly_recurring_usd", { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const ranked = (data || []).map((row: any, idx: number) => ({
      rank: idx + 1,
      id: row.id,
      github_username: row.github_username,
      name: row.name,
      avatar_url: row.avatar_url,
      total_earnings_usd: row.total_earnings_usd,
      monthly_recurring_usd: row.monthly_recurring_usd,
      sponsor_count: row.sponsor_count,
      is_verified: row.is_verified,
      has_verified_badge: row.has_verified_badge
    }))

    return NextResponse.json(
      { data: ranked, sort, limit },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60"
        }
      }
    )
  }

  const { data, error } = await supabase.from("leaderboard_rankings").select("*").limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    { data, sort, limit },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60"
      }
    }
  )
}
