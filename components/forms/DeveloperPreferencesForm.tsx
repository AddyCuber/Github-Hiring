"use client"

import { useState } from "react"
import { UserRow } from "@/types"

type Props = {
  user: UserRow
}

function toMultiline(value: string[] | null) {
  return (value || []).join("\n")
}

export function DeveloperPreferencesForm({ user }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const portfolioLinks = String(formData.get("portfolioLinks") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)

    const testimonials = String(formData.get("testimonials") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)

    const payload = {
      availableForHire: formData.get("availableForHire") === "on",
      openToSponsorship: formData.get("openToSponsorship") === "on",
      profileTagline: String(formData.get("profileTagline") || ""),
      primaryLanguage: String(formData.get("primaryLanguage") || ""),
      location: String(formData.get("location") || ""),
      hireEmail: String(formData.get("hireEmail") || ""),
      portfolioLinks,
      testimonials
    }

    const res = await fetch("/api/profile/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const body = await res.json()
    setLoading(false)

    if (!res.ok) {
      setMessage(body.error || "Failed to save")
      return
    }

    setMessage("Preferences updated")
  }

  return (
    <form action={onSubmit} className="rounded-xl border border-border bg-white p-5">
      <h3 className="text-lg font-bold">Profile Controls (Pro Dev)</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          name="profileTagline"
          defaultValue={user.profile_tagline || ""}
          placeholder="Tagline"
          className="rounded-md border border-border px-3 py-2"
        />
        <input
          name="primaryLanguage"
          defaultValue={user.primary_language || ""}
          placeholder="Primary language"
          className="rounded-md border border-border px-3 py-2"
        />
        <input
          name="location"
          defaultValue={user.location || ""}
          placeholder="Location"
          className="rounded-md border border-border px-3 py-2"
        />
        <input
          name="hireEmail"
          defaultValue={user.hire_email || ""}
          placeholder="Hiring contact email"
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" name="availableForHire" defaultChecked={user.available_for_hire} />
        Available for hire
      </label>

      <label className="mt-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="openToSponsorship" defaultChecked={user.open_to_sponsorship} />
        Open to sponsorship
      </label>

      <textarea
        name="portfolioLinks"
        defaultValue={toMultiline(user.portfolio_links)}
        rows={3}
        className="mt-4 w-full rounded-md border border-border px-3 py-2"
        placeholder="Portfolio links (one per line)"
      />

      <textarea
        name="testimonials"
        defaultValue={toMultiline(user.testimonials)}
        rows={3}
        className="mt-3 w-full rounded-md border border-border px-3 py-2"
        placeholder="Testimonials (one per line)"
      />

      <button disabled={loading} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Saving..." : "Save Profile Controls"}
      </button>

      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </form>
  )
}
