import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "$99/month",
        description: "For early teams and POCs.",
        icon: "rocket",
        features: [
            "Up to 5 repositories",
            "Code scanning",
            "Secrets detection",
            "Basic AI explanations",
            "JSON report export",
        ],
    },
    {
        name: "Growth",
        price: "$399/month",
        description: "For engineering and security teams.",
        icon: "shield",
        features: [
            "Up to 25 repositories",
            "Code and config scanning",
            "OWASP and SOC2 mapping",
            "AI remediation guidance",
            "Scan history",
            "Team access",
        ],
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For regulated enterprises.",
        icon: "building",
        features: [
            "Unlimited repositories",
            "ISO, SOC2, OWASP and VAPT mapping",
            "Private deployment",
            "SSO",
            "Custom policies",
            "Priority support",
        ],
    },
];

function PlanIcon({ type }: { type: string }) {
    if (type === "shield") {
        return (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
                <path d="M9 12l2 2 4-5" />
            </svg>
        );
    }

    if (type === "building") {
        return (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
                <path d="M15 9h4a1 1 0 0 1 1 1v11" />
                <path d="M8 8h3" />
                <path d="M8 12h3" />
                <path d="M8 16h3" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 14c-1.5 1.5-2 4-2 4s2.5-.5 4-2" />
            <path d="M14 5l5-2-2 5-9 9-3-3 9-9z" />
            <path d="M15 9l-3-3" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

export default function PricingPage() {
    return (
        <main className="mx-auto min-h-screen max-w-6xl px-6 py-6 sm:px-8">
            <nav className="mb-16 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-slate-950">
                    <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
                        A
                    </span>
                    AuditOps
                </Link>

                <div className="flex items-center gap-5 text-sm font-medium text-slate-600">
                    <Link href="/product" className="transition hover:text-slate-950">
                        Product
                    </Link>
                    <Link href="/pricing" className="text-slate-950">
                        Pricing
                    </Link>
                </div>
            </nav>

            <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-xl shadow-slate-200/70">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                    <PlanIcon type="shield" />
                    Pricing
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
                    Plans built around audit readiness.
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                    Pricing below is for validation and can be finalized with design partners.
                </p>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-3">
                {plans.map((plan) => {
                    const isGrowth = plan.name === "Growth";

                    return (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl border p-6 shadow-sm ${
                                isGrowth
                                    ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-300"
                                    : "border-white/80 bg-white text-slate-950"
                            }`}
                        >
                            {isGrowth && (
                                <div className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">
                                    Popular
                                </div>
                            )}

                            <span
                                className={`grid size-12 place-items-center rounded-2xl ${
                                    isGrowth ? "bg-white text-slate-950" : "bg-slate-950 text-white"
                                }`}
                            >
                                <PlanIcon type={plan.icon} />
                            </span>

                            <h2 className="mt-5 text-2xl font-black">{plan.name}</h2>

                            <div className="mt-4 text-4xl font-black">
                                {plan.price}
                            </div>

                            <p className={`mt-3 leading-7 ${isGrowth ? "text-slate-300" : "text-slate-600"}`}>
                                {plan.description}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-3">
                                        <span
                                            className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full ${
                                                isGrowth ? "bg-white text-slate-950" : "bg-emerald-100 text-emerald-700"
                                            }`}
                                        >
                                            <CheckIcon />
                                        </span>
                                        <span className={isGrowth ? "text-slate-200" : "text-slate-700"}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.name === "Enterprise" ? "/pricing" : "/"}
                                className={`mt-8 inline-flex w-full justify-center rounded-2xl px-5 py-3 text-sm font-bold transition ${
                                    isGrowth
                                        ? "bg-white text-slate-950 hover:bg-slate-100"
                                        : "bg-slate-950 text-white hover:bg-slate-800"
                                }`}
                            >
                                {plan.name === "Enterprise" ? "Contact Sales" : "Start Scan"}
                            </Link>
                        </div>
                    );
                })}
            </section>
        </main>
    );
}