# AI Prompt and Agent Architecture

This project uses a lightweight AI agent layer that sits on top of the Playwright automation framework. The goal is not to replace the test runner, but to add structured intelligence for common quality tasks such as flaky test summaries, root-cause analysis, and synthetic test data generation.

## 1. Why the agent factory exists

The engine is built around one reusable factory: `createAgent` in `src/ai/agentFactory.ts`.

It centralizes the following responsibilities:

- reads the active AI provider settings from environment variables
- creates a provider-specific client for the LLM
- builds the user prompt from the agent definition
- calls the model with a strict JSON-only instruction
- parses the response
- validates the output with Ajv against a schema
- retries once when the response is malformed or invalid
- returns a typed result with success or failure state

This gives every AI-assisted feature the same behavior: typed output, safe validation, and graceful fallback when the provider is unavailable or the JSON is invalid.

## 2. Core architecture

### A. Provider configuration

The provider setup lives in `src/ai/config/providers.ts`.

It decides:

- which LLM provider is active (`deepseek`, `openrouter`, `groq`, `openai`, `anthropic`)
- which model to call
- which base URL to use
- which API key environment variable to read
- timeout and token limits

This keeps the rest of the framework provider-agnostic.

### B. LLM client

The actual HTTP request layer is in `src/ai/llmClient.ts`.

It does the following:

- sends the request to the chosen provider endpoint
- sets the correct headers for OpenAI-style and Anthropic-style APIs
- sends a `systemPrompt` plus a `userPrompt`
- supports retry logic for transient failures
- parses provider-specific response shapes
- returns normalized JSON content and token usage information

### C. Agent factory

The backbone is `createAgent`.

A definition looks like this:

```ts
createAgent<{ scenario: string }, BookingPayload>({
  name: 'test-data-generator',
  prompt: ({ scenario }) => 'Create realistic booking data for ' + scenario,
  schema: bookingSchema,
});
```

The factory does five critical things:

1. validates the API key is configured
2. builds the prompt text from input
3. sends the prompt to the LLM client
4. parses JSON output
5. validates it with Ajv before returning

If the output is invalid, it sends a correction prompt and retries once.

## 3. Prompt and validation pattern

The project uses a consistent pattern for all AI agents:

- a descriptive agent name
- a prompt template that describes the task clearly
- a strict JSON schema that defines valid output
- validation with Ajv before any result is accepted

This is important because it reduces hallucinated output and keeps the automation logic stable.

## 4. Existing agent examples

### Flaky test analyzer

File: `src/ai/agents/flakyAnalyzer.ts`

Purpose:

- summarize status changes between two runs
- identify a flaky test in a concise summary
- keep output rigid and easy to render in a report

### Root-cause analysis agent

File: `src/ai/agents/rcaAgents.ts`

Purpose:

- inspect a failed test assertion
- classify severity and priority
- suggest a root cause and fix hints
- return structured JSON only

### Synthetic booking data generator

File: `src/ai/agents/testDataGenerator.ts`

Purpose:

- generate realistic API payloads for test data creation
- enforce booking payload rules with a schema
- keep the generated data useful for API-based automation flows

## 5. How this fits the Playwright framework

The AI layer is designed as a supporting intelligence layer, not a replacement for the core testing framework.

The usual flow is:

1. A test fails, is flaky, or needs generated data.
2. The Playwright test attaches real state and evidence.
3. A matched agent receives the structured input.
4. The agent calls the configured LLM provider.
5. The output is validated and returned as typed data.
6. The result can be logged, attached to the custom report, or used in the next step of the flow.

In this repo, you can see this pattern in `src/tests/aiTest/SelfHealDemo.spec.ts`, where a selector fallback strategy is used to recover from a stale locator and attach a self-heal analysis payload for reporting.

## 6. Best practices for prompt design

When creating new prompts, keep them explicit and narrow:

- tell the model exactly what it should do
- specify the required output shape
- avoid hidden assumptions
- define date, format, or enum constraints clearly
- prefer JSON-only responses for machine-driven workflows

Good prompt design is what makes the agent factory robust.

## 7. How to add a new agent

To add a new agent:

1. decide the input and output types
2. define the JSON schema for the response
3. create the agent with `createAgent`
4. use a prompt that is specific and constrained
5. validate the output with Ajv before trusting it
6. wire it into the relevant Playwright flow or reporter

This keeps the project modular and predictable.

## 8. Summary

The AI layer in this repository is built around a clear and reusable pattern:

- config -> LLM client -> agent factory -> validated JSON output

That pattern allows the automation framework to integrate AI in a safe, deterministic, and report-friendly way without letting the LLM control core test execution.
