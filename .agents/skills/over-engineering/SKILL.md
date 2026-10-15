---
name: over-engineering
description: Review a diff for abstractions, layers, configuration, or extension points that are not justified by real callers or complexity. Use before opening or updating a pull request.
---

# Over-Engineering Gate

Check that every new abstraction removes meaningful complexity or follows an established framework pattern.

## Review

- Trace each new helper, interface, factory, wrapper, class, configuration layer, and extension point to its actual callers.
- Flag one-off abstractions that only rename or forward a simple operation and have no meaningful reuse, invariant, or ownership boundary.
- Remove speculative support for hypothetical consumers and unnecessary options or indirection.
- Keep a single-use abstraction when it materially improves safety, hides real complexity, or is required by a framework convention; record that reason.
- Do not inline established page objects, fixtures, or other shared framework abstractions merely because a particular abstraction has one call site.

## Result

Report `PASS` only when every new abstraction has a concrete justification. Otherwise report `FAIL` with file references and the smallest simplification that preserves behavior. Include concise evidence suitable for the PR quality-gate checklist.