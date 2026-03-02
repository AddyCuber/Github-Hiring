import Image from "next/image"
import Link from "next/link"
import { LeaderboardRow } from "@/types"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { earningsTier, formatCurrency } from "@/lib/format"

type Props = {
  rows: LeaderboardRow[]
  showExact: boolean
}

export function LeaderboardTable({ rows, showExact }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Developer</th>
            <th className="px-4 py-3">Total Earnings</th>
            <th className="px-4 py-3">MRR</th>
            <th className="px-4 py-3">Sponsors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold">#{user.rank}</td>
              <td className="px-4 py-3">
                <Link href={`/profile/${user.github_username}`} className="flex items-center gap-3">
                  <Image
                    src={user.avatar_url || "https://avatars.githubusercontent.com/u/0?v=4"}
                    alt={user.github_username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-primary">{user.name || user.github_username}</span>
                    {user.has_verified_badge && <VerifiedBadge />}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 font-medium">
                {showExact || user.has_verified_badge
                  ? formatCurrency(user.total_earnings_usd)
                  : earningsTier(user.total_earnings_usd)}
              </td>
              <td className="px-4 py-3">{formatCurrency(user.monthly_recurring_usd)}/mo</td>
              <td className="px-4 py-3">{user.sponsor_count.toLocaleString("en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
