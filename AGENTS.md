# AGENTS.md

This workspace builds the Recruitment Dashboard application described in PLAN.md and TESTS.md.

Execution priorities:
- Complete phases sequentially.
- Keep backend and frontend testable.
- Use the API envelope `{ "data": ..., "meta": { "total": N, "page": N } }`.
- Use structured error responses `{ "error": "...", "detail": "...", "code": N }`.
