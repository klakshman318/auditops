import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as unzipper from "unzipper";
import { Finding, ScanResult, Severity } from "../common/types";
import { AiExplainerService } from "../ai/ai-explainer/ai-explainer.service";

@Injectable()
export class ScansService {
    private store = new Map<string, ScanResult>();
    private baseDir = path.join(process.cwd(), "tmp_scans");

    constructor(private readonly aiExplainer: AiExplainerService) {
        fs.mkdirSync(this.baseDir, { recursive: true });
    }

    async enqueueZipScan(file: Express.Multer.File): Promise<string> {
        const scanId = randomUUID();

        this.store.set(scanId, {
            scanId,
            status: "QUEUED",
            createdAt: new Date().toISOString(),
        });

        void this.processScan(scanId, file);

        return scanId;
    }

    getScan(scanId: string): ScanResult {
        return (
            this.store.get(scanId) || {
                scanId,
                status: "FAILED",
                createdAt: new Date().toISOString(),
                error: "Scan not found",
            }
        );
    }

    private async processScan(scanId: string, file: Express.Multer.File) {
        const scanDir = path.join(this.baseDir, scanId);
        const repoDir = path.join(scanDir, "repo");
        const zipPath = path.join(scanDir, "repo.zip");

        try {
            this.update(scanId, { status: "RUNNING" });

            fs.mkdirSync(repoDir, { recursive: true });
            fs.writeFileSync(zipPath, file.buffer);

            await this.extractZip(zipPath, repoDir);

            let findings: Finding[] = [];

            findings = findings.concat(await this.runGitleaks(repoDir));
            findings = findings.concat(await this.runSemgrep(repoDir));
            findings = findings.concat(await this.runCustomRules(repoDir));

            const enrichedFindings = await this.aiExplainer.explainSequentially(
                findings,
                repoDir,
            );

            const summary = this.summarize(enrichedFindings);

            fs.writeFileSync(
                path.join(scanDir, "report.json"),
                JSON.stringify({ summary, findings: enrichedFindings }, null, 2),
            );

            this.update(scanId, {
                status: "DONE",
                summary,
                findings: enrichedFindings,
            });
        } catch (error: any) {
            this.update(scanId, {
                status: "FAILED",
                error: error?.message || "Unknown scan failure",
            });
        }
    }

    private update(scanId: string, patch: Partial<ScanResult>) {
        const current = this.store.get(scanId);
        if (!current) return;
        this.store.set(scanId, { ...current, ...patch });
    }

    private extractZip(zipPath: string, destDir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: destDir }))
                .on("close", resolve)
                .on("error", reject);
        });
    }

    private execCommand(
        command: string,
        args: string[],
        cwd: string,
    ): Promise<{ stdout: string; stderr: string }> {
        return new Promise((resolve, reject) => {
            execFile(
                command,
                args,
                {
                    cwd,
                    maxBuffer: 50 * 1024 * 1024,
                },
                (error, stdout, stderr) => {
                    if (error) {
                        // Important: scanners often exit non-zero when findings exist.
                        // So we return output instead of fully failing.
                        return resolve({
                            stdout: String(stdout || ""),
                            stderr: String(stderr || error.message),
                        });
                    }

                    resolve({
                        stdout: String(stdout || ""),
                        stderr: String(stderr || ""),
                    });
                },
            );
        });
    }

    private async runGitleaks(repoDir: string): Promise<Finding[]> {
        const reportPath = path.join(repoDir, "..", "gitleaks.json");

        await this.execCommand(
            "gitleaks",
            [
                "detect",
                "--source",
                repoDir,
                "--report-format",
                "json",
                "--report-path",
                reportPath,
                "--no-git",
            ],
            repoDir,
        );

        if (!fs.existsSync(reportPath)) return [];

        const raw = fs.readFileSync(reportPath, "utf-8") || "[]";
        const data = JSON.parse(raw);

        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            id: randomUUID(),
            tool: "gitleaks",
            ruleId: item.RuleID || "SEC-SECRET",
            title: "Hardcoded secret detected",
            severity: "CRITICAL",
            file: item.File || "unknown",
            line: item.StartLine,
            snippet: item.Secret ? String(item.Secret).slice(0, 80) : undefined,
            standards: ["OWASP A02", "SOC2 CC6", "VAPT"],
        }));
    }

    private async runSemgrep(repoDir: string): Promise<Finding[]> {
        const reportPath = path.join(repoDir, "..", "semgrep.json");

        await this.execCommand(
            "semgrep",
            ["--config", "p/security-audit", "--json", "--output", reportPath, repoDir],
            repoDir,
        );

        if (!fs.existsSync(reportPath)) return [];

        const raw = fs.readFileSync(reportPath, "utf-8") || "{}";
        const data = JSON.parse(raw);

        const results = Array.isArray(data.results) ? data.results : [];

        return results.map((item: any) => ({
            id: randomUUID(),
            tool: "semgrep",
            ruleId: item.check_id || "SEM-SECURITY",
            title: item.extra?.message || "Security issue detected",
            severity: this.mapSemgrepSeverity(item.extra?.severity),
            file: item.path || "unknown",
            line: item.start?.line,
            snippet: item.extra?.lines
                ? String(item.extra.lines).slice(0, 300)
                : undefined,
            standards: ["OWASP", "VAPT"],
        }));
    }

    private async runCustomRules(repoDir: string): Promise<Finding[]> {
        const findings: Finding[] = [];
        const files = this.walkFiles(repoDir);

        for (const file of files) {
            const rel = path.relative(repoDir, file);
            const content = fs.readFileSync(file, "utf-8");

            if (content.includes("origin: '*'") || content.includes('origin: "*"')) {
                findings.push({
                    id: randomUUID(),
                    tool: "custom",
                    ruleId: "CUSTOM-CORS-001",
                    title: "Open CORS policy detected",
                    severity: "HIGH",
                    file: rel,
                    line: this.findLine(content, "origin"),
                    standards: ["OWASP", "SOC2 CC6", "VAPT"],
                });
            }

            if (
                content.includes("console.log") &&
                /password|token|secret|otp/i.test(content)
            ) {
                findings.push({
                    id: randomUUID(),
                    tool: "custom",
                    ruleId: "CUSTOM-LOG-001",
                    title: "Sensitive data may be logged",
                    severity: "HIGH",
                    file: rel,
                    line: this.findLine(content, "console.log"),
                    standards: ["OWASP A09", "SOC2 CC6", "VAPT"],
                });
            }
        }

        return findings;
    }

    private walkFiles(dir: string): string[] {
        const ignored = ["node_modules", ".git", ".next", "dist", "build"];
        const result: string[] = [];

        for (const entry of fs.readdirSync(dir)) {
            if (ignored.includes(entry)) continue;

            const full = path.join(dir, entry);
            const stat = fs.statSync(full);

            if (stat.isDirectory()) {
                result.push(...this.walkFiles(full));
            } else if (/\.(ts|tsx|js|jsx|json|env|yml|yaml)$/.test(entry)) {
                result.push(full);
            }
        }

        return result;
    }

    private findLine(content: string, keyword: string): number {
        const lines = content.split(/\r?\n/);
        const index = lines.findIndex((line) => line.includes(keyword));
        return index >= 0 ? index + 1 : 1;
    }

    private mapSemgrepSeverity(value?: string): Severity {
        const severity = String(value || "").toUpperCase();

        if (severity.includes("ERROR")) return "HIGH";
        if (severity.includes("WARNING")) return "MEDIUM";
        if (severity.includes("INFO")) return "LOW";

        return "MEDIUM";
    }

    private summarize(findings: Finding[]) {
        return {
            total: findings.length,
            critical: findings.filter((f) => f.severity === "CRITICAL").length,
            high: findings.filter((f) => f.severity === "HIGH").length,
            medium: findings.filter((f) => f.severity === "MEDIUM").length,
            low: findings.filter((f) => f.severity === "LOW").length,
        };
    }
}