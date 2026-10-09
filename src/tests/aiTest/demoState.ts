import type { FlakyStatusChange } from '../../ai/agents/flakyAnalyzer';
import type { FailureAnalysisInput } from '../../ai/agents/rcaAgents';

export const flakyDemoChanges: FlakyStatusChange[] = [
    {
        testName: 'booking create API',
        previousStatus: 'passed',
        currentStatus: 'failed',
    },
];

export const rcaDemoFailure: FailureAnalysisInput = {
    testTitle: 'booking create API returns a created booking',
    assertion: 'expect(response.status()).toBe(200)',
    expected: '200',
    actual: '500',
};

export const selfHealUsernameSelectors = [
    '[data-testid="username"]',
    '[data-test="username"]',
] as const;