import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { isPlaceholderMode } from "@/lib/placeholders"
import { getRazorpayClient } from "@/lib/razorpay"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = (await request.json()) as {
      planType?: "pro_dev" | "job_listing" | "recruiter" | "enterprise"
      companyName?: string
      contactEmail?: string
      jobTitle?: string
      jobLocation?: string
      jobSalaryRange?: string
      jobApplyUrl?: string
      jobDescription?: string
    }

    const planType = body.planType || "pro_dev"
    const planAmounts: Record<string, number> = {
      pro_dev: 49900,
      job_listing: 2999900,
      recruiter: 2999900,
      enterprise: 9999900
    }
    const amount = planAmounts[planType]
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    if (planType === "pro_dev" && !session?.githubId) {
      return NextResponse.json({ error: "Login required for Pro Dev plan" }, { status: 401 })
    }

    if (isPlaceholderMode()) {
      return NextResponse.json({
        orderId: `placeholder_order_${Date.now()}`,
        amount,
        currency: "INR",
        placeholder: true
      })
    }

    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return NextResponse.json({
        orderId: `placeholder_order_${Date.now()}`,
        amount,
        currency: "INR",
        placeholder: true
      })
    }

    let userId: string | null = null

    if (planType === "pro_dev") {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("github_id", session?.githubId || 0)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "Please verify earnings first" }, { status: 400 })
      }
      userId = user.id
    } else if (planType === "job_listing") {
      if (!body.companyName || !body.contactEmail || !body.jobTitle || !body.jobApplyUrl) {
        return NextResponse.json(
          { error: "Company name, email, job title, and apply URL are required" },
          { status: 400 }
        )
      }
    } else if (!body.companyName || !body.contactEmail) {
      return NextResponse.json(
        { error: "companyName and contactEmail are required for recruiter plans" },
        { status: 400 }
      )
    }

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `${planType}_${Date.now()}`
    })

    const metadata = planType === "job_listing" ? {
      job_title: body.jobTitle,
      job_location: body.jobLocation || null,
      job_salary_range: body.jobSalaryRange || null,
      job_apply_url: body.jobApplyUrl,
      job_description: body.jobDescription || null
    } : {}

    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      amount,
      currency: "INR",
      plan_type: planType,
      payer_type: planType === "pro_dev" ? "developer" : planType === "job_listing" ? "employer" : "recruiter",
      payer_company: body.companyName || null,
      payer_email: body.contactEmail || null,
      razorpay_order_id: order.id,
      status: "pending",
      metadata
    })

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    )
  }
}
