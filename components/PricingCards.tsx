import Link from "next/link"

export function PricingCards() {
    const plans = [
        {
            name: "Standard",
            price: "$0",
            description: "Baseline visibility for open source maintainers.",
            features: ["Leaderboard placement", "Public revenue estimates", "Basic profile tagging"],
            cta: "AUTHENTICATE",
            href: "/verify",
            highlight: false
        },
        {
            name: "Professional",
            price: "$5",
            description: "Advanced analytics and hiring telemetry.",
            features: ["Exact API revenue data", "Hire/Sponsor status flags", "Shortlist integration", "Embeddable badge"],
            cta: "UPGRADE ACCESS",
            href: "/pro",
            highlight: true
        },
        {
            name: "Enterprise",
            price: "$149",
            description: "Full talent pipeline for recruiting teams.",
            features: ["Unlimited talent filtering", "CSV/CRM data export", "Direct contact pipeline", "API access"],
            cta: "REQUEST TERMINAL",
            href: "/recruiters",
            highlight: false
        }
    ]

    return (
        <section className="px-4 pb-24">
            <div className="mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-foreground bg-foreground">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`flex flex-col p-8 bg-white border-r border-foreground last:border-r-0 ${plan.highlight ? "bg-primary-muted" : ""
                                }`}
                        >
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-black tabular-nums">{plan.price}</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">/mo</span>
                            </div>
                            <p className="text-sm font-bold text-foreground mb-8 min-h-[40px] leading-tight italic">{plan.description}</p>

                            <ul className="space-y-3 mb-12 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-xs font-bold uppercase tracking-tight">
                                        <span className="text-primary mt-1">→</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`retro-button ${plan.highlight ? 'retro-button-primary' : 'retro-button-outline'} w-full text-xs uppercase tracking-widest`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
