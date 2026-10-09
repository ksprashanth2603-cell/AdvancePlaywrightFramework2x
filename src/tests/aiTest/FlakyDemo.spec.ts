import { expect, test } from '@playwright/test';
import { analyzeFlaky } from '../../ai/agents/flakyAnalyzer';
import { flakyDemoChanges } from './demoState';

test('summarizes a flaky test status change', async ({}, testInfo) => {
    const result = await analyzeFlaky({ changes: flakyDemoChanges });
    await testInfo.attach('flaky-analysis', {
        body: JSON.stringify({ changes: flakyDemoChanges, result }, null, 2),
        contentType: 'application/json',
    });

    if (result.status === 'unavailable') {
        test.skip(true, `Flaky analysis unavailable: ${result.reason}`);
        return;
    }

    expect(result.data.summary.trim()).not.toBe('');
    expect(result.data.summary.length).toBeLessThanOrEqual(500);
});