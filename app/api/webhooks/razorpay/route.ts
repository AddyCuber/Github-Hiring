import crypto from "crypto"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getPlaceholderUserByGithubId, isPlaceholderMode, placeholderUsers } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

function verifySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const payload = `${orderId}|${paymentId}`
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    const body = (await request.json()) as {
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
    }

    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 })
    }

    if (!verifySignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature)) {
      return NextResponse.json({ error: "Invalid Razorpay signature" }, { status: 400 })
    }

    if (isPlaceholderMode()) {
      const user = getPlaceholderUserByGithubId(session?.githubId || 0) || placeholderUsers[0]
      return NextResponse.json({ success: true, username: user.github_username, planType: "pro_dev", placeholder: true })
    }

    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      const user = getPlaceholderUserByGithubId(session?.githubId || 0) || placeholderUsers[0]
      return NextResponse.json({ success: true, username: user.github_username, planType: "pro_dev", placeholder: true })
    }

    const { data: payment, error: paymentLookupError } = await supabase
      .from("payments")
      .select("id, user_id, plan_type, payer_company, payer_email, metadata, status")
      .eq("razorpay_order_id", body.razorpay_order_id)
      .single()

    if (paymentLookupError || !payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    if (payment.status === "success") {
      return NextResponse.json({ success: true, message: "Already processed" })
    }

    if (payment.plan_type === "pro_dev" && !session?.githubId) {
      return NextResponse.json({ error: "Unauthorized for developer plan confirmation" }, { status: 401 })
    }

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: body.razorpay_payment_id,
        razorpay_signature: body.razorpay_signature,
        status: "success"
      })
      .eq("razorpay_order_id", body.razorpay_order_id)
      .eq("id", payment.id)

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    if (payment.plan_type === "pro_dev") {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, github_username, pro_plan_expires_at")
        .eq("id", payment.user_id || "")
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const now = new Date()
      const expiryAnchor =
        user.pro_plan_expires_at && new Date(user.pro_plan_expires_at) > now ? new Date(user.pro_plan_expires_at) : now
      const nextExpiry = new Date(expiryAnchor)
      nextExpiry.setDate(nextExpiry.getDate() + 30)

      const { error: badgeError } = await supabase
        .from("users")
        .update({
          has_verified_badge: true,
          badge_purchased_at: now.toISOString(),
          badge_expires_at: nextExpiry.toISOString(),
          pro_plan_expires_at: nextExpiry.toISOString(),
          updated_at: now.toISOString()
        })
        .eq("id", user.id)

      if (badgeError) {
        return NextResponse.json({ error: badgeError.message }, { status: 500 })
      }

      await supabase.rpc("refresh_leaderboard")
      return NextResponse.json({ success: true, username: user.github_username, planType: payment.plan_type })
    }

    if (payment.plan_type === "job_listing") {
      const meta = (payment.metadata || {}) as Record<string, string | null>
      const { error: jobError } = await supabase.from("job_listings").insert({
        company_name: payment.payer_company || "Unknown Company",
        title: meta.job_title || "Open Position",
        location: meta.job_location || null,
        salary_range: meta.job_salary_range || null,
        apply_url: meta.job_apply_url || "#",
        description: meta.job_description || null,
        is_active: true
      })

      if (jobError) {
        return NextResponse.json({ error: jobError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, planType: "job_listing" })
    }

    const startsAt = new Date()
    const expiresAt = new Date(startsAt)
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error: recruiterError } = await supabase.from("recruiter_subscriptions").insert({
      company_name: payment.payer_company || "Unknown Company",
      contact_email: payment.payer_email || "unknown@example.com",
      plan_type: payment.plan_type,
      status: "active",
      seats: payment.plan_type === "enterprise" ? 10 : 1,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString()
    })

    if (recruiterError) {
      return NextResponse.json({ error: recruiterError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, planType: payment.plan_type })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    )
  }
}
