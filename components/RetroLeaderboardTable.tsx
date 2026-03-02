import Image from "next/image"
import Link from "next/link"
import { LeaderboardRow } from "@/types"
import { VerifiedBadge } from "@/components/VerifiedBadge"
import { formatCurrency } from "@/lib/format"

interface Props {
    rows: LeaderboardRow[]
    showExact?: boolean
}

export function RetroLeaderboardTable({ rows, showExact = false }: Props) {
    return (
        <div className="w-full overflow-hidden border border-foreground bg-white">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-foreground bg-muted">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-16">Rank</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Developer</th>
                            <th className="hidden px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground md:table-cell">Sponsors</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.id}
                                className="group border-b border-border hover:bg-primary-muted transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <span className="text-xl font-black text-foreground tabular-nums opacity-20 group-hover:opacity-100 transition-opacity">
                                        {String(row.rank).padStart(2, '0')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Image
                                                src={row.avatar_url || "https://avatars.githubusercontent.com/u/0?v=4"}
                                                alt={row.github_username}
                                                width={40}
                                                height={40}
                                                className="rounded-none border border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] grayscale group-hover:grayscale-0 transition-all"
                                            />
                                            {row.is_verified && (
                                                <div className="absolute -right-1 -top-1">
                                                    <VerifiedBadge />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground leading-none">{row.name || row.github_username}</p>
                                            <p className="text-xs font-bold text-muted-foreground mt-1 lowercase">@{row.github_username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden px-6 py-4 md:table-cell">
                                    <span className="text-sm font-bold text-foreground">{row.sponsor_count}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="inline-flex flex-col items-end">
                                        <p className="text-lg font-black text-primary">
                                            {formatCurrency(showExact ? row.total_earnings_usd : row.total_earnings_usd * 0.9)}
                                        </p>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {row.has_verified_badge ? "Verified API Data" : "Public Estimate"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
