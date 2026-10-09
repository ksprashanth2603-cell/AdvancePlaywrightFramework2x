import type { AnySchema } from 'ajv';
import { createAgent } from '../agentFactory';

export interface FlakyStatusChange {
    testName: string;
    previousStatus: 'passed' | 'failed' | 'skipped' | 'timedOut';
    currentStatus: 'passed' | 'failed' | 'skipped' | 'timedOut';
}

export interface FlakyResult {
    summary: string;
}

const flakyResultSchema: AnySchema = {
    type: 'object',
    required: ['summary'],
    properties: {
        summary: { type: 'string', minLength: 1, maxLength: 500 },
    },
    additionalProperties: false,
};

export const analyzeFlaky = createAgent<{ changes: FlakyStatusChange[] }, FlakyResult>({
    name: 'flaky-test-summary',
    prompt: ({ changes }) => [
        'Summarize the supplied test status changes in one concise sentence.',
        'Name each affected test and describe its previous and current status.',
        'Do not recalculate counts or infer additional flaky tests.',
        `Status changes: ${JSON.stringify(changes)}`,
    ].join('\n'),
    schema: flakyResultSchema,
});