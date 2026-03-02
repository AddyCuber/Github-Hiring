import { NextRequest, NextResponse } from "next/server"
import { isPlaceholderMode, placeholderSlots } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const placement = request.nextUrl.searchParams.get("placement") || ""

  if (isPlaceholderMode()) {
    const data = placement ? placeholderSlots.filter((s) => s.placement_key === placement) : placeholderSlots
    return NextResponse.json({ data, placeholder: true })
  }

  const now = new Date().toISOString()
  const supabase = createAdminSupabaseClient()
  if (!supabase) {
    const data = placement ? placeholderSlots.filter((s) => s.placement_key === placement) : placeholderSlots
    return NextResponse.json({ data, placeholder: true })
  }

  let query = supabase
    .from("sponsored_slots")
    .select("*")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("created_at", { ascending: false })

  if (placement) {
    query = query.eq("placement_key", placement)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data || [] })
}
