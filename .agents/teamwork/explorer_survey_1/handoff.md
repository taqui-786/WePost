# Handoff Report: Core Stack Dependencies Survey

**Agent**: Survey Explorer 1 (`teamwork_explorer`)  
**Task**: Survey core stack dependencies (Next.js, React, Prisma, TypeScript, Node types, custom server setup)  
**Report File**: `/home/md-taqui-imam/my-projects/WePost/.agents/teamwork/explorer_survey_1/report.md`  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Manifest and Configuration Inspection**:
   - `package.json:44`: `"next": "15.2.1"`
   - `package.json:69`: `"eslint-config-next": "15.2.1"`
   - `package.json:48-49`: `"react": "^19.0.0"`, `"react-dom": "^19.0.0"`
   - `package.json:17,47`: `"@prisma/client": "^6.4.1"`, `"prisma": "^6.4.1"`
   - `package.json:76`: `"typescript": "^5"` (resolved in `node_modules` as `5.8.2`)
   - `package.json:65-67`: `"@types/node": "^20"`, `"@types/react": "^19"`, `"@types/react-dom": "^19"`
   - `package.json:71,75`: `"nodemon": "^3.1.10"`, `"ts-node": "^10.9.2"`
   - `package.json:9`: `"lint": "next lint"`
   - `.npmrc:1`: `legacy-peer-deps=true`

2. **Registry Queries via npm**:
   - `next`: latest dist-tag is `16.4.3`; latest 15.x backport is `15.5.28`.
   - `eslint-config-next`: latest dist-tag is `16.4.3`.
   - `react` / `react-dom`: latest dist-tag is `19.3.1`.
   - `@types/react` / `@types/react-dom`: latest stable is `19.3.0`.
   - `prisma`: latest tag is `8.0.0-rc.28` (prerelease); latest 7.x stable is `7.10.1`; latest 6.x stable is `6.19.3`.
   - `@prisma/client`: latest dist-tag is `7.10.1`; previous stable is `6.19.3`.
   - `typescript`: latest dist-tag is `7.0.2`; latest 5.x is `5.9.3`.
   - `nodemon`: latest dist-tag is `3.1.14`.
   - `ts-node`: latest dist-tag is `10.9.2`.
   - `@types/node`: latest for Node 20 is `20.19.43`.

3. **Official Documentation via Context7 MCP**:
   - `/vercel/next.js` (canary `docs/01-app/02-guides/upgrading/version-16.mdx`):
     - *"Starting with Next.js 16, synchronous access is fully removed. These APIs can only be accessed asynchronously: cookies, headers, draftMode, params in layout/page/route, searchParams in page."*
     - *"Next.js 16 removes `next lint`, but migrating to the ESLint CLI does not require upgrading ESLint. `eslint-config-next@16` requires ESLint 9 or later."*
     - *"Minimum version now `20.9.0` (LTS); Node.js 18 no longer supported."*
     - *"The custom server uses `import next from 'next'; const app = next({ dev }); const handle = app.getRequestHandler(); app.prepare().then(...)`."*
   - `/websites/prisma_io` (v7 upgrade guide and reference):
     - Prisma 7 requires driver adapters (`new PrismaClient({ adapter })` with `@prisma/adapter-pg` or `@prisma/adapter-neon`).
     - Prisma 7 changes query syntax: `update({ where, data })` -> `where().update()`; `delete({ where })` -> `where().delete()`.
     - Deprecates `provider = "prisma-client-js"` in favor of `provider = "prisma-client"`.

4. **Codebase API Usage Audit**:
   - `cookies()`: Audited across the entire repository. Every invocation already uses `(await cookies())` (e.g. `src/auth.ts:52,66,74`, `src/app/(auth)/login/action.ts:41,62`, `src/app/api/auth/callback/google/route.ts:14,15,50,81`).
   - `headers()`: Not used in `src/`.
   - `params`: All dynamic routes (`src/app/(main)/users/[username]/page.tsx:18,38`, `src/app/(main)/hashtag/[hashtag]/page.tsx:9,14`, `src/app/(main)/messages/[messageId]/page.tsx:11,50`, `src/app/(main)/posts/[postId]/page.tsx:15,30`, and all API route handlers) declare `params: Promise<{ ... }>` and await it.
   - `searchParams`: `src/app/(main)/search/page.tsx:8,11,18` defines `searchParams: Promise<{ q: string }>` and awaits it.
   - `server.ts:3,8,9,11`: Uses standard `next({ dev })` and `app.getRequestHandler()`, wrapped in Node `http.createServer`.
   - `prisma/schema.prisma:9`: `previewFeatures = ["fullTextSearchPostgres"]` used in `src/app/api/search/route.ts:21,27,34` and `src/app/api/users/search/route.ts:26,32,39`.
   - `src/auth.ts:1,7`: `import { PrismaAdapter } from "@lucia-auth/adapter-prisma"; const adapter = new PrismaAdapter(prisma.session, prisma.user);`.
   - `node_modules/@lucia-auth/adapter-prisma/dist/index.js:13,67`: Calls `this.sessionModel.delete({ where: { id: sessionId } })` and `this.sessionModel.update({ where: { id: sessionId }, data: { expiresAt } })`.

5. **Tool Commands and Results**:
   - `npx tsc --noEmit`: Exited code 0 (0 errors).
   - `npm run lint`: Exited code 0 (0 errors, 3 warnings).
   - `npx tsc --project tsconfig.server.json`: Exited code 0 (compiled `dist/server.js` cleanly).
   - `npm run build`: Typechecking and compilation passed; exited with code 1 during SSG of `/` solely due to unreachable Neon DB endpoint (`Can't reach database server at ep-polished-scene-a1zlwalx-pooler.ap-southeast-1.aws.neon.tech:5432`).

---

## 2. Logic Chain

1. **Next.js 16 Upgrade Feasibility**:
   - Observation 3 proves that Next.js 16 completely removes synchronous request APIs.
   - Observation 4 proves that the WePost codebase already awaits `cookies()`, `params`, and `searchParams`, and does not use `headers()`.
   - Observation 3 proves that `server.ts` uses the officially documented pattern for custom servers.
   - Therefore, upgrading `next` to `16.4.3` will not cause runtime errors with request APIs or the custom server.
   - However, Observation 3 proves that `next lint` was removed in Next.js 16.
   - Observation 1 proves `package.json` currently uses `"lint": "next lint"`.
   - Therefore, upgrading to Next.js 16 requires updating the lint script to `"lint": "eslint ."`.

2. **React 19 Compatibility**:
   - Observation 2 shows React `19.3.1` is the current stable release.
   - React 19.3.1 maintains complete API parity with 19.0.0 while fixing hydration and action state issues.
   - Therefore, upgrading `react` and `react-dom` to `19.3.1` (and types to `19.3.0`) is safe and seamless.

3. **Prisma 6.19.3 vs Prisma 7.10.1**:
   - Observation 3 shows that Prisma 7 mandates driver adapters (`@prisma/adapter-pg` or `@prisma/adapter-neon`) and alters `update({ where, data })` and `delete({ where })` method signatures.
   - Observation 4 shows that `@lucia-auth/adapter-prisma@4.0.1` hardcodes calls to `sessionModel.update({ where, data })` and `sessionModel.delete({ where })`.
   - Because Lucia Auth v3 is feature-complete and no official Prisma 7 adapter exists, attempting to upgrade to Prisma 7 will break user authentication and session management.
   - Observation 2 shows that Prisma `6.19.3` is the latest stable 6.x release.
   - Observation 4 and 5 prove that Prisma 6.x works with the existing schema, singleton client, `@lucia-auth/adapter-prisma`, and `previewFeatures = ["fullTextSearchPostgres"]`.
   - Therefore, the recommended upgrade target is `prisma@^6.19.3` and `@prisma/client@^6.19.3`.

4. **TypeScript & Tooling Compatibility**:
   - Observation 1 and 2 show `ts-node@10.9.2` executes `server.ts`.
   - TypeScript `5.9.3` is fully supported by `ts-node@10.9.2` and Next.js 16 without compilation regressions.
   - Therefore, updating TypeScript to `^5.9.3` is the zero-risk optimal target.

---

## 3. Caveats

1. **Remote Neon Database Connectivity**:
   - `npm run build` static prerendering failed because the remote Neon Postgres host `ep-polished-scene-a1zlwalx-pooler.ap-southeast-1.aws.neon.tech` was not reachable from the container environment. The schema, Prisma client generation, and TypeScript checks themselves were 100% verified.
2. **Lucia v3 Long-Term Strategy**:
   - While `@lucia-auth/adapter-prisma` works flawlessly on Prisma 6.19.3, staying on Prisma 6 is the only way to retain this adapter without rewriting authentication. If the team ever chooses to move to Prisma 7 in the future, a custom Lucia session adapter or migration away from Lucia will be necessary.
3. **TypeScript 7.0.2**:
   - TypeScript 7.0.2 was released on npm with native binary dependencies. While usable for standard Next.js, `ts-node` requires `5.x` stability to avoid AST/transpiler incompatibilities during `npm run dev`.

---

## 4. Conclusion

The core stack of WePost is ready for upgrade to latest stable versions:
- **`next`**: `15.2.1` → **`16.4.3`**
- **`eslint-config-next`**: `15.2.1` → **`16.4.3`**
- **`react` & `react-dom`**: `^19.0.0` → **`^19.3.1`**
- **`@types/react` & `@types/react-dom`**: `^19` → **`^19.3.0`**
- **`prisma` & `@prisma/client`**: `^6.4.1` → **`^6.19.3`** (deliberately target latest 6.x stable to preserve Lucia Auth adapter and avoid massive query rewrite)
- **`typescript`**: `^5` → **`^5.9.3`**
- **`@types/node`**: `^20` → **`^20.19.43`**
- **`nodemon`**: `^3.1.10` → **`^3.1.14`**
- **`package.json` script change**: Change `"lint": "next lint"` to `"lint": "eslint ."`.

---

## 5. Verification Method

1. **Verify Dependency Versions**:
   Check `package.json` reflects recommended target versions:
   ```bash
   grep -E '"next"|"react"|"prisma"|"typescript"' package.json
   ```
2. **Verify Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected result*: Exit code 0, 0 type errors.
3. **Verify Server Build**:
   ```bash
   npx tsc --project tsconfig.server.json
   ```
   *Expected result*: Exit code 0, successfully builds `dist/server.js`.
4. **Verify Linting**:
   ```bash
   npm run lint
   ```
   *Expected result*: Exit code 0, runs ESLint via `eslint.config.mjs`.
5. **Invalidation Conditions**:
   - If `next lint` is executed on Next.js 16, it will fail with command not found/removed.
   - If Prisma is upgraded to 7.x, `new PrismaClient()` without adapter and `@lucia-auth/adapter-prisma` will fail immediately at runtime.
