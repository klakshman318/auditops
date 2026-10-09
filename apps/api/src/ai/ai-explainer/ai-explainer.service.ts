import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { Finding } from "../../common/types";

@Injectable()
export class AiExplainerService {
    private openai: OpenAI | null = null;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }

    async explainSequentially(
        findings: Finding[],
        repoRoot: string,
    ): Promise<Finding[]> {
        if (!this.openai) return findings;

        const maxFindings = Number(process.env.AI_MAX_FINDINGS || 15);
        const enriched: Finding[] = [];

        for (let i = 0; i < findings.length; i++) {
            const finding = findings[i];

            if (i >= maxFindings) {
                enriched.push(finding);
                continue;
            }

            try {
                const ai = await this.explainOne(finding, repoRoot);
                enriched.push({ ...finding, ai });
            } catch {
                enriched.push({
                    ...finding,
                    ai: {
                        explanation: "AI explanation unavailable for this finding.",
                        impact: "Manual review required.",
                        fix: ["Review the flagged code.", "Apply secure remediation."],
                        confidence: "LOW",
                    },
                });
            }
        }

        return enriched;
    }

    private getSnippet(repoRoot: string, file: string, line?: number): string | null {
        try {
            const safeFile = file.replace(/^\//, "");
            const absPath = path.join(repoRoot, safeFile);

            if (!fs.existsSync(absPath)) return null;

            const lines = fs.readFileSync(absPath, "utf-8").split(/\r?\n/);
            const center = line ? line - 1 : 0;
            const range = Number(process.env.AI_SNIPPET_LINES || 12);

            const start = Math.max(0, center - Math.floor(range / 2));
            const end = Math.min(lines.length, start + range);

            return lines.slice(start, end).join("\n");
        } catch {
            return null;
        }
    }

    private async explainOne(
        finding: Finding,
        repoRoot: string,
    ): Promise<NonNullable<Finding["ai"]>> {
        if (!this.openai) throw new Error("OpenAI not configured");

        const snippet = this.getSnippet(repoRoot, finding.file, finding.line);

        const systemPrompt = `
You are an enterprise security and compliance reviewer.
Explain findings conservatively.
Do not invent missing context.
Return strict JSON only with:
explanation, impact, fix, confidence.
confidence must be LOW, MEDIUM, or HIGH.
fix must be an array of 2 to 5 actionable steps.
`;

        const userPrompt = {
            finding: {
                title: finding.title,
                severity: finding.severity,
                file: finding.file,
                line: finding.line,
                ruleId: finding.ruleId,
                standards: finding.standards,
                tool: finding.tool,
            },
            codeSnippet: snippet,
            instruction: snippet
                ? "Explain based on finding and code snippet."
                : "No code snippet available. Explain only based on finding metadata.",
        };

        const response = await this.openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(userPrompt) },
            ],
        });

        const content = response.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);

        return {
            explanation: String(parsed.explanation || "No explanation available."),
            impact: String(parsed.impact || "Impact not assessed."),
            fix: Array.isArray(parsed.fix)
                ? parsed.fix.map(String).slice(0, 5)
                : ["Review finding.", "Apply secure remediation."],
            confidence: ["LOW", "MEDIUM", "HIGH"].includes(parsed.confidence)
                ? parsed.confidence
                : "LOW",
        };
    }
}