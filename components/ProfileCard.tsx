import Image from "next/image"
import Link from "next/link"
import { UserRow } from "@/types"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { earningsTier, formatCurrency } from "@/lib/format"

type Props = {
  user: UserRow
}

export function ProfileCard({ user }: Props) {
  const hasActiveBadge =
    user.has_verified_badge && user.badge_expires_at ? new Date(user.badge_expires_at) > new Date() : false
  const portfolioLinks = user.portfolio_links || []
  const testimonials = user.testimonials || []

  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Image
          src={user.avatar_url || "https://avatars.githubusercontent.com/u/0?v=4"}
          alt={user.github_username}
          width={96}
          height={96}
          className="rounded-full"
        />

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-primary">{user.name || user.github_username}</h1>
            {hasActiveBadge && <VerifiedBadge />}
            {user.available_for_hire && (
              <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                Available for hire
              </span>
            )}
            {user.open_to_sponsorship && (
              <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                Open to sponsorship
              </span>
            )}
          </div>

          {user.profile_tagline && <p className="text-sm font-medium text-slate-700">{user.profile_tagline}</p>}
          <p className="text-slate-600">{user.bio || "No bio provided."}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {user.primary_language || "Language not set"} {user.location ? `• ${user.location}` : ""}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs uppercase text-slate-500">Lifetime Earnings</div>
              <div className="text-lg font-bold text-primary">
                {hasActiveBadge ? formatCurrency(user.total_earnings_usd) : earningsTier(user.total_earnings_usd)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs uppercase text-slate-500">Monthly Recurring</div>
              <div className="text-lg font-bold text-primary">{formatCurrency(user.monthly_recurring_usd)}/mo</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs uppercase text-slate-500">Sponsors</div>
              <div className="text-lg font-bold text-primary">{user.sponsor_count.toLocaleString("en-US")}</div>
            </div>
          </div>

          {portfolioLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Portfolio</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {portfolioLinks.map((link) => (
                  <Link
                    key={link}
                    href={link}
                    target="_blank"
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    {link.replace(/^https?:\/\//, "")}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {testimonials.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Testimonials</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {testimonials.map((quote) => (
                  <li key={quote} className="rounded-md border border-border bg-slate-50 p-3">
                    “{quote}”
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
              href={`https://github.com/sponsors/${user.github_username}`}
              target="_blank"
            >
              Sponsor this developer
            </Link>
            <Link
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
              href={user.github_url || `https://github.com/${user.github_username}`}
              target="_blank"
            >
              View GitHub Profile
            </Link>
            {user.hire_email && (
              <Link
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
                href={`mailto:${user.hire_email}`}
              >
                Contact for hiring
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
