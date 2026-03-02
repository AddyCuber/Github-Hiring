import Link from "next/link"
import { isPlaceholderMode, placeholderJobs } from "@/lib/placeholders"
import { createAdminSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function JobsPage() {
  let jobs = placeholderJobs

  if (!isPlaceholderMode()) {
    const supabase = createAdminSupabaseClient()
    if (supabase) {
      const { data } = await supabase
        .from("job_listings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50)
      jobs = data || placeholderJobs
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-black tracking-tight">OSS Talent Job Board</h1>
      <p className="mt-2 text-slate-600">Sponsored jobs targeting maintainers with proven OSS monetization.</p>

      <div className="mt-6 space-y-3">
        {jobs.map((job: any) => (
          <article key={job.id} className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{job.title}</h2>
                <p className="text-sm text-slate-600">
                  {job.company_name}
                  {job.location ? ` • ${job.location}` : ""}
                  {job.salary_range ? ` • ${job.salary_range}` : ""}
                </p>
              </div>
              <Link href={job.apply_url} target="_blank" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
                Apply
              </Link>
            </div>
            {job.description && <p className="mt-3 text-sm text-slate-700">{job.description}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}
