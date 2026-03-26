"use client"

import Script from "next/script"
import { useSession } from "next-auth/react"
import { useState } from "react"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

type PlanType = "pro_dev" | "recruiter" | "enterprise"

const PLAN_CONFIG: Record<PlanType, { label: string; amount: number; description: string }> = {
  pro_dev: { label: "Pro Dev", amount: 49900, description: "$5/mo equivalent billed in INR" },
  recruiter: { label: "Recruiter", amount: 2999900, description: "$299/mo equivalent billed in INR" },
  enterprise: { label: "Enterprise", amount: 9999900, description: "$999/mo equivalent billed in INR" }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [planType, setPlanType] = useState<PlanType>("pro_dev")
  const [companyName, setCompanyName] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  async function handlePayment() {
    if (planType === "pro_dev" && !session) {
      setMessage("Sign in and verify earnings first for Pro Dev")
      return
    }

    if (planType !== "pro_dev" && (!companyName || !contactEmail)) {
      setMessage("Company name and contact email are required for recruiter plans")
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          amount: PLAN_CONFIG[planType].amount,
          companyName,
          contactEmail
        })
      })

      const orderBody = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderBody.error || "Failed to create order")

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderBody.amount,
        currency: "INR",
        name: "SponsorsRank",
        description: `${PLAN_CONFIG[planType].label} Plan`,
        order_id: orderBody.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/webhooks/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          })

          const verifyBody = await verifyRes.json()
          if (!verifyRes.ok) {
            setMessage(verifyBody.error || "Payment verification failed")
            return
          }

          if (planType === "pro_dev" && verifyBody.username) {
            window.location.href = `/profile/${verifyBody.username}`
            return
          }

          setMessage("Subscription activated. Our team will send access details shortly.")
        }
      })

      rzp.open()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") return <div className="mx-auto max-w-3xl px-4 py-10">Loading...</div>

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Choose Plan</h1>

        <div className="mt-6 rounded-xl border border-border bg-white p-8">
          <label className="block text-sm font-semibold">Plan</label>
          <select
            className="mt-2 w-full rounded-md border border-border px-3 py-2"
            value={planType}
            onChange={(e) => setPlanType(e.target.value as PlanType)}
          >
            <option value="pro_dev">Pro Dev ($5/mo)</option>
            <option value="recruiter">Recruiter ($299/mo)</option>
            <option value="enterprise">Enterprise ($999/mo)</option>
          </select>

          <p className="mt-2 text-sm text-slate-600">{PLAN_CONFIG[planType].description}</p>

          {planType !== "pro_dev" && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
                className="rounded-md border border-border px-3 py-2"
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Work email"
                className="rounded-md border border-border px-3 py-2"
              />
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-primary py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Processing..." : `Pay ₹${(PLAN_CONFIG[planType].amount / 100).toLocaleString("en-IN")}`}
          </button>

          {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </div>
      </div>
    </>
  )
}
