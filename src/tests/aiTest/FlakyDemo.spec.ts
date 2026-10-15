import { expect, test } from '@playwright/test';
import { analyzeFlaky } from '../../ai/agents/flakyAnalyzer';
import { flakyDemoChanges } from './demoState';

function expectFlakyAnalysisResult(result: Awaited<ReturnType<typeof analyzeFlaky>>): void {
    if (result.status === 'unavailable') {
        expect(result.reason).toBe('missing_api_key');
        return;
    }

    expect(result.data.summary.trim()).not.toBe('');
    expect(result.data.summary.length).toBeLessThanOrEqual(500);
}

test('summarizes a flaky test status change when AI credentials are configured', async ({}, testInfo) => {
    const result = await analyzeFlaky({ changes: flakyDemoChanges });
    await testInfo.attach('flaky-analysis', {
        body: JSON.stringify({ changes: flakyDemoChanges, result }, null, 2),
        contentType: 'application/json',
    });

    expect(['available', 'unavailable']).toContain(result.status);
    expectFlakyAnalysisResult(result);
});