import Link from "next/link"

export function ModernHero() {
    return (
        <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center">
            {/* Decorative Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl">
                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6">
                    The Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">GitHub Sponsors</span> Leaderboard
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-slate-400 mb-10 leading-relaxed">
                    See who&apos;s making the most from open source. Verify your earnings with GitHub OAuth and unlock a premium verified badge.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/leaderboard"
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 border-2 border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                    >
                        View Leaderboard
                    </Link>
                    <Link
                        href="/verify"
                        className="inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent border-2 border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700"
                    >
                        Verify My Earnings
                    </Link>
                </div>
            </div>
        </section>
    )
}
