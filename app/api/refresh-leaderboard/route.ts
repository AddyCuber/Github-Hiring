import { NextResponse } from "next/server"
import { isPlaceholderMode } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (isPlaceholderMode()) {
    return NextResponse.json({ success: true, placeholder: true })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) return NextResponse.json({ success: true, placeholder: true })
  const { error } = await supabase.rpc("refresh_leaderboard")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
