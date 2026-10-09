import Ajv, { type AnySchema } from 'ajv';
import { getAIProviderConfig } from './config/providers';
import { LLMClient } from './llmClient';
import { createLogger } from '@utils/logger';

export type AgentResult<T> =
    | { status: 'available'; data: T }
    | { status: 'unavailable'; reason: 'missing_api_key' | 'provider_error' | 'invalid_output' };

export interface AgentDefinition<TInput, TOutput> {
    name: string;
    prompt: string | ((input: TInput) => string);
    schema: AnySchema;
}

const ajv = new Ajv({ allErrors: true, strict: false });
const log = createLogger('AgentFactory');

function parseJson(content: string): unknown {
    const normalized = content
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');
    return JSON.parse(normalized);
}

export function createAgent<TInput, TOutput>(
    definition: AgentDefinition<TInput, TOutput>,
): (input: TInput) => Promise<AgentResult<TOutput>> {
    const config = getAIProviderConfig();
    const client = new LLMClient(config);
    const validate = ajv.compile<TOutput>(definition.schema);

    return async (input: TInput): Promise<AgentResult<TOutput>> => {
        if (!config.apiKey) {
            return { status: 'unavailable', reason: 'missing_api_key' };
        }

        const userPrompt = typeof definition.prompt === 'string'
            ? definition.prompt
            : definition.prompt(input);
        let correction: string | undefined;

        for (let attempt = 0; attempt < 2; attempt++) {
            let response;
            try {
                response = await client.generateJson(
                    { systemPrompt: 'Return only a JSON value matching the requested schema.', userPrompt, correction },
                    { maxTokens: config.maxTokens, timeoutMs: config.timeoutMs },
                );
            } catch {
                log.warn(`agent=${definition.name} provider=${config.provider} model=${config.model} unavailable`);
                return { status: 'unavailable', reason: 'provider_error' };
            }

            let output: unknown;
            try {
                output = parseJson(response.content);
            } catch (error) {
                correction = error instanceof Error ? error.message : 'Invalid JSON';
                continue;
            }

            if (validate(output)) {
                return { status: 'available', data: output as TOutput };
            }

            correction = ajv.errorsText(validate.errors, { separator: '; ' });
        }

        log.warn(`agent=${definition.name} provider=${config.provider} model=${config.model} invalid_output`);
        return { status: 'unavailable', reason: 'invalid_output' };
    };
}