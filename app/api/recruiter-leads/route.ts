import { NextResponse } from "next/server"
import { isPlaceholderMode } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyName?: string
      contactEmail?: string
      planInterest?: string
      notes?: string
    }

    if (!body.companyName || !body.contactEmail || !body.planInterest) {
      return NextResponse.json({ error: "companyName, contactEmail and planInterest are required" }, { status: 400 })
    }

    if (isPlaceholderMode()) {
      return NextResponse.json({ success: true, placeholder: true, message: "Lead captured in placeholder mode" })
    }

    const supabase = createAdminSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ success: true, placeholder: true, message: "Lead captured in placeholder mode" })
    }

    const { error } = await supabase.from("recruiter_leads").insert({
      company_name: body.companyName,
      contact_email: body.contactEmail,
      plan_interest: body.planInterest,
      notes: body.notes || null,
      status: "new"
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit lead" },
      { status: 500 }
    )
  }
}
