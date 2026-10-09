import Link from "next/link";
import { ReactNode } from "react";

function ProductIcon({ children }: { children: ReactNode }) {
    return (
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
            {children}
        </span>
    );
}

function UploadIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 16V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5" />
        </svg>
    );
}

function ScanIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V5a1 1 0 0 1 1-1h2" />
            <path d="M17 4h2a1 1 0 0 1 1 1v2" />
            <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
            <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
            <path d="M7 12h10" />
        </svg>
    );
}

function BrainIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 6a3 3 0 0 1 5-2.2A3 3 0 0 1 18 6v10a4 4 0 0 1-4 4h-1" />
            <path d="M8 6a3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3" />
            <path d="M8 6v12" />
            <path d="M12 8h2" />
            <path d="M12 14h3" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

export default function ProductPage() {
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
                    <Link href="/product" className="text-slate-950">
                        Product
                    </Link>
                    <Link href="/pricing" className="transition hover:text-slate-950">
                        Pricing
                    </Link>
                </div>
            </nav>

            <section className="rounded-3xl border border-white/80 bg-white p-8 shadow-xl shadow-slate-200/70">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                    <ScanIcon />
                    Product overview
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
                    AuditOps turns raw findings into audit-ready compliance intelligence.
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                    Built for engineering, security, and compliance teams that cannot afford last-minute VAPT and audit fire drills.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-2xl font-black text-slate-950">How it works</h2>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {[
                        ["1. Upload", "Upload a repository zip or connect source control later.", <UploadIcon key="upload" />],
                        ["2. Scan", "Run proven security scanners and custom compliance rules.", <ScanIcon key="scan" />],
                        ["3. Explain", "AI explains impact, compliance mapping, and remediation steps.", <BrainIcon key="brain" />],
                    ].map(([title, body, icon]) => (
                        <div key={String(title)} className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm">
                            <ProductIcon>{icon}</ProductIcon>
                            <h3 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h3>
                            <p className="mt-3 leading-7 text-slate-600">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-10">
                <h2 className="text-2xl font-black text-slate-950">Use cases</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {[
                        "Pre-VAPT readiness checks",
                        "Audit evidence preparation",
                        "Developer remediation guidance",
                        "Security review before production release",
                        "SOC2 and ISO control mapping",
                        "Continuous compliance visibility",
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-700 shadow-sm">
                            <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                                <CheckIcon />
                            </span>
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-10 rounded-3xl border border-white/80 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300">
                <h2 className="text-2xl font-black">Why AuditOps is different</h2>
                <p className="mt-4 max-w-3xl leading-8 text-slate-300">
                    Existing tools are strong at detection. AuditOps focuses on what happens after detection:
                    compliance mapping, explanation, prioritization, and remediation guidance.
                </p>
            </section>
        </main>
    );
}