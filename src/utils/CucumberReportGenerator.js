const fs = require('fs');
const path = require('path');

const reportDir = path.join(process.cwd(), 'tta-report');
const jsonPath = path.join(reportDir, 'cucumber-results.json');
const reportPath = path.join(reportDir, 'cucumber-report.html');
const indexPath = path.join(reportDir, 'index.html');
const historyPath = path.join(reportDir, 'history.html');

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDuration(ms) {
    if (Number.isNaN(ms) || ms <= 0) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
}

function formatTimestamp(date = new Date()) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(date);
}

function getScenarioStatus(scenario) {
    if (!scenario.steps?.length) return 'undefined';
    if (scenario.steps.some(step => step.result?.status === 'FAILED')) return 'failed';
    if (scenario.steps.some(step => step.result?.status === 'SKIPPED')) return 'skipped';
    return 'passed';
}

function getScenarioError(scenario) {
    const failedStep = scenario.steps?.find(step => step.result?.status === 'FAILED');
    return failedStep?.result?.error_message || '';
}

function getScenarioSteps(scenario) {
    return (scenario.steps || []).map((step, index) => ({
        index,
        keyword: step.keyword || 'Given',
        text: step.text || '',
        status: (step.result?.status || 'UNDEFINED').toLowerCase(),
        duration: step.result?.duration || 0,
        error: step.result?.error_message || '',
        embeddings: step.embeddings || [],
    }));
}

function buildReport(results) {
    const total = results.length;
    const passed = results.filter(result => result.status === 'passed').length;
    const failed = results.filter(result => result.status === 'failed').length;
    const skipped = results.filter(result => result.status === 'skipped').length;
    const passRate = total ? ((passed / total) * 100).toFixed(1) : '0';
    const generatedAt = new Date();
    const runId = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, '0')}${String(generatedAt.getDate()).padStart(2, '0')}_${String(generatedAt.getHours()).padStart(2, '0')}${String(generatedAt.getMinutes()).padStart(2, '0')}${String(generatedAt.getSeconds()).padStart(2, '0')}`;

    const rows = results.map((result, index) => `
        <tr class="test-row ${result.status}" data-status="${result.status}">
            <td class="col-sno">${index + 1}</td>
            <td class="col-feature">${escapeHtml(result.feature)}</td>
            <td class="col-scenario"><button class="test-name-link" type="button" onclick="toggleScenarioDetails('${result.id}')">${escapeHtml(result.scenario)}</button></td>
            <td class="col-tags">${(result.tags.length ? result.tags : ['—']).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ')}</td>
            <td class="col-duration">${formatDuration(result.durationMs)}</td>
            <td class="col-status"><span class="status-badge ${result.status}">${escapeHtml(result.status)}</span></td>
            <td class="col-error">${escapeHtml(result.error || '—')}</td>
        </tr>
        <tr class="detail-row" id="detail-${result.id}" style="display: none;">
            <td colspan="7">
                <div class="detail-panel">
                    <div class="detail-header">${escapeHtml(result.feature)} › ${escapeHtml(result.scenario)}</div>
                    ${result.steps.length ? `<div class="step-list">${result.steps.map(step => `
                        <div class="step-item ${step.status}">
                            <div class="step-line">
                                <span class="step-keyword">${escapeHtml(step.keyword)}</span>
                                <span class="step-text">${escapeHtml(step.text)}</span>
                                <span class="step-duration">${formatDuration(step.duration)}</span>
                                <span class="step-status ${step.status}">${escapeHtml(step.status)}</span>
                            </div>
                            ${step.error ? `<pre class="step-error">${escapeHtml(step.error)}</pre>` : ''}
                        </div>`).join('')}</div>` : '<div class="empty-state">No steps were recorded.</div>'}
                </div>
            </td>
        </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTA Automation Report</title>
    <style>
        :root { --primary: #059669; --primary-dark: #047857; --primary-bg: #ecfdf5; --success: #22c55e; --danger: #ef4444; --warning: #f59e0b; --gray-50: #f8fafc; --gray-200: #e2e8f0; --gray-500: #64748b; --gray-700: #334155; --shadow: 0 4px 6px -1px rgb(0 0 0 / .12); }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, Segoe UI, Arial, sans-serif; background: linear-gradient(135deg, #f1f5f9 0%, #ecfdf5 100%); color: var(--gray-700); }
        .header { position: relative; overflow: hidden; padding: 36px 20px; text-align: center; color: #fff; background: linear-gradient(135deg, var(--primary) 0%, #0d9488 50%, var(--primary-dark) 100%); }
        .header::before { content: ''; position: absolute; inset: -50% -20%; background: radial-gradient(circle, rgba(255,255,255,.18) 0%, transparent 60%); animation: pulse 15s ease-in-out infinite; }
        .header h1, .header p { position: relative; margin: 0; }
        .header h1 { font-size: 32px; }
        .header p { margin-top: 8px; color: rgba(255,255,255,.9); }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.1); opacity: .3; } }
        .container { max-width: 1400px; margin: 0 auto; padding: 24px 20px 40px; }
        .stats-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin: -25px 0 20px; }
        .stat-card { padding: 18px; border-radius: 12px; background: #fff; box-shadow: var(--shadow); text-align: center; }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--gray-700); }
        .stat-card.passed .stat-value { color: var(--success); }
        .stat-card.failed .stat-value { color: var(--danger); }
        .stat-card.skipped .stat-value { color: var(--gray-500); }
        .meta-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 20px; padding: 16px; border-radius: 12px; background: rgba(255,255,255,.9); box-shadow: var(--shadow); }
        .meta-item { display: flex; flex-direction: column; gap: 2px; }
        .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--gray-500); }
        .filters { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; padding: 14px 16px; border-radius: 10px; background: #fff; box-shadow: var(--shadow); }
        .filter-group { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .filter-group strong { margin-right: 4px; }
        .filter-group label { display: inline-flex; align-items: center; gap: 4px; }
        .table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: var(--shadow); }
        table { width: 100%; border-collapse: collapse; min-width: 1100px; }
        th, td { padding: 12px 14px; border-bottom: 1px solid var(--gray-200); text-align: left; vertical-align: top; }
        th { background: #ecfdf5; color: var(--primary-dark); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
        .test-row.failed td { background: #fef2f2; }
        .test-row.skipped td { background: #f8fafc; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .status-badge.passed { background: #dcfce7; color: #166534; }
        .status-badge.failed { background: #fee2e2; color: #991b1b; }
        .status-badge.skipped { background: #e2e8f0; color: #475569; }
        .status-badge.undefined { background: #fef3c7; color: #92400e; }
        .tag { display: inline-block; margin: 2px; padding: 3px 7px; border-radius: 999px; background: #f1f5f9; color: var(--gray-600); font-size: 10px; }
        .test-name-link { border: 0; padding: 0; background: none; color: var(--primary-dark); font: inherit; font-weight: 600; cursor: pointer; text-align: left; }
        .detail-row td { padding: 0; }
        .detail-panel { padding: 18px; background: #f8fafc; border-left: 4px solid #10b981; }
        .detail-header { font-weight: 700; margin-bottom: 12px; }
        .step-list { display: grid; gap: 10px; }
        .step-item { border: 1px solid var(--gray-200); border-radius: 8px; background: #fff; padding: 10px 12px; }
        .step-item.failed { border-left: 4px solid var(--danger); }
        .step-item.passed { border-left: 4px solid var(--success); }
        .step-item.skipped { border-left: 4px solid var(--gray-500); }
        .step-line { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .step-keyword { font-weight: 700; color: var(--primary-dark); }
        .step-text { flex: 1; min-width: 180px; }
        .step-duration { color: var(--gray-500); font-size: 12px; }
        .step-status { font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .step-status.passed { color: #166534; }
        .step-status.failed { color: #991b1b; }
        .step-status.skipped { color: #475569; }
        .step-error { margin: 10px 0 0; white-space: pre-wrap; color: #991b1b; background: #fef2f2; padding: 10px; border-radius: 6px; overflow-x: auto; }
        @media (max-width: 700px) { .container { padding: 16px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 Custom Automation Report</h1>
        <p>Playwright Framework • Cucumber Results</p>
    </div>
    <div class="container">
        <div class="stats-dashboard">
            <div class="stat-card"><div class="stat-value">${total}</div><div>Total Scenarios</div></div>
            <div class="stat-card passed"><div class="stat-value">${passed}</div><div>Passed</div></div>
            <div class="stat-card failed"><div class="stat-value">${failed}</div><div>Failed</div></div>
            <div class="stat-card skipped"><div class="stat-value">${skipped}</div><div>Skipped</div></div>
            <div class="stat-card"><div class="stat-value">${passRate}%</div><div>Pass Rate</div></div>
            <div class="stat-card"><div class="stat-value">${formatDuration(results.reduce((sum, result) => sum + result.durationMs, 0))}</div><div>Duration</div></div>
        </div>
        <div class="meta-section">
            <div class="meta-item"><span class="meta-label">Environment</span><span>🌐 ${process.env.TEST_ENV || 'UAT'}</span></div>
            <div class="meta-item"><span class="meta-label">Browser</span><span>🌍 ${process.env.BROWSER || 'Chromium'}</span></div>
            <div class="meta-item"><span class="meta-label">Platform</span><span>${process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux'}</span></div>
            <div class="meta-item"><span class="meta-label">Run ID</span><span>${runId}</span></div>
            <div class="meta-item"><span class="meta-label">Generated</span><span>${formatTimestamp(generatedAt)}</span></div>
        </div>
        <div class="filters">
            <div class="filter-group">
                <strong>📊 Status:</strong>
                <label><input type="checkbox" class="status-filter" value="passed" checked> Passed</label>
                <label><input type="checkbox" class="status-filter" value="failed" checked> Failed</label>
                <label><input type="checkbox" class="status-filter" value="skipped" checked> Skipped</label>
            </div>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>S.No</th><th>Feature</th><th>Scenario</th><th>Tags</th><th>Duration</th><th>Status</th><th>Error</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    </div>
    <script>
        const statusFilters = document.querySelectorAll('.status-filter');
        function filterRows() {
            const selected = new Set([...statusFilters].filter(input => input.checked).map(input => input.value));
            document.querySelectorAll('.test-row').forEach(row => {
                row.style.display = selected.has(row.dataset.status) ? '' : 'none';
                const detail = document.getElementById('detail-' + row.querySelector('.test-name-link').onclick.toString().match(/toggleScenarioDetails\\('([^']+)'\\)/)?.[1]);
                if (detail) detail.style.display = selected.has(row.dataset.status) ? 'none' : 'none';
            });
        }
        statusFilters.forEach(input => input.addEventListener('change', filterRows));
        function toggleScenarioDetails(id) {
            const detail = document.getElementById('detail-' + id);
            detail.style.display = detail.style.display === 'none' ? '' : 'none';
        }
    </script>
</body>
</html>`;
}

function parseFeature(feature, index) {
    const scenarios = feature.elements || [];
    return scenarios.map(scenario => {
        const status = getScenarioStatus(scenario);
        const steps = getScenarioSteps(scenario);
        const durationMs = (scenario.steps || []).reduce((total, step) => total + (step.result?.duration || 0), 0);
        const tags = feature.tags?.map(tag => tag.name) || scenario.tags?.map(tag => tag.name) || [];
        return {
            id: `${index}-${scenario.name}`,
            feature: feature.name,
            scenario: scenario.name,
            tags,
            status,
            durationMs,
            error: getScenarioError(scenario),
            steps,
        };
    });
}

function generateHistory(results) {
    const newestReport = `report_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}_${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}${String(new Date().getSeconds()).padStart(2, '0')}.html`;
    const files = fs.readdirSync(reportDir)
        .filter(file => file.startsWith('report_') && file.endsWith('.html'))
        .sort()
        .reverse();

    const historyHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>TTA Report History</title><style>body{font-family:Segoe UI,sans-serif;background:#f5f5f5;padding:24px}h1{margin:0 0 20px}.item{background:#fff;padding:14px 18px;margin-bottom:8px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.08)}a{color:#047857;text-decoration:none;font-weight:600}</style></head><body><h1>📊 TTA Report History</h1>${files.map(file => `<div class="item"><a href="${file}">${file}</a></div>`).join('') || '<div class="item">No previous reports.</div>'}</body></html>`;
    fs.writeFileSync(historyPath, historyHtml);
    return newestReport;
}

try {
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const featureResults = (json || []).flatMap(parseFeature);
    const results = featureResults.filter(result => result.scenario);
    fs.mkdirSync(reportDir, { recursive: true });

    const timestamp = new Date();
    const namedReportPath = path.join(reportDir, `report_${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}${String(timestamp.getSeconds()).padStart(2, '0')}.html`);
    const html = buildReport(results);
    fs.writeFileSync(namedReportPath, html);
    fs.writeFileSync(reportPath, html);
    fs.writeFileSync(indexPath, `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${path.basename(namedReportPath)}"><title>TTA Report - Latest</title></head><body><p>Redirecting to <a href="${path.basename(namedReportPath)}">latest report</a>...</p></body></html>`);
    generateHistory(results);
    console.log(`✅ TTA Cucumber report generated: ${namedReportPath}`);
} catch (error) {
    console.error(`❌ Failed to generate TTA Cucumber report: ${error.message}`);
    process.exitCode = 1;
}
