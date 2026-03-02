import Image from "next/image"
import Link from "next/link"
import { LeaderboardRow } from "@/types"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { earningsTier, formatCurrency } from "@/lib/format"

type Props = {
    rows: LeaderboardRow[]
    showExact: boolean
}

export function ModernLeaderboardTable({ rows, showExact }: Props) {
    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5 text-sm">
                    <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Rank</th>
                            <th className="px-6 py-4 font-medium">Developer</th>
                            <th className="px-6 py-4 font-medium">Total Earnings</th>
                            <th className="px-6 py-4 font-medium">MRR</th>
                            <th className="px-6 py-4 font-medium">Sponsors</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rows.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-white/[0.02] transition-colors duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 font-mono text-blue-400 font-bold">
                                        #{user.rank}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/profile/${user.github_username}`} className="flex items-center gap-4 group">
                                        <div className="relative">
                                            <Image
                                                src={user.avatar_url || "https://avatars.githubusercontent.com/u/0?v=4"}
                                                alt={user.github_username}
                                                width={44}
                                                height={44}
                                                className="rounded-full ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all duration-200"
                                            />
                                            {user.has_verified_badge && (
                                                <div className="absolute -bottom-1 -right-1">
                                                    <VerifiedBadge />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                                                {user.name || user.github_username}
                                            </span>
                                            <span className="text-xs text-slate-500">@{user.github_username}</span>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                                    {showExact || user.has_verified_badge
                                        ? formatCurrency(user.total_earnings_usd)
                                        : earningsTier(user.total_earnings_usd)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                    <span className="text-blue-400 font-semibold">{formatCurrency(user.monthly_recurring_usd)}</span>
                                    <span className="text-slate-500 text-xs ml-1">/mo</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                                    {user.sponsor_count.toLocaleString("en-US")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
