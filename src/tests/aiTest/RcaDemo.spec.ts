import { expect, test } from '@playwright/test';
import { analyzeFailure } from '../../ai/agents/rcaAgents';
import { rcaDemoFailure } from './demoState';

test('analyzes a failed booking assertion', async ({}, testInfo) => {
    const result = await analyzeFailure(rcaDemoFailure);
    await testInfo.attach('root-cause-analysis', {
        body: JSON.stringify({ failure: rcaDemoFailure, result }, null, 2),
        contentType: 'application/json',
    });

    if (result.status === 'unavailable') {
        test.skip(true, `Root-cause analysis unavailable: ${result.reason}`);
        return;
    }

    expect(['critical', 'high', 'medium', 'low']).toContain(result.data.severity);
    expect(['P0', 'P1', 'P2', 'P3']).toContain(result.data.priority);
    expect(result.data.rootCause.trim()).not.toBe('');
    expect(result.data.fixes.length).toBeGreaterThan(0);
});