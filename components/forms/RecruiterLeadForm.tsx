"use client"

import { useState } from "react"

export function RecruiterLeadForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const payload = {
      companyName: String(formData.get("companyName") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      planInterest: String(formData.get("planInterest") || "recruiter"),
      notes: String(formData.get("notes") || "")
    }

    const res = await fetch("/api/recruiter-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const body = await res.json()
    setLoading(false)

    if (!res.ok) {
      setMessage(body.error || "Unable to submit")
      return
    }

    setMessage("Lead submitted. We will contact you within 24 hours.")
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-xl border border-border bg-white p-5">
      <h3 className="text-lg font-bold">Request Recruiter Access</h3>
      <input
        name="companyName"
        required
        placeholder="Company name"
        className="w-full rounded-md border border-border px-3 py-2"
      />
      <input
        name="contactEmail"
        type="email"
        required
        placeholder="Work email"
        className="w-full rounded-md border border-border px-3 py-2"
      />
      <select name="planInterest" className="w-full rounded-md border border-border px-3 py-2">
        <option value="recruiter">Recruiter ($49/mo)</option>
        <option value="enterprise">Enterprise ($199/mo)</option>
      </select>
      <textarea
        name="notes"
        placeholder="What roles are you hiring for?"
        className="w-full rounded-md border border-border px-3 py-2"
        rows={3}
      />
      <button disabled={loading} className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Submitting..." : "Request Access"}
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </form>
  )
}
