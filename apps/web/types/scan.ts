export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Finding = {
    id: string;
    tool: "gitleaks" | "semgrep" | "custom";
    ruleId: string;
    title: string;
    severity: Severity;
    file: string;
    line?: number;
    snippet?: string;
    standards: string[];
    ai?: {
        explanation: string;
        impact: string;
        fix: string[];
        confidence: "LOW" | "MEDIUM" | "HIGH";
    };
};

export type ScanResult = {
    scanId: string;
    status: "QUEUED" | "RUNNING" | "DONE" | "FAILED";
    createdAt: string;
    summary?: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    findings?: Finding[];
    error?: string;
};