import type { AnySchema } from 'ajv';
import { createAgent } from '../agentFactory';

export type RcaSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RcaPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface FailureAnalysisInput {
    testTitle: string;
    assertion: string;
    expected?: string;
    actual?: string;
}

export interface RcaVerdict {
    severity: RcaSeverity;
    priority: RcaPriority;
    rootCause: string;
    fixes: string[];
}

const rcaVerdictSchema: AnySchema = {
    type: 'object',
    required: ['severity', 'priority', 'rootCause', 'fixes'],
    properties: {
        severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
        priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
        rootCause: { type: 'string', minLength: 1 },
        fixes: { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } },
    },
    additionalProperties: false,
};

export const analyzeFailure = createAgent<FailureAnalysisInput, RcaVerdict>({
    name: 'root-cause-analysis',
    prompt: input => [
        'Analyze this failed test using only the supplied assertion facts.',
        'Do not infer missing implementation details or request source code.',
        'Choose severity from critical, high, medium, low and priority from P0, P1, P2, P3.',
        `Failure facts: ${JSON.stringify(input)}`,
    ].join('\n'),
    schema: rcaVerdictSchema,
});