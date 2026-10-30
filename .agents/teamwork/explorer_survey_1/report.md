# Core Stack Dependency Survey & Migration Analysis

**Project**: WePost (`/home/md-taqui-imam/my-projects/WePost`)  
**Investigator**: Survey Explorer 1 (`teamwork_explorer`)  
**Date**: October 28, 2026  
**Status**: Completed  

---

## 1. Executive Summary

This survey provides a comprehensive technical audit of the core stack dependencies for WePost in preparation for upgrading to the latest stable versions. The packages analyzed include:
- **Next.js & ESLint**: `next` (currently `15.2.1`), `eslint-config-next` (`15.2.1`)
- **React**: `react` (`^19.0.0`), `react-dom` (`^19.0.0`), `@types/react` (`^19`), `@types/react-dom` (`^19`)
- **Prisma**: `prisma` (`^6.4.1`), `@prisma/client` (`^6.4.1`)
- **TypeScript & Node Types**: `typescript` (`^5`), `@types/node` (`^20`)
- **Custom Server Setup**: `server.ts`, `nodemon` (`^3.1.10`), `ts-node` (`^10.9.2`)

### Key Takeaways
1. **Next.js 16 (`16.4.3`) is the latest stable release**:
   - The WePost codebase is **already in excellent shape** for Next.js 16: all `cookies()` calls are already awaited (`(await cookies())`), dynamic route `params` are already typed as `Promise<...>` and awaited, and `searchParams` are awaited.
   - **CRITICAL BREAKING CHANGE**: Next.js 16 **completely removes the `next lint` CLI command** in favor of direct ESLint CLI. The npm script `"lint": "next lint"` in `package.json` must be updated to `"lint": "eslint ."` to prevent build/lint failures.
   - Custom server logic in `server.ts` (`next({ dev })`, `app.getRequestHandler()`, `httpServer`) is 100% supported and compatible with Next.js 16.
2. **React 19 (`19.3.1`)**:
   - Direct drop-in upgrade from `19.0.0` with no breaking changes.
3. **Prisma Dilemma: Prisma 6.19.3 vs Prisma 7.10.1**:
   - Prisma 7 (`7.10.1`) is a major architectural redesign: it requires database driver adapters (`@prisma/adapter-pg` or `@prisma/adapter-neon`), deprecates `prisma-client-js`, changes datasource URL configuration, and drastically alters model query syntax (`update()`, `delete()`, `upsert()`).
   - **Critical Blocker for Prisma 7**: `@lucia-auth/adapter-prisma@4.0.1` depends on the legacy PrismaClient delegate methods (`this.sessionModel.update({ where, data })`). It breaks under Prisma 7, and Lucia v3 is in maintenance mode with no official Prisma 7 adapter.
   - **Recommended Target**: Upgrade to **`prisma@6.19.3`** and **`@prisma/client@6.19.3`**. This provides the latest stable 6.x release, preserves full compatibility with `@lucia-auth/adapter-prisma`, avoids rewriting all 15+ Prisma queries, and fully maintains `previewFeatures = ["fullTextSearchPostgres"]`.
4. **TypeScript & Tooling**:
   - TypeScript latest tag is `7.0.2` (with `5.9.3` being the latest 5.x). Given that `ts-node` is used for `server.ts` via nodemon, TypeScript `5.9.3` is the safest zero-friction upgrade, while `7.0.2` requires testing `ts-node` compiler compatibility.
   - `@types/node` can be safely upgraded to `20.19.43` (matching Node 20 LTS baseline) or `22.13.10` / `24.x`.
   - `nodemon` can be upgraded from `3.1.10` to `3.1.14` (clean drop-in).

---

## 2. Core Stack Inventory

| Package | Current in `package.json` | Currently Resolved | Latest Stable on npm | Recommended Target | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `next` | `15.2.1` | `15.2.1` | `16.4.3` | **`16.4.3`** | Low (code already conforms to async APIs; must update lint script) |
| `eslint-config-next` | `15.2.1` | `15.2.1` | `16.4.3` | **`16.4.3`** | Low |
| `react` | `^19.0.0` | `19.0.0` | `19.3.1` | **`19.3.1`** | Very Low |
| `react-dom` | `^19.0.0` | `19.0.0` | `19.3.1` | **`19.3.1`** | Very Low |
| `@types/react` | `^19` | `19.0.10` | `19.3.0` | **`^19.3.0`** | Very Low |
| `@types/react-dom` | `^19` | `19.0.4` | `19.3.0` | **`^19.3.0`** | Very Low |
| `prisma` | `^6.4.1` | `6.4.1` | `7.10.1` (6.x: `6.19.3`) | **`^6.19.3`** | Very Low (vs High if Prisma 7) |
| `@prisma/client` | `^6.4.1` | `6.4.1` | `7.10.1` (6.x: `6.19.3`) | **`^6.19.3`** | Very Low (vs High if Prisma 7) |
| `typescript` | `^5` | `5.8.2` | `7.0.2` (5.x: `5.9.3`) | **`^5.9.3`** | Low |
| `@types/node` | `^20` | `20.17.24` | `26.6.5` (20.x: `20.19.43`) | **`^20.19.43`** | Very Low |
| `nodemon` | `^3.1.10` | `3.1.10` | `3.1.14` | **`^3.1.14`** | Very Low |
| `ts-node` | `^10.9.2` | `10.9.2` | `10.9.2` | **`^10.9.2`** | None |

---

## 3. Deep Dive: Next.js (15.2.1 → 16.4.3)

### 3.1 Breaking Changes in Next.js 16

According to official Next.js 16 documentation (`docs/01-app/02-guides/upgrading/version-16.mdx` via Context7 `/vercel/next.js`):

1. **Async Request APIs (Complete Removal of Sync Fallback)**:
   - In Next.js 15, synchronous access to `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` was deprecated with temporary synchronous fallback.
   - In **Next.js 16**, synchronous access is **fully removed**. Any call to `cookies()` or `headers()` without `await` throws an immediate runtime error.
   - Codebase Audit:
     - `cookies()`: 100% of calls in `src/auth.ts`, `src/app/(auth)/login/action.ts`, `src/app/(auth)/signup/action.ts`, and `src/app/api/auth/callback/google/route.ts` already use `(await cookies())`.
     - `headers()`: Not used in the codebase.
     - `params`: All dynamic pages (`/users/[username]`, `/hashtag/[hashtag]`, `/posts/[postId]`, `/messages/[messageId]`) and API routes (`/api/users/[userId]/posts`, `/api/posts/[postId]/likes`, `/api/posts/[postId]/comments`, `/api/posts/[postId]/bookmarks`) declare `params: Promise<{ ... }>` and await it.
     - `searchParams`: `src/app/(main)/search/page.tsx` declares `searchParams: Promise<{ q: string }>` and awaits it.
   - **Verdict**: The codebase is **already 100% compliant** with the Async Request API requirement.

2. **Removal of `next lint` CLI Command (CRITICAL)**:
   - Next.js 16 removes the `next lint` CLI command and the `eslint` option in `next.config.js` in favor of calling the ESLint CLI directly.
   - In `package.json`:
     ```json
     "scripts": {
       "lint": "next lint"
     }
     ```
   - **Action Required**: The script must be updated to:
     ```json
     "scripts": {
       "lint": "eslint ."
     }
     ```
   - The project already has a root `eslint.config.mjs` using `FlatCompat` with `"next/core-web-vitals"`, `"next/typescript"`, and `"prettier"`. Upgrading `eslint-config-next` to `16.4.3` maintains compatibility with ESLint 9 (currently installed).

3. **Node.js Minimum Version**:
   - Minimum Node.js version is now `20.9.0` LTS. Node 18 is officially end-of-life and unsupported.
   - Current execution environment: Node `v24.21.0` (exceeds requirement).

4. **Default Turbopack in Development**:
   - Turbopack is enabled by default in Next.js 16 for `next dev`.
   - In `package.json`, dev is orchestrated via nodemon: `"dev": "nodemon"`, which executes `ts-node --project tsconfig.server.json server.ts`. Inside `server.ts`, Next.js is started programmatically via `next({ dev })`.

5. **`images.maximumRedirects` and `imageSizes`**:
   - `images.maximumRedirects` default changed from unlimited to 3.
   - `16` removed from `images.imageSizes`.
   - WePost uses `firebasestorage.googleapis.com` in `remotePatterns` and uses explicit image widths (e.g. `width={500}`, `height={500}` in `DynamicImage.tsx`). Neither change impacts WePost.

6. **`next.config.ts` Verification**:
   - Current config:
     ```ts
     import type { NextConfig } from "next";
     import withPlaiceholder from "@plaiceholder/next";
     const nextConfig: NextConfig = {
       experimental: {
         staleTimes: {
           dynamic: 30,
         }
       },
       images: {
         remotePatterns: [
           { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
         ],
       },
       serverExternalPackages: ["@node-rs/argon2"],
     };
     export default withPlaiceholder(nextConfig);
     ```
   - `serverExternalPackages` is already at the root level (correct for Next 15+ and 16).
   - `experimental.staleTimes` remains valid in Next.js 16.
   - `@plaiceholder/next@3.0.0` has peerDependencies: `next: >= 10.0.0`. It remains compatible.

### 3.2 Custom Server Compatibility (`server.ts`)

- In `server.ts`:
  ```ts
  import "dotenv/config";
  import { createServer } from "node:http";
  import next from "next";
  import { Server } from "socket.io";

  const port = parseInt(process.env.PORT || "3000", 10);
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handler = app.getRequestHandler();

  app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);
    ...
  });
  ```
- According to official Next.js 16 custom server documentation (`canary/docs/01-app/02-guides/custom-server.mdx` via Context7), the `next({ dev })` and `app.getRequestHandler()` pattern is completely unchanged and supported.
- `tsconfig.server.json` compiles `server.ts` to `dist/server.js` using target `es2019` and module `CommonJS`. Tested directly with `npx tsc --project tsconfig.server.json` and compiled with 0 errors.

---

## 4. Deep Dive: React & React DOM (19.0.0 → 19.3.1)

- **Current Version**: `19.0.0`
- **Latest Stable Version**: `19.3.1` (with `@types/react@19.3.0` and `@types/react-dom@19.3.0`)
- **Nature of Updates**:
  - Maintenance and stabilization releases for React 19.
  - Fixes edge cases with Server Actions, `useActionState`, and hydration reconciliation.
  - Non-breaking update.
- **Codebase Usage**:
  - Codebase uses `cache` from React (`src/auth.ts`, `src/lib/types.ts`).
  - Codebase uses React 19 standard hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `useContext`, `useTransition`).
  - No deprecated React APIs (`defaultProps` on function components, `findDOMNode`, string refs) are used.
- **Verdict**: Direct upgrade to `19.3.1` is safe and recommended.

---

## 5. Deep Dive: Prisma ORM (6.4.1 → 6.19.3 vs 7.10.1)

### 5.1 Prisma 7 (`7.10.1`) Architectural Shift

Prisma 7 introduces substantial breaking changes that fundamentally alter how Prisma interacts with databases and applications:

1. **Driver Adapters are now Mandatory**:
   - Calling `new PrismaClient()` without passing an adapter now throws a runtime error.
   - Applications must install and instantiate an explicit driver adapter (e.g. `@prisma/adapter-pg` or `@prisma/adapter-neon`):
     ```typescript
     import { PrismaClient } from "./generated/prisma";
     import { PrismaPg } from "@prisma/adapter-pg";
     const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
     export const prisma = new PrismaClient({ adapter });
     ```
2. **Generator Provider Change**:
   - `provider = "prisma-client-js"` is deprecated/replaced with `provider = "prisma-client"`.
   - Requires setting an explicit `output` directory (e.g. `output = "./generated/prisma"`).
3. **Datasource URL Block Changed**:
   - The `url` property in `datasource db` is removed or decoupled from runtime connection strings.
4. **Query Syntax Breaking Changes**:
   - `.update({ where, data })` is replaced by `.where({ ... }).update({ ... })`.
   - `.delete({ where })` is replaced by `.where({ ... }).delete()`.
   - `.upsert()` replaces `where` with `conflictOn`.
   - `.aggregate()` changes from `{ _sum: ... }` to callback selectors `((agg) => ({ total: agg.sum(...) }))`.

### 5.2 Critical Incompatibility: `@lucia-auth/adapter-prisma@4.0.1`

In `src/auth.ts`:
```typescript
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
const adapter = new PrismaAdapter(prisma.session, prisma.user);
```
Inspecting the compiled code of `node_modules/@lucia-auth/adapter-prisma/dist/index.js` reveals:
```javascript
export class PrismaAdapter {
  constructor(sessionModel, userModel) {
    this.sessionModel = sessionModel;
    this.userModel = userModel;
  }
  async deleteSession(sessionId) {
    await this.sessionModel.delete({ where: { id: sessionId } });
  }
  async updateSessionExpiration(sessionId, expiresAt) {
    await this.sessionModel.update({ where: { id: sessionId }, data: { expiresAt } });
  }
  async getSessionAndUser(sessionId) {
    const userModelKey = this.userModel.name[0].toLowerCase() + this.userModel.name.slice(1);
    const result = await this.sessionModel.findUnique({
      where: { id: sessionId },
      include: { [userModelKey]: true }
    });
    ...
  }
}
```
**Impact**:
- The `@lucia-auth/adapter-prisma` library directly calls `this.sessionModel.delete({ where })` and `this.sessionModel.update({ where, data })`.
- Prisma 7 changes these method signatures.
- Lucia Auth v3 is feature-complete and will **not** receive a Prisma 7 adapter update.
- Attempting to use Prisma 7 will cause session authentication, session validation, and logout to fail catastrophically.

### 5.3 Full-Text Search in PostgreSQL

In `prisma/schema.prisma`:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres"]
}
```
In `src/app/api/search/route.ts`:
```typescript
const searchQuery = q.split(" ").join(" & ");
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { content: { search: searchQuery } },
      { user: { displayName: { search: searchQuery } } },
      { user: { username: { search: searchQuery } } }
    ]
  },
  ...
});
```
- In Prisma 6.x, `fullTextSearchPostgres` is fully stable and supported.
- In Prisma 6.19.3, all existing full-text search queries work without any changes.

### 5.4 Prisma Upgrade Strategy Recommendation

- **Recommended Choice**: Upgrade to **`prisma@6.19.3`** and **`@prisma/client@6.19.3`**.
  - **Zero Breaking Changes**: Existing `new PrismaClient()` in `src/lib/prisma.ts` works as-is.
  - **Full Compatibility**: `@lucia-auth/adapter-prisma` continues working perfectly.
  - **No Query Rewrites**: All 15+ files using Prisma methods (`findUnique`, `findMany`, `delete`, `update`, `create`) remain fully valid.
  - **Preserves Full-Text Search**: `previewFeatures = ["fullTextSearchPostgres"]` is preserved.
- **Alternative (Prisma 7.10.1)**:
  - Only viable if the team intends to rewrite authentication away from `@lucia-auth/adapter-prisma` (or write a custom adapter implementing Lucia's `Adapter` interface using raw SQL / Prisma 7 driver) AND migrate all repository queries. This is outside the scope of a standard dependency upgrade.

---

## 6. Deep Dive: TypeScript & Tooling

### 6.1 TypeScript (`5.8.2` → `5.9.3` vs `7.0.2`)
- In `package.json`: `"typescript": "^5"`.
- Currently installed: `5.8.2`.
- `npm view typescript dist-tags`:
  - `latest: 7.0.2`
  - `5.x latest: 5.9.3`
  - `6.x latest: 6.0.3`
- `ts-node` (`10.9.2`) is configured in `nodemon.json` to execute `server.ts`:
  ```json
  {
    "watch": ["server.ts", ".env"],
    "exec": "ts-node --project tsconfig.server.json server.ts",
    "ext": "js ts env"
  }
  ```
- **Recommendation**:
  - Update `"typescript": "^5.9.3"`. This guarantees 100% compatibility with `ts-node@10.9.2`, Next.js 16, and current type definitions while keeping the latest 5.x compiler improvements.

### 6.2 Node Types (`@types/node`)
- Current in `package.json`: `"^20"` (resolved: `20.17.24`).
- Latest 20.x: `20.19.43`.
- Active system node: `v24.21.0`.
- **Recommendation**:
  - Update `"@types/node": "^20.19.43"` (or `"^22.13.10"`).

### 6.3 Nodemon & ts-node
- `nodemon`: Upgrade from `^3.1.10` to `^3.1.14` (clean drop-in).
- `ts-node`: Kept at `^10.9.2` (latest stable).

---

## 7. Migration Roadmap & Step-by-Step Instructions

### Step 1: Preserve `.npmrc`
Confirm `.npmrc` contains:
```ini
legacy-peer-deps=true
```
*Rationale*: Required because `@lucia-auth/adapter-prisma` has a peer dependency constraint of `@prisma/client: ^4.2.0 || ^5.0.0`, but the project runs Prisma 6.x.

### Step 2: Update `package.json` Dependencies

#### Dependencies Diff:
```json
{
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "next": "16.4.3",
    "prisma": "^6.19.3",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.19.43",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "eslint-config-next": "16.4.3",
    "nodemon": "^3.1.14",
    "typescript": "^5.9.3"
  }
}
```

### Step 3: Update `package.json` Scripts for Next.js 16

Change line 9:
```diff
-    "lint": "next lint",
+    "lint": "eslint .",
```
*Rationale*: Next.js 16 removes the `next lint` CLI command. Running `next lint` in Next.js 16 will fail.

### Step 4: Run Package Installation and Prisma Generation
```bash
npm install
npx prisma generate
```

### Step 5: Verification Checklist
1. **Typechecking**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected*: Exit code 0, 0 errors.
2. **Server Compilation**:
   ```bash
   npx tsc --project tsconfig.server.json
   ```
   *Expected*: Exit code 0, generates `dist/server.js`.
3. **Linting**:
   ```bash
   npm run lint
   ```
   *Expected*: Passes with ESLint CLI running `eslint.config.mjs`.
4. **Dev Server Verification**:
   ```bash
   npm run dev
   ```
   *Expected*: Nodemon launches `server.ts` with Next.js 16 and Socket.io.

---

## 8. Summary Table of Upgrade Targets

| Category | Package | Current | Target Version | Breaking Change Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | `next` | `15.2.1` | **`16.4.3`** | `next lint` command removed (update script to `eslint .`). Async request APIs fully enforced (code already compliant). Node >= 20.9 required. |
| **Linting** | `eslint-config-next` | `15.2.1` | **`16.4.3`** | Supports ESLint 9 & 10. Works with existing `eslint.config.mjs`. |
| **UI Library** | `react` | `^19.0.0` | **`^19.3.1`** | Minor patch & performance updates. No breaking changes. |
| **UI Library** | `react-dom` | `^19.0.0` | **`^19.3.1`** | Synchronized with React 19.3.1. |
| **Types** | `@types/react` | `^19` | **`^19.3.0`** | Matched to React 19.3. |
| **Types** | `@types/react-dom` | `^19` | **`^19.3.0`** | Matched to React-DOM 19.3. |
| **Database** | `prisma` | `^6.4.1` | **`^6.19.3`** | Latest stable 6.x. Preserves `@lucia-auth/adapter-prisma` and fullTextSearchPostgres. (Avoid 7.x due to adapter rewrite). |
| **Database** | `@prisma/client` | `^6.4.1` | **`^6.19.3`** | Matched to Prisma 6.19.3. |
| **Compiler** | `typescript` | `^5` | **`^5.9.3`** | Latest stable 5.x. Preserves `ts-node` compatibility. |
| **Types** | `@types/node` | `^20` | **`^20.19.43`** | Latest 20.x LTS types. |
| **Server Tool** | `nodemon` | `^3.1.10` | **`^3.1.14`** | Minor bugfix release. |
| **Server Tool** | `ts-node` | `^10.9.2` | **`^10.9.2`** | Already at latest stable. |
