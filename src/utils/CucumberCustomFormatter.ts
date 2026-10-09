import { Formatter, type IFormatterOptions } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';

type CucumberStatus = 'passed' | 'failed' | 'skipped' | 'undefined';

interface GherkinStepLike {
    id: string;
    keyword?: string;
    text?: string;
}

interface ScenarioResult {
    feature: string;
    scenario: string;
    uri: string;
    tags: string[];
    status: CucumberStatus;
    durationMs: number;
    steps: StepResult[];
    error?: string;
}

interface StepResult {
    keyword: string;
    text: string;
    status: CucumberStatus;
    durationMs: number;
    error?: string;
}

export default class CucumberTTAFormatter extends Formatter {
    private readonly reportPath = path.join(process.cwd(), 'tta-report', 'cucumber-report.html');
    private readonly indexPath = path.join(process.cwd(), 'tta-report', 'index.html');
    private readonly startTime = Date.now();

    constructor(options: IFormatterOptions) {
        super(options);
    }

    async finished(): Promise<void> {
        await super.finished();
        const results = this.getResults();
        this.writeReport(results);
    }

    private getResults(): ScenarioResult[] {
        const attempts = this.eventDataCollector.getTestCaseAttempts();

        return attempts
            .filter(attempt => !attempt.willBeRetried)
            .map(attempt => {
                const pickle = attempt.pickle;
                const feature = attempt.gherkinDocument?.feature?.name ?? 'Unknown feature';
                const scenario = pickle.name;
                const status = this.getStatus(this.getAttemptStatus(attempt));
                const steps = attempt.testCase.testSteps.map((testStep, index) => {
                    const stepResult = attempt.stepResults[testStep.id];
                    const pickleStep = pickle.steps[index];
                    const gherkinStep = this.getGherkinStep(attempt.gherkinDocument, testStep.pickleStepId);
                    const keyword = gherkinStep?.keyword?.trim() || 'Given';
                    const text = gherkinStep?.text || pickleStep?.text || '';

                    return {
                        keyword,
                        text,
                        status: this.getStatus(stepResult?.status),
                        durationMs: stepResult?.duration?.nanos ? Math.ceil(stepResult.duration.nanos / 1_000_000) : 0,
                        error: stepResult?.message || stepResult?.exception?.message,
                    };
                });

                return {
                    feature,
                    scenario,
                    uri: pickle.uri,
                    tags: pickle.tags.map(tag => tag.name),
                    status,
                    durationMs: this.getDurationMs(attempt.worstTestStepResult),
                    steps,
                    error: this.getAttemptError(attempt),
                };
            });
    }

    private getStatus(status?: string): CucumberStatus {
        switch (status) {
            case 'PASSED': return 'passed';
            case 'FAILED': return 'failed';
            case 'SKIPPED': return 'skipped';
            default: return 'undefined';
        }
    }

    private getAttemptStatus(attempt: { worstTestStepResult?: { status?: string } }): string | undefined {
        return attempt.worstTestStepResult?.status;
    }

    private getGherkinStep(gherkinDocument: any, pickleStepId?: string): GherkinStepLike | undefined {
        const scenarios = gherkinDocument.feature?.children
            .flatMap((child: any) => child.scenario ? [child.scenario] : []);

        return scenarios?.flatMap((scenario: any) => scenario.steps || [])
            .find((step: GherkinStepLike) => step.id === pickleStepId);
    }

    private getDurationMs(result?: { duration?: { nanos?: number } }): number {
        return result?.duration?.nanos ? Math.ceil(result.duration.nanos / 1_000_000) : 0;
    }

    private getAttemptError(attempt: { worstTestStepResult?: { message?: string; exception?: { message?: string } } }): string | undefined {
        return attempt.worstTestStepResult?.message || attempt.worstTestStepResult?.exception?.message;
    }

    private writeReport(results: ScenarioResult[]): void {
        const total = results.length;
        const passed = results.filter(result => result.status === 'passed').length;
        const failed = results.filter(result => result.status === 'failed').length;
        const skipped = results.filter(result => result.status === 'skipped').length;

        fs.mkdirSync(path.dirname(this.reportPath), { recursive: true });

        const rows = results.map((result) => `
            <tr class="${result.status}">
                <td>${this.escapeHtml(result.feature)}</td>
                <td>${this.escapeHtml(result.scenario)}</td>
                <td>${this.escapeHtml(result.tags.join(', ') || '—')}</td>
                <td>${this.escapeHtml(result.status)}</td>
                <td>${result.durationMs} ms</td>
                <td>${this.escapeHtml(result.error || '—')}</td>
            </tr>`).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTA Cucumber Report</title>
    <style>
        body { font-family: Segoe UI, Arial, sans-serif; margin: 0; background: #f3f4f6; color: #111827; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 28px; }
        .header h1 { margin: 0 0 6px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .card strong { font-size: 24px; display: block; }
        .card.passed strong { color: #059669; }
        .card.failed strong { color: #dc2626; }
        .card.skipped strong { color: #6b7280; }
        .table-wrap { padding: 0 20px 20px; overflow: auto; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        th { background: #ecfdf5; color: #065f46; }
        tr.failed td { background: #fef2f2; }
        .steps { color: #4b5563; font-size: 13px; }
        .steps div { margin-top: 6px; }
        .status { text-transform: capitalize; font-weight: 600; }
        .status.passed { color: #059669; }
        .status.failed { color: #dc2626; }
        .status.skipped { color: #6b7280; }
        .empty { padding: 40px; text-align: center; color: #6b7280; }
        .meta { color: #6b7280; font-size: 13px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 TTA Cucumber Report</h1>
        <div class="meta">Generated: ${new Date().toLocaleString()} | ${total} scenarios</div>
    </div>
    <div class="summary">
        <div class="card passed"><span>Passed</span><strong>${passed}</strong></div>
        <div class="card failed"><span>Failed</span><strong>${failed}</strong></div>
        <div class="card skipped"><span>Skipped</span><strong>${skipped}</strong></div>
        <div class="card"><span>Duration</span><strong>${this.formatDuration(Date.now() - this.startTime)}</strong></div>
    </div>
    <div class="table-wrap">
        ${total > 0 ? `<table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Scenario</th>
                    <th>Tags</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>` : '<div class="empty">No scenarios were executed.</div>'}
    </div>
</body>
</html>`;

        fs.writeFileSync(this.reportPath, html);
        fs.writeFileSync(this.indexPath, `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=cucumber-report.html"></head><body><a href="cucumber-report.html">Open TTA Cucumber Report</a></body></html>`);
        console.log(`✅ TTA Cucumber report generated: ${this.reportPath}`);
    }

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        return `${seconds}s`;
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
