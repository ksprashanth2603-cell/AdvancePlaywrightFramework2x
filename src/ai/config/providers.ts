import { envOr } from '@config/env';

export type AIProvider = 'deepseek' | 'openrouter' | 'groq' | 'openai' | 'anthropic';

export interface AIProviderConfig {
    provider: AIProvider;
    model: string;
    baseUrl: string;
    apiKey?: string;
    timeoutMs: number;
    maxTokens: number;
}

const providerDefaults: Record<AIProvider, { model: string; baseUrl: string; keyName: string }> = {
    deepseek: {
        model: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com',
        keyName: 'DEEPSEEK_API_KEY',
    },
    openrouter: {
        model: 'openai/gpt-4o-mini',
        baseUrl: 'https://openrouter.ai/api/v1',
        keyName: 'OPENROUTER_API_KEY',
    },
    groq: {
        model: 'llama-3.3-70b-versatile',
        baseUrl: 'https://api.groq.com/openai/v1',
        keyName: 'GROQ_API_KEY',
    },
    openai: {
        model: 'gpt-4o-mini',
        baseUrl: 'https://api.openai.com/v1',
        keyName: 'OPENAI_API_KEY',
    },
    anthropic: {
        model: 'claude-3-5-haiku-latest',
        baseUrl: 'https://api.anthropic.com/v1',
        keyName: 'ANTHROPIC_API_KEY',
    },
};

function positiveInteger(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getAIProviderConfig(): AIProviderConfig {
    const requestedProvider = envOr('AI_PROVIDER', 'deepseek').toLowerCase();
    if (!Object.hasOwn(providerDefaults, requestedProvider)) {
        throw new Error(`Unsupported AI_PROVIDER: ${requestedProvider}`);
    }

    const provider = requestedProvider as AIProvider;
    const defaults = providerDefaults[provider];
    const apiKey = envOr(defaults.keyName, '');

    return {
        provider,
        model: envOr('AI_MODEL', defaults.model),
        baseUrl: envOr('AI_BASE_URL', defaults.baseUrl).replace(/\/+$/, ''),
        apiKey: apiKey || undefined,
        timeoutMs: positiveInteger(envOr('AI_TIMEOUT_MS', '30000'), 30000),
        maxTokens: positiveInteger(envOr('AI_MAX_TOKENS', '512'), 512),
    };
}