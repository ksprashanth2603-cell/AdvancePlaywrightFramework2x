---
name: ai-slop
description: Review changed code and documentation for unreviewed or unsupported AI-generated output. Use before opening or updating a pull request.
---

# AI Slop Gate

Check that generated output is understood, evidence-based, and ready to maintain. Review the complete PR diff, not only files that appear AI-generated.

## Review

- Trace changed behavior to its callers, contracts, and repository evidence. Do not accept invented APIs, requirements, test results, or unsupported claims.
- Identify placeholders, speculative comments, boilerplate, unused code, and generated prose that adds no project value.
- Confirm implementation choices are understood and can be explained; require relevant tests or another concrete verification for behavioral changes.
- Do not infer authorship from style. Focus on correctness, evidence, reviewability, and maintenance cost.
- Keep useful generated code when it is verified and fits the task; do not rewrite code solely to make it look less generated.

## Result

Report `PASS` only when every changed area has been reviewed and no unverified output remains. Otherwise report `FAIL` with file references and actionable findings. Include concise evidence suitable for the PR quality-gate checklist.