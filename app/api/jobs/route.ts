import { NextResponse } from "next/server"
import { isPlaceholderMode, placeholderJobs } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  if (isPlaceholderMode()) {
    return NextResponse.json({ data: placeholderJobs, placeholder: true })
  }

  const supabase = createAdminSupabaseClient()
  if (!supabase) return NextResponse.json({ data: placeholderJobs, placeholder: true })

  const { data, error } = await supabase
    .from("job_listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data || [] })
}
