---
inclusion: always
---

Before opening or updating a pull request, run the `pre-pr-quality-gates` skill and all four specialist skills in `.agents/skills/`. Resolve blocking findings, rerun all four gates on the final diff, and record evidence in the PR template. Do not claim a gate ran if it was not completed.