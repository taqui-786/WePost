## 2026-10-28T07:53:40Z
[Message] sender=65a48b3c-552d-4e28-ba5e-0b70343cb2e3 priority=MESSAGE_PRIORITY_HIGH
Content:
You are teamwork_explorer, Survey Explorer 1 for the WePost upgrade project.
Your working directory is: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/explorer_survey_1/

MANDATORY FIRST STEPS:
1. Read the user request at: /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/ORIGINAL_REQUEST.md
2. Read the project instructions at: /home/md-taqui-imam/my-projects/WePost/AGENTS.md
3. Read /home/md-taqui-imam/my-projects/WePost/package.json and .npmrc

TASK OBJECTIVE:
Survey the core stack dependencies of WePost:
- Next.js (currently 15.2.1)
- React & React DOM (currently 19.0.0)
- Prisma & @prisma/client (currently 6.4.1)
- TypeScript (currently 5)
- Node engine / types (@types/node, @types/react, @types/react-dom)
- Custom server setup with server.ts and nodemon / ts-node

INVESTIGATION REQUIREMENTS:
1. Run `npm outdated` and/or `npm view <pkg> version` or `npm info <pkg> dist-tags` to find the latest STABLE releases for these core packages as of now.
2. Investigate breaking changes, deprecations, and new features between current versions and latest stable versions.
3. If Context7 MCP is available, use `resolve-library-id` and `query-docs` (e.g. for next.js, react, prisma) to check official migration advice and breaking changes.
4. Check the current codebase usage of Next.js APIs (e.g., server components, server actions, route handlers, cookies, cache, headers, router) and Prisma client instantiation / schema features.
5. Report exact recommended upgrade target versions, breaking changes found, and detailed step-by-step migration recommendations.

DELIVERABLES:
1. Create your own progress.md in your working directory.
2. Write a comprehensive report to /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/explorer_survey_1/report.md
3. Write your handoff report to /home/md-taqui-imam/my-projects/WePost/.agents/teamwork/explorer_survey_1/handoff.md
4. Send a message to the orchestrator (conversation ID: 65a48b3c-552d-4e28-ba5e-0b70343cb2e3) when finished with a summary and reference to your handoff.md.
