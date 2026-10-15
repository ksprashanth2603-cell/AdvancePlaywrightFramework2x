import { expect, test } from '@playwright/test';
import { analyzeFailure } from '../../ai/agents/rcaAgents';
import { rcaDemoFailure } from './demoState';

function expectFailureAnalysisResult(result: Awaited<ReturnType<typeof analyzeFailure>>): void {
    if (result.status === 'unavailable') {
        expect(result.reason).toBe('missing_api_key');
        return;
    }

    expect(['critical', 'high', 'medium', 'low']).toContain(result.data.severity);
    expect(['P0', 'P1', 'P2', 'P3']).toContain(result.data.priority);
    expect(result.data.rootCause.trim()).not.toBe('');
    expect(result.data.fixes.length).toBeGreaterThan(0);
}

test('analyzes a failed booking assertion when AI credentials are configured', async ({}, testInfo) => {
    const result = await analyzeFailure(rcaDemoFailure);
    await testInfo.attach('root-cause-analysis', {
        body: JSON.stringify({ failure: rcaDemoFailure, result }, null, 2),
        contentType: 'application/json',
    });

    expect(['available', 'unavailable']).toContain(result.status);
    expectFailureAnalysisResult(result);
});