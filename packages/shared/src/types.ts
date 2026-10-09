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

export type ScanStatus = "QUEUED" | "RUNNING" | "DONE" | "FAILED";

export type ScanResult = {
    scanId: string;
    status: ScanStatus;
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