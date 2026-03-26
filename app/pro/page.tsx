import Link from "next/link"

export default function ProPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-black tracking-tight">Pro Dev Plan</h1>
      <p className="mt-2 text-slate-600">For maintainers who want to convert reputation into sponsorship and hiring opportunities.</p>

      <div className="mt-6 rounded-xl border border-border bg-white p-6">
        <div className="text-4xl font-black">$5/month</div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>Exact earnings visibility on leaderboard</li>
          <li>Available for hire and open to sponsorship flags</li>
          <li>Portfolio links and testimonials on profile</li>
          <li>Shareable embed widget and GitHub README badge</li>
          <li>Priority placement in recruiter search results</li>
          <li>Verified badge on leaderboard</li>
        </ul>
        <Link href="/checkout?plan=pro_dev" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 font-semibold text-white">
          Upgrade to Pro Dev
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-white p-6">
        <h2 className="text-xl font-bold">Hiring OSS developers?</h2>
        <p className="mt-2 text-sm text-slate-600">Post a job listing visible to every maintainer on SponsorsRank.</p>
        <Link href="/jobs/post" className="mt-4 inline-block rounded-md border border-border px-4 py-2 font-semibold">
          Post a Job — $299/mo
        </Link>
      </div>
    </div>
  )
}
