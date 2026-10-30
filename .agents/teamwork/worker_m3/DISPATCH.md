## 2026-10-28T08:37:07Z
You are teamwork_worker for Milestone 3 & 4 (Codebase Adaptation, Modernization & Verification).
Your working directory is: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/worker_m3/
You have exclusive write ownership of:
- /home/md-taqui-imam/my-projects/WePost/src/components/post/editor/mutations.ts
- /home/md-taqui-imam/my-projects/WePost/src/components/post/mutation.ts
- /home/md-taqui-imam/my-projects/WePost/eslint.config.mjs

MANDATORY FIRST STEPS:
1. Read the user request at: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/ORIGINAL_REQUEST.md
2. Read the project instructions at: /home/md-taqui-imam/my-projects/WePost/AGENTS.md
3. Read the master project document: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/orchestrator/PROJECT.md
4. Read Reviewer 1's report: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/reviewer_m1_1/report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
1. Adapt TanStack Query v5 `QueryFilters` in post mutations:
   - In `src/components/post/editor/mutations.ts`:
     Fix line 22: `QueryFilters<any, any, any, any>` -> `QueryFilters` (or `QueryFilters<QueryKey>`).
     Fix line 25: ensure `query` predicate function parameter is properly typed.
   - In `src/components/post/mutation.ts`:
     Fix line 19: `QueryFilters<any, any, any, any>` -> `QueryFilters` (or `QueryFilters<QueryKey>`).
2. Modernize `eslint.config.mjs` for Next.js 16 / ESLint 9:
   - Inspect `eslint-config-next@16.4.3` export formats. Next.js 16 supports ESLint 9 native flat configs.
   - Update `eslint.config.mjs` to avoid the legacy `FlatCompat` circular structure error.
3. Verification:
   - Run `npx tsc --noEmit` and verify 0 type errors.
   - Run `npm run lint` (`eslint .`) and verify 0 lint errors (or only acceptable warnings).
   - Run `npx tsc --project tsconfig.server.json --noEmit` and verify 0 errors.
   - Run `npx prisma generate` to verify database client status.

DELIVERABLES:
1. Create your progress.md in your working directory.
2. Write full execution details to /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/worker_m3/report.md
3. Write your 5-component handoff to /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/worker_m3/handoff.md
4. Send a message to orchestrator (conversation ID: 65a48b3c-552d-4e28-ba5e-0b70343cb2e3).
