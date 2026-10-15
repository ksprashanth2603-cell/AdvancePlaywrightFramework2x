---
name: pre-pr-quality-gates
description: Run the repository's four mandatory quality reviews and prepare evidence before opening or updating a pull request.
---

# Pre-PR Quality Gates

Run all four specialist skills against the final proposed diff before creating or updating a pull request:

1. Read and apply `.agents/skills/ai-slop/SKILL.md`.
2. Read and apply `.agents/skills/ponytail/SKILL.md`.
3. Read and apply `.agents/skills/over-engineering/SKILL.md`.
4. Read and apply `.agents/skills/framework-patterns/SKILL.md`.

## Procedure

1. Inspect the complete diff and relevant callers, tests, and framework patterns.
2. Run each gate independently. Record `PASS` or `FAIL`, findings, and evidence for every gate.
3. Resolve all blocking findings. After any code change, rerun all four gates against the updated diff.
4. Run applicable mechanical checks separately, such as lint, typecheck, and focused Playwright tests. Do not treat a gate review as a substitute for tests.
5. Before opening or updating the PR, copy a concise outcome and code-specific evidence for each gate into the PR template. All four must pass.

Do not claim a gate ran if its checklist was not completed. CI validates the PR attestation; reviewers remain responsible for evaluating the quality of the evidence.