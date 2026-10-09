"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useScan } from "@/hooks/useScan";
import { Finding, Severity } from "@/types/scan";

const severityClasses: Record<Severity, string> = {
    CRITICAL: "border-red-200 bg-red-50 text-red-700",
    HIGH: "border-orange-200 bg-orange-50 text-orange-700",
    MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
    LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function SeverityChip({ severity }: { severity: Severity }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${severityClasses[severity]}`}
        >
            {severity}
        </span>
    );
}

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}

function FindingDrawer({
    finding,
    onClose,
}: {
    finding: Finding | null;
    onClose: () => void;
}) {
    if (!finding) return null;

    const standards = finding.standards ?? [];

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close finding details"
                onClick={onClose}
                className="absolute inset-0 h-full w-full cursor-default"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                            Finding details
                        </p>
                        <h2 className="mt-1 line-clamp-1 text-lg font-extrabold text-slate-950">
                            {finding.title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <SeverityChip severity={finding.severity} />

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {finding.tool}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {finding.ai?.confidence || "LOW"} confidence
                        </span>
                    </div>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="font-bold text-slate-500">File</dt>
                                <dd className="mt-1 break-all font-mono text-slate-900">
                                    {finding.file}
                                    {finding.line ? `:${finding.line}` : ""}
                                </dd>
                            </div>

                            <div>
                                <dt className="font-bold text-slate-500">Rule</dt>
                                <dd className="mt-1 font-mono text-slate-900">
                                    {finding.ruleId}
                                </dd>
                            </div>

                            <div>
                                <dt className="font-bold text-slate-500">Standards</dt>
                                <dd className="mt-1 text-slate-900">
                                    {standards.length > 0 ? standards.join(", ") : "Not mapped"}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section>
                        <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
                            AI explanation
                        </h3>
                        <p className="mt-3 leading-7 text-slate-700">
                            {finding.ai?.explanation || "Not available."}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
                            Impact
                        </h3>
                        <p className="mt-3 leading-7 text-slate-700">
                            {finding.ai?.impact || "Not assessed."}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
                            Fix steps
                        </h3>

                        <ol className="mt-3 space-y-3">
                            {(finding.ai?.fix || ["Review this issue manually."]).map((step, index) => (
                                <li key={index} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
                                        {index + 1}
                                    </span>

                                    <span className="leading-6 text-slate-700">
                                        {step}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {finding.snippet && (
                        <section>
                            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400">
                                Snippet
                            </h3>

                            <pre className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                                <code>{finding.snippet}</code>
                            </pre>
                        </section>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default function ScanPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data, statusText } = useScan(id);

    const [selected, setSelected] = useState<Finding | null>(null);
    const [severity, setSeverity] = useState<Severity | "ALL">("ALL");
    const [search, setSearch] = useState("");

    const findings = data?.findings || [];

    const filteredFindings = useMemo(() => {
        return findings.filter((finding) => {
            const severityMatch = severity === "ALL" || finding.severity === severity;
            const text = search.trim().toLowerCase();
            const standards = finding.standards ?? [];

            const searchMatch =
                !text ||
                finding.title.toLowerCase().includes(text) ||
                finding.file.toLowerCase().includes(text) ||
                finding.ruleId.toLowerCase().includes(text) ||
                standards.join(" ").toLowerCase().includes(text);

            return severityMatch && searchMatch;
        });
    }, [findings, severity, search]);

    const summaryCards = data?.summary
        ? [
              ["Total", data.summary.total, "text-slate-950"],
              ["Critical", data.summary.critical, "text-red-600"],
              ["High", data.summary.high, "text-orange-600"],
              ["Medium", data.summary.medium, "text-amber-600"],
              ["Low", data.summary.low, "text-emerald-600"],
          ]
        : [];

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-6 sm:px-8">
            <nav className="mb-8 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-slate-950">
                    <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
                        A
                    </span>
                    AuditOps
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                        <BackIcon />
                        Back to Upload
                    </Link>

                    <Link
                        href="/pricing"
                        className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 sm:inline-flex"
                    >
                        View Plans
                    </Link>
                </div>
            </nav>

            <header className="mb-8 rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                            Scan report
                        </p>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Security findings summary
                        </h1>

                        <p className="mt-3 text-sm text-slate-500">
                            Scan ID:{" "}
                            <code className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-slate-800">
                                {id}
                            </code>
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <p className="font-bold text-slate-500">Current status</p>
                        <p className="mt-1 text-lg font-black text-slate-950">
                            {statusText}
                        </p>
                    </div>
                </div>

                {data?.error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        Error: {data.error}
                    </div>
                )}
            </header>

            {!data?.summary && !data?.error && (
                <section className="rounded-3xl border border-white/80 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 size-12 animate-pulse rounded-2xl bg-blue-100" />
                    <h2 className="text-xl font-black text-slate-950">
                        Scan is running
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Results will appear here once the backend returns findings for this scan.
                    </p>
                </section>
            )}

            {data?.summary && (
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {summaryCards.map(([label, value, valueClass]) => (
                        <div
                            key={label}
                            className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                                {label}
                            </div>

                            <div className={`mt-3 text-4xl font-black ${valueClass}`}>
                                {value}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            <section className="mt-8 rounded-3xl border border-white/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-950">
                            Findings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Filter by severity or search by title, file, rule, or standard.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={severity}
                            onChange={(event) => setSeverity(event.target.value as Severity | "ALL")}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="ALL">All severities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <SearchIcon />
                            </span>

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search findings..."
                                className="min-w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:min-w-80"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4">Severity</th>
                                    <th className="px-5 py-4">Title</th>
                                    <th className="px-5 py-4">File</th>
                                    <th className="px-5 py-4">Tool</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredFindings.map((finding, index) => (
                                    <tr
                                        key={finding.id || `${finding.ruleId}-${finding.file}-${index}`}
                                        onClick={() => setSelected(finding)}
                                        className="cursor-pointer transition hover:bg-blue-50/50"
                                    >
                                        <td className="px-5 py-4">
                                            <SeverityChip severity={finding.severity} />
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-bold text-slate-900">
                                                {finding.title}
                                            </p>
                                            <p className="mt-1 font-mono text-xs text-slate-400">
                                                {finding.ruleId}
                                            </p>
                                        </td>

                                        <td className="max-w-md px-5 py-4">
                                            <p className="truncate font-mono text-xs text-slate-600">
                                                {finding.file}
                                                {finding.line ? `:${finding.line}` : ""}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 font-semibold text-slate-600">
                                            {finding.tool}
                                        </td>
                                    </tr>
                                ))}

                                {filteredFindings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-14 text-center">
                                            <div className="mx-auto max-w-md">
                                                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-2xl">
                                                    {data?.status === "DONE" ? "✓" : "⏳"}
                                                </div>

                                                <p className="mt-4 font-bold text-slate-900">
                                                    {data?.status === "DONE"
                                                        ? "No matching findings found"
                                                        : "Scan is still running"}
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    {data?.status === "DONE"
                                                        ? "Try clearing the search text or changing the severity filter."
                                                        : "Findings will appear here once the scan produces results."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <FindingDrawer finding={selected} onClose={() => setSelected(null)} />
        </main>
    );
}