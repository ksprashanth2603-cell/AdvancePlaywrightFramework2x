import type { AIProviderConfig } from './config/providers';
import { createLogger } from '@utils/logger';

export interface LLMRequest {
    systemPrompt: string;
    userPrompt: string;
    correction?: string;
}

export interface LLMResponse {
    content: string;
    inputTokens?: number;
    outputTokens?: number;
}

export interface LLMClientOptions {
    maxTokens: number;
    timeoutMs: number;
}

const log = createLogger('LLMClient');

export class LLMClient {
    constructor(private readonly config: AIProviderConfig) {}

    async generateJson(request: LLMRequest, options: LLMClientOptions): Promise<LLMResponse> {
        if (!this.config.apiKey) {
            throw new Error('AI provider key is not configured');
        }

        const startedAt = Date.now();
        let response: Response | undefined;
        let lastError: unknown;

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                response = await fetch(this.endpoint(), {
                    method: 'POST',
                    headers: this.headers(),
                    body: JSON.stringify(this.body(request, options.maxTokens)),
                    signal: AbortSignal.timeout(options.timeoutMs),
                });

                if (response.ok) {
                    break;
                }

                if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
                    continue;
                }

                throw new Error(`AI provider returned HTTP ${response.status}`);
            } catch (error) {
                lastError = error;
                if (attempt === 1) {
                    throw error;
                }
            }
        }

        if (!response?.ok) {
            throw lastError instanceof Error ? lastError : new Error('AI provider request failed');
        }

        const payload = await response.json() as Record<string, any>;
        const result = this.readResponse(payload);
        log.info(
            `provider=${this.config.provider} model=${this.config.model} latencyMs=${Date.now() - startedAt} ` +
            `inputTokens=${result.inputTokens ?? 'unknown'} outputTokens=${result.outputTokens ?? 'unknown'}`,
        );
        return result;
    }

    private endpoint(): string {
        return this.config.provider === 'anthropic'
            ? `${this.config.baseUrl}/messages`
            : `${this.config.baseUrl}/chat/completions`;
    }

    private headers(): Record<string, string> {
        if (this.config.provider === 'anthropic') {
            return {
                'content-type': 'application/json',
                'x-api-key': this.config.apiKey!,
                'anthropic-version': '2023-06-01',
            };
        }

        return {
            'content-type': 'application/json',
            authorization: `Bearer ${this.config.apiKey}`,
        };
    }

    private body(request: LLMRequest, maxTokens: number): Record<string, unknown> {
        const userPrompt = request.correction
            ? `${request.userPrompt}\n\nCorrect the previous response. Validation error: ${request.correction}`
            : request.userPrompt;

        if (this.config.provider === 'anthropic') {
            return {
                model: this.config.model,
                max_tokens: maxTokens,
                system: request.systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            };
        }

        return {
            model: this.config.model,
            max_tokens: maxTokens,
            messages: [
                { role: 'system', content: request.systemPrompt },
                { role: 'user', content: userPrompt },
            ],
        };
    }

    private readResponse(payload: Record<string, any>): LLMResponse {
        if (this.config.provider === 'anthropic') {
            const content = payload.content?.find((item: Record<string, unknown>) => item.type === 'text')?.text;
            if (typeof content !== 'string') {
                throw new Error('AI provider response did not contain text');
            }
            return {
                content,
                inputTokens: payload.usage?.input_tokens,
                outputTokens: payload.usage?.output_tokens,
            };
        }

        const content = payload.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
            throw new Error('AI provider response did not contain text');
        }
        return {
            content,
            inputTokens: payload.usage?.prompt_tokens,
            outputTokens: payload.usage?.completion_tokens,
        };
    }
}