import Link from "next/link"

export function RetroHero() {
    return (
        <section className="relative px-4 pt-32 pb-16 text-center border-b border-border">
            <div className="mx-auto max-w-4xl">
                <div className="inline-block px-3 py-1 mb-6 text-[10px] font-black uppercase tracking-[0.2em] border border-primary text-primary bg-primary-muted">
                    Operational Intelligence
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-8 uppercase leading-[0.9]">
                    Verified <br />
                    <span className="text-primary italic">Source Revenue</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-12 font-medium leading-relaxed">
                    The professional standard for tracking GitHub Sponsors maintainers.
                    Real-time intelligence for recruiters and technical talent acquisition.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/recruiters" className="retro-button retro-button-primary w-full sm:w-auto px-10 py-4 text-sm">
                        ACCESS TERMINAL
                    </Link>
                    <Link href="/leaderboard" className="retro-button retro-button-outline w-full sm:w-auto px-10 py-4 text-sm">
                        VIEW RANKINGS
                    </Link>
                </div>

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-8 text-left">
                    {[
                        { label: "VERIFIED USERS", value: "2,450+" },
                        { label: "TOTAL REVENUE", value: "$4.2M" },
                        { label: "JOBS POSTED", value: "185" },
                        { label: "AVG SPONSORSHIP", value: "$142" }
                    ].map((stat) => (
                        <div key={stat.label}>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
