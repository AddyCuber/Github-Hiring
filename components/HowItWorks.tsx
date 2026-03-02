export function HowItWorks() {
    const steps = [
        {
            id: "01",
            title: "AUTHENTICATE",
            description: "Connect your GitHub account via OAuth to establish identity and verify source eligibility."
        },
        {
            id: "02",
            title: "TELEMETRY",
            description: "Our system analyzes public and private revenue signals to generate verified earning reports."
        },
        {
            id: "03",
            title: "VISIBILITY",
            description: "Maintainers are ranked by verified revenue, providing recruiters with clear signal for technical hiring."
        }
    ]

    return (
        <section className="px-4 py-24 bg-[var(--background)] border-y border-foreground">
            <div className="mx-auto max-w-6xl">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-12 text-center">Protocol Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {steps.map((step) => (
                        <div key={step.id} className="relative pt-8 border-t border-border">
                            <span className="absolute -top-4 left-0 text-5xl font-black text-foreground opacity-5 italic tabular-nums">
                                {step.id}
                            </span>
                            <h3 className="text-lg font-black text-foreground mb-4 uppercase tracking-tighter italic">{step.title}</h3>
                            <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
