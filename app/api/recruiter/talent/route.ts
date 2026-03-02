import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase"
import { getPlaceholderTalent, isPlaceholderMode } from "@/lib/placeholders"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const minMrr = Number(searchParams.get("minMrr") || "0")
  const minTotal = Number(searchParams.get("minTotal") || "0")
  const availableOnly = searchParams.get("availableOnly") === "1"
  const language = (searchParams.get("language") || "").trim()
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100)

  if (isPlaceholderMode()) {
    return NextResponse.json({
      data: getPlaceholderTalent({ minMrr, minTotal, availableOnly, language, limit }),
      placeholder: true
    })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    return NextResponse.json({
      data: getPlaceholderTalent({ minMrr, minTotal, availableOnly, language, limit }),
      placeholder: true
    })
  }

  let query = supabase
    .from("recruiter_talent_view")
    .select("*")
    .gte("monthly_recurring_usd", minMrr)
    .gte("total_earnings_usd", minTotal)
    .order("monthly_recurring_usd", { ascending: false })
    .limit(limit)

  if (availableOnly) {
    query = query.eq("available_for_hire", true)
  }

  if (language) {
    query = query.ilike("primary_language", `%${language}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
