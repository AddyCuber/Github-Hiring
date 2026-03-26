"use client"

import Script from "next/script"
import Link from "next/link"
import { useState } from "react"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function PostJobPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [companyName, setCompanyName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobLocation, setJobLocation] = useState("")
  const [jobSalaryRange, setJobSalaryRange] = useState("")
  const [jobApplyUrl, setJobApplyUrl] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!companyName || !contactEmail || !jobTitle || !jobApplyUrl) {
      setMessage("Please fill in all required fields.")
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: "job_listing",
          companyName,
          contactEmail,
          jobTitle,
          jobLocation,
          jobSalaryRange,
          jobApplyUrl,
          jobDescription
        })
      })

      const orderBody = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderBody.error || "Failed to create order")

      if (orderBody.placeholder) {
        setSuccess(true)
        setMessage("Demo mode: Your job listing would be created after payment.")
        return
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderBody.amount,
        currency: "INR",
        name: "SponsorsRank",
        description: "Job Listing — 30 days",
        order_id: orderBody.orderId,
        prefill: { email: contactEmail },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/webhooks/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          })

          if (!verifyRes.ok) {
            const verifyBody = await verifyRes.json()
            setMessage(verifyBody.error || "Payment verification failed")
            return
          }

          setSuccess(true)
          setMessage("Job listing published! It will appear on the job board shortly.")
        }
      })

      rzp.open()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <h1 className="text-3xl font-black">Job Listed!</h1>
          <p className="mt-3 text-slate-600">{message}</p>
          <Link href="/jobs" className="mt-6 inline-block rounded-md bg-primary px-5 py-3 font-semibold text-white">
            View Job Board
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight">Post a Job Listing</h1>
        <p className="mt-2 text-slate-600">
          Reach verified OSS maintainers and the recruiters who hire them. <strong>$299/month</strong> for 30 days on the job board.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold">Company Name *</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Vercel"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Contact Email *</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hiring@company.com"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">Job Title *</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Open Source Engineer"
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold">Location</label>
              <input
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="e.g. Remote / San Francisco"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Salary Range</label>
              <input
                value={jobSalaryRange}
                onChange={(e) => setJobSalaryRange(e.target.value)}
                placeholder="e.g. $150k-$200k"
                className="mt-1 w-full rounded-md border border-border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">Application URL *</label>
            <input
              type="url"
              value={jobApplyUrl}
              onChange={(e) => setJobApplyUrl(e.target.value)}
              placeholder="https://company.com/careers/role"
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="What the role involves, requirements, what makes your team unique..."
              rows={4}
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
            />
          </div>

          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-sm font-semibold">Job Listing — $299/month</p>
            <p className="text-xs text-slate-600">Your listing appears on the job board and homepage for 30 days. Visible to all developers and recruiters on SponsorsRank.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Processing..." : "Pay & Publish — $299"}
          </button>

          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>
      </div>
    </>
  )
}
