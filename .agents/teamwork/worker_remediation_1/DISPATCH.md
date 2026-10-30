## 2026-10-28T09:03:52Z
You are teamwork_worker for Audit Remediation of Milestones 3 & 4.
Your working directory is: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/worker_remediation_1/
You have write ownership of:
- /home/md-taqui-imam/my-projects/WePost/next.config.ts
- /home/md-taqui-imam/my-projects/WePost/src/app/api/message/[messagesId] (renaming to [messageId])

MANDATORY FIRST STEPS:
1. Read the user request at: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/ORIGINAL_REQUEST.md
2. Read the project instructions at: /home/md-taqui-imam/my-projects/WePost/AGENTS.md
3. Read the master project document: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/orchestrator/PROJECT.md
4. Read the Remediation Explorer handoff: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/explorer_remediation_1/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
Apply the verified remediation plan:
1. In /home/md-taqui-imam/my-projects/WePost/next.config.ts:
   - Add `turbopack: {},` to `nextConfig`.
   - Update `serverExternalPackages: ["@node-rs/argon2", "sharp"]`.
2. Move / rename directory:
   Rename `src/app/api/message/[messagesId]` to `src/app/api/message/[messageId]`.
   (Use `git mv src/app/api/message/[messagesId] src/app/api/message/[messageId]` or `mv`).
3. Verification:
   - Run `npx prisma generate`
   - Run `npx tsc --noEmit`
   - Run `npm run lint`
   - Run `npx tsc --project tsconfig.server.json --noEmit`
   - Run `npm run build`
   Verify that all commands pass with exit code 0.

DELIVERABLES:
1. Create your progress.md in your working directory.
2. Write full execution details to /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/worker_remediation_1/report.md
3. Write your 5-component handoff to /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/worker_remediation_1/handoff.md
4. Send a message to orchestrator (conversation ID: 65a48b3c-552d-4e28-ba5e-0b70343cb2e3).
