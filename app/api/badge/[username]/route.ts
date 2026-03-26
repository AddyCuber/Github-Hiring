import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase"
import { getPlaceholderUser, isPlaceholderMode } from "@/lib/placeholders"

function buildSvg(name: string, mrr: number, sponsors: number, verified: boolean) {
  const displayName = name.length > 20 ? name.slice(0, 18) + "..." : name
  const mrrText = `$${mrr.toLocaleString("en-US")}/mo`
  const badge = verified ? " ✓" : ""
  const width = 280
  const height = 32

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&amp;display=swap');
      .name { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; fill: #1a1a1a; }
      .stat { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; fill: #fff; }
    </style>
  </defs>
  <rect x="0" y="0" width="140" height="${height}" rx="4" fill="#fdfcf9" stroke="#e4e4e7" stroke-width="1"/>
  <rect x="140" y="0" width="70" height="${height}" rx="0" fill="#d97706"/>
  <rect x="210" y="0" width="70" height="${height}" rx="0" fill="#1a1a1a"/>
  <rect x="210" y="0" width="70" height="${height}" rx="4" fill="none"/>
  <text x="10" y="20" class="name">${escapeXml(displayName)}${badge}</text>
  <text x="175" y="20" class="stat" text-anchor="middle">${mrrText}</text>
  <text x="245" y="20" class="stat" text-anchor="middle">${sponsors} sponsors</text>
</svg>`
}

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const username = params.username

  let name = username
  let mrr = 0
  let sponsors = 0
  let verified = false

  if (isPlaceholderMode()) {
    const user = getPlaceholderUser(username)
    if (user) {
      name = user.name || username
      mrr = user.monthly_recurring_usd
      sponsors = user.sponsor_count
      verified = user.has_verified_badge
    }
  } else {
    const supabase = createAdminSupabaseClient()
    if (supabase) {
      const { data: user } = await supabase
        .from("users")
        .select("name, monthly_recurring_usd, sponsor_count, has_verified_badge")
        .eq("github_username", username)
        .single()

      if (user) {
        const u = user as any
        name = u.name || username
        mrr = u.monthly_recurring_usd
        sponsors = u.sponsor_count
        verified = u.has_verified_badge
      }
    }
  }

  const svg = buildSvg(name, mrr, sponsors, verified)

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  })
}
