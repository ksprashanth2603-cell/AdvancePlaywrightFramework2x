const fs = require('fs');
const path = require('path');
const { Formatter } = require('@cucumber/cucumber');

class CucumberTTAFormatter extends Formatter {
    constructor(options) {
        super(options);
        this.reportPath = path.join(process.cwd(), 'tta-report', 'cucumber-report.html');
        this.indexPath = path.join(process.cwd(), 'tta-report', 'index.html');
        this.startTime = Date.now();
    }

    async finished() {
        await super.finished();
        const results = this.getResults();
        this.writeReport(results);
    }

    getResults() {
        return this.eventDataCollector.getTestCaseAttempts()
            .filter(attempt => !attempt.willBeRetried)
            .map(attempt => {
                const { pickle, gherkinDocument, testCase, stepResults, worstTestStepResult } = attempt;
                const gherkinScenario = gherkinDocument.feature?.children
                    .flatMap(child => child.scenario ? [child.scenario] : [])
                    .find(scenario => scenario.id === pickle.astNodeIds[0]);

                return {
                    feature: gherkinDocument.feature?.name || 'Unknown feature',
                    scenario: pickle.name,
                    tags: pickle.tags.map(tag => tag.name),
                    status: this.getStatus(worstTestStepResult?.status),
                    durationMs: this.getDurationMs(worstTestStepResult),
                    error: worstTestStepResult?.message || worstTestStepResult?.exception?.message,
                    steps: testCase.testSteps.map(testStep => {
                        const stepResult = stepResults[testStep.id];
                        const pickleStep = pickle.steps.find(step => step.id === testStep.pickleStepId);
                        const gherkinStep = gherkinScenario?.steps?.find(step => step.id === testStep.pickleStepId);

                        return {
                            keyword: gherkinStep?.keyword || 'Given',
                            text: gherkinStep?.text || pickleStep?.text || '',
                            durationMs: this.getDurationMs(stepResult),
                            status: this.getStatus(stepResult?.status),
                            error: stepResult?.message || stepResult?.exception?.message,
                        };
                    }),
                };
            });
    }

    getStatus(status) {
        switch (status) {
            case 'PASSED': return 'passed';
            case 'FAILED': return 'failed';
            case 'SKIPPED': return 'skipped';
            default: return 'undefined';
        }
    }

    getDurationMs(result) {
        return result?.duration?.nanos ? Math.ceil(result.duration.nanos / 1_000_000) : 0;
    }

    writeReport(results) {
        const total = results.length;
        const passed = results.filter(result => result.status === 'passed').length;
        const failed = results.filter(result => result.status === 'failed').length;
        const skipped = results.filter(result => result.status === 'skipped').length;

        fs.mkdirSync(path.dirname(this.reportPath), { recursive: true });

        const rows = results.map(result => `
            <tr class="${result.status}">
                <td>${this.escapeHtml(result.feature)}</td>
                <td>${this.escapeHtml(result.scenario)}</td>
                <td>${this.escapeHtml(result.tags.join(', ') || '—')}</td>
                <td class="status ${result.status}">${result.status}</td>
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
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .card strong { font-size: 24px; display: block; }
        .card.passed strong { color: #059669; }
        .card.failed strong { color: #dc2626; }
        .card.skipped strong { color: #6b7280; }
        table { width: calc(100% - 40px); margin: 0 20px 20px; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        th { background: #ecfdf5; color: #065f46; }
        tr.failed td { background: #fef2f2; }
        .status { text-transform: capitalize; font-weight: 700; }
        .status.passed { color: #059669; }
        .status.failed { color: #dc2626; }
        .status.skipped { color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 TTA Cucumber Report</h1>
        <div>Generated: ${new Date().toLocaleString()} | ${total} scenarios</div>
    </div>
    <div class="summary">
        <div class="card passed"><span>Passed</span><strong>${passed}</strong></div>
        <div class="card failed"><span>Failed</span><strong>${failed}</strong></div>
        <div class="card skipped"><span>Skipped</span><strong>${skipped}</strong></div>
        <div class="card"><span>Duration</span><strong>${this.formatDuration(Date.now() - this.startTime)}</strong></div>
    </div>
    <table>
        <thead><tr><th>Feature</th><th>Scenario</th><th>Tags</th><th>Status</th><th>Duration</th><th>Error</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>
</body>
</html>`;

        fs.writeFileSync(this.reportPath, html);
        fs.writeFileSync(this.indexPath, '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=cucumber-report.html"></head><body><a href="cucumber-report.html">Open TTA Cucumber Report</a></body></html>');
        console.log(`✅ TTA Cucumber report generated: ${this.reportPath}`);
    }

    formatDuration(ms) {
        return `${Math.max(0, Math.floor(ms / 1000))}s`;
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = CucumberTTAFormatter;
