# WePost Backend, Auth, Realtime & Networking Survey Report

**Explorer**: Survey Explorer 2  
**Date**: 2026-10-28  
**Scope**: Lucia Auth, Arctic, @lucia-auth/adapter-prisma, @node-rs/argon2, Socket.io, Socket.io-client, Ky, date-fns, lodash, server.ts, nodemon, ts-node, dotenv, cross-env.

---

## 1. Executive Summary

This report surveys all backend, authentication, realtime, networking, and server runner dependencies in WePost.

### Key Takeaways:
1. **Lucia Auth (`3.2.2`) & `@lucia-auth/adapter-prisma` (`4.0.1`)**:
   - `3.2.2` and `4.0.1` are the **final** published releases of Lucia. The author (Pilcrow) deprecated Lucia in March 2025 and shifted Lucia to an educational resource rather than maintaining an abstracted multi-adapter library.
   - **Crucial Guardrail Compliance**: Per `AGENTS.md`: *"Use Lucia (@/auth), never switch to NextAuth."* Lucia 3.2.2 and Prisma adapter 4.0.1 are **fully functional** and already compatible with Next.js 15 and React 19 in WePost (`(await cookies())` is already properly used in `src/auth.ts`). They should be retained at their current final versions.
2. **Missing Direct Dependency Alert (`dotenv`)**:
   - `server.ts:1` imports `"dotenv/config"`, but `dotenv` is **NOT declared** in `package.json`! In the current development environment, it only resolves by accident via `/home/md-taqui-imam/node_modules/dotenv/config.js`. In a clean Docker or CI deployment, this will cause a catastrophic runtime crash. `dotenv` (`^18.0.9` or `^16.4.7`) must be explicitly added to `dependencies`.
3. **Socket.io Security Patches (`4.8.1` → `4.8.4`)**:
   - Upgrading `socket.io` and `socket.io-client` from `4.8.1` to `4.8.4` resolves multiple high-severity vulnerabilities in transitively bundled packages (`socket.io-parser` GHSA-677m-j7p3-52f9 / GHSA-2m8v-j782-fhvr, and `ws` GHSA-58qx-3vcg-4xpx / GHSA-96hv-2xvq-fx4p). Upgrades are 100% backwards-compatible.
4. **Ky Major Upgrade (`1.7.5` → `2.2.0`)**:
   - `ky@2.2.0` is the latest stable release. It requires Node `>= 22` (current runtime is Node `v24.21.0`). WePost's `src/lib/ky.ts` and API consumers are fully compatible with v2 without breaking changes (no `prefixUrl` usage, `parseJson` signature is supported, no `.json()` calls on error responses).
5. **Arctic (`3.5.0` → `3.7.0`)**:
   - Arctic is actively maintained by Pilcrow. Upgrading to `3.7.0` is backwards-compatible and keeps Google OAuth fully operational.
6. **Argon2 (`2.0.2` → `2.2.2`) & date-fns (`4.1.0` → `4.4.0`) & nodemon (`3.1.10` → `3.1.14`)**:
   - All safe, backwards-compatible upgrades.

---

## 2. Dependency Upgrade Matrix

| Package | Current `package.json` | Installed | Latest Stable | Recommended Target | Upgrade Type | Risk Level |
|---|---|---|---|---|---|---|
| `lucia` | `^3.2.2` | `3.2.2` | `3.2.2` | `3.2.2` (lock) | None (EOL/Final) | Low |
| `@lucia-auth/adapter-prisma` | `^4.0.1` | `4.0.1` | `4.0.1` | `4.0.1` (lock) | None (EOL/Final) | Low |
| `arctic` | `^3.5.0` | `3.5.0` | `3.7.0` | `^3.7.0` | Minor | Very Low |
| `@node-rs/argon2` | `^2.0.2` | `2.0.2` | `2.2.2` | `^2.2.2` | Minor/Patch | Very Low |
| `socket.io` | `^4.8.1` | `4.8.1` | `4.8.4` | `^4.8.4` | Patch (Sec fix) | Very Low |
| `socket.io-client` | `^4.8.1` | `4.8.1` | `4.8.4` | `^4.8.4` | Patch (Sec fix) | Very Low |
| `ky` | `^1.7.5` | `1.7.5` | `2.2.0` | `^2.2.0` | Major | Low |
| `date-fns` | `^4.1.0` | `4.1.0` | `4.4.0` | `^4.4.0` | Minor | Very Low |
| `dotenv` | *Not listed* | *Transitive / Parent* | `18.0.9` | `^18.0.9` | **New Direct Dep** | Low |
| `cross-env` | `^7.0.3` | `7.0.3` | `10.1.0` | `^10.1.0` | Major | Very Low |
| `nodemon` | `^3.1.10` | `3.1.10` | `3.1.14` | `^3.1.14` | Patch | Very Low |
| `ts-node` | `^10.9.2` | `10.9.2` | `10.9.2` | `^10.9.2` | None (At latest) | None |
| `lodash` | *Not listed* | *None* | `4.17.21` | *Do not add* | None | None |

---

## 3. In-Depth Package Analysis & Codebase Consumption

### 3.1 Lucia Auth (`lucia` & `@lucia-auth/adapter-prisma`)

- **Code Consumption**:
  - `src/auth.ts`: Initialized via `new Lucia(adapter, { ... })` and exported as `lucia`.
  - Next.js 15 Cookie Integration: `validateRequest()` in `src/auth.ts` calls `(await cookies()).get(lucia.sessionCookieName)?.value`.
  - Session creation in `src/app/(auth)/login/action.ts`, `src/app/(auth)/signup/action.ts`, and `src/app/api/auth/callback/google/route.ts`.
- **Status & Upstream Deprecation**:
  - In October 2024, Pilcrow announced that Lucia v3 is the final version, with end-of-life in March 2025.
  - Lucia does NOT have a v4 or v5; it transitioned into an educational resource for writing native session authentication.
- **Guardrail Rule Verification**:
  - `AGENTS.md` explicitly specifies: *"Use Lucia (@/auth), never switch to NextAuth."*
  - Lucia 3.2.2 runs without issues on Node 24 and Next.js 15.2.1 / React 19.
- **Prisma Adapter Note**:
  - `@lucia-auth/adapter-prisma@4.0.1` specifies `peerDependencies: { '@prisma/client': '^4.2.0 || ^5.0.0' }`.
  - `.npmrc` in the project sets `legacy-peer-deps=true`, enabling compatibility with Prisma 6.x.
  - The adapter code in `node_modules/@lucia-auth/adapter-prisma/dist/index.js` only executes basic Prisma delegates (`this.sessionModel.findUnique`, `create`, `update`, `delete`, `deleteMany`), which remain identical in Prisma 6.x.
- **Recommendation**:
  - Keep `lucia: "3.2.2"` and `@lucia-auth/adapter-prisma: "4.0.1"`.

---

### 3.2 Arctic (`arctic`)

- **Code Consumption**:
  - `src/auth.ts`: `new Google(clientId, clientSecret, redirectUri)`
  - `src/app/(auth)/login/google/route.ts`: `generateState()`, `generateCodeVerifier()`, `google.createAuthorizationURL()`
  - `src/app/api/auth/callback/google/route.ts`: `google.validateAuthorizationCode(code, storedCodeVerifier)`, `OAuth2RequestError`
- **Latest Version**: `3.7.0` (upgraded from `3.5.0`).
- **Breaking Changes**: None. The upgrade from 3.5.0 to 3.7.0 adds support for new providers (Autodesk, Mastodon, Withings) and fixes endpoints for Strava/StartGG. The `Google` provider and OAuth2 helper exports are 100% unchanged.
- **Recommendation**: Update `arctic` to `^3.7.0`.

---

### 3.3 @node-rs/argon2

- **Code Consumption**:
  - `src/app/(auth)/login/action.ts`: `verify(existingUser.passwordHash, password, { ... })`
  - `src/app/(auth)/signup/action.ts`: `hash(password, { ... })`
  - `next.config.ts`: `serverExternalPackages: ["@node-rs/argon2"]`
- **Latest Version**: `2.2.2` (upgraded from `2.0.2`).
- **Breaking Changes**: None. Minor performance and native binary distribution improvements for modern Node.
- **Recommendation**: Update `@node-rs/argon2` to `^2.2.2`.

---

### 3.4 Socket.io (`socket.io` & `socket.io-client`)

- **Code Consumption**:
  - `server.ts`: Custom Node HTTP server initializes `const io = new Server(httpServer)`.
  - `src/hooks/SocketContext.tsx`: Client hook instantiates `io("http://localhost:3001", { auth: ... })`.
- **Latest Version**: `4.8.4` (upgraded from `4.8.1`).
- **Security Vulnerability Fixes**:
  - `socket.io@4.8.1` transitively pulls vulnerable versions of `socket.io-parser` (GHSA-677m-j7p3-52f9 / GHSA-2m8v-j782-fhvr: memory exhaustion via unbounded/zero binary attachments) and `ws` (GHSA-58qx-3vcg-4xpx / GHSA-96hv-2xvq-fx4p: memory disclosure and fragment DoS).
  - Version `4.8.4` updates underlying dependencies (`engine.io@~6.6.0`, `socket.io-parser@~4.2.4`, `socket.io-adapter@~2.5.2`) and addresses these issues.
- **Breaking Changes**: None. Full drop-in compatibility.
- **Recommendation**: Update both `socket.io` and `socket.io-client` to `^4.8.4`.

---

### 3.5 Ky (`ky`)

- **Code Consumption**:
  - `src/lib/ky.ts`:
    ```ts
    import ky from "ky";
    const kyInstance = ky.create({
      parseJson: (text) =>
        JSON.parse(text, (key, value) => {
          if (key.endsWith("At")) return new Date(value);
          return value;
        }),
    });
    export default kyInstance;
    ```
  - `src/app/api/auth/callback/google/route.ts`: `kyInstance.get("https://www.googleapis.com/...").json<...>()`
  - `src/components/customComponents/UserLinkWithTooltip.tsx`:
    ```ts
    retry(failuerCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) return false;
      return failuerCount < 3;
    }
    ```
  - Query hooks and feeds (`MyFeed.tsx`, `BookmarkFeed.tsx`, etc.): `.json<T>()` calls.
- **Upstream Major Changes in Ky 2.0+**:
  1. **Node Requirement**: Node `>= 22` is required. Verified: current Node is `v24.21.0` (compatible).
  2. **Prefix Option**: `prefixUrl` was renamed to `prefix`. Verified: WePost does not use `prefixUrl`.
  3. **Error Response Body**: `error.response.json()` is deprecated/disabled because error bodies are pre-read into `error.data`. Verified: WePost only checks `error.response.status === 404` (supported in v2).
  4. **Hooks System**: Redesigned to receive an options object. Verified: WePost defines no custom hooks.
  5. **Empty Body Handling**: `.json()` on 204 or empty bodies now throws. Verified: WePost API endpoints return JSON payloads (or use standard response handling).
- **Recommendation**:
  - Update `ky` to `^2.2.0` (latest stable).
  - *Fallback Alternative*: `^1.14.3` if strict major-version freeze is desired, though `2.2.0` was verified safe for WePost.

---

### 3.6 Date-fns (`date-fns`)

- **Code Consumption**:
  - `src/lib/utils.ts`: `formatDate`, `formatDistanceToNowStrict`
  - `src/app/(main)/users/[username]/page.tsx`: `formatDate`
  - `src/components/messages/Messages.tsx`: `formatDate`
- **Latest Version**: `4.4.0` (upgraded from `4.1.0`).
- **Breaking Changes**: None.
- **Recommendation**: Update `date-fns` to `^4.4.0`.

---

### 3.7 Dotenv (`dotenv`) — *Critical Fix*

- **Code Consumption**:
  - `server.ts:1`: `import "dotenv/config";`
- **Discovery**:
  - `dotenv` is **NOT** present in `package.json` under `dependencies` or `devDependencies`.
  - In local development, Node traverses up the directory tree and finds `/home/md-taqui-imam/node_modules/dotenv/config.js`.
  - In a standalone build, container (Docker), or CI runner, `npm run dev` and `npm run start` will fail immediately with `Cannot find module 'dotenv/config'`.
- **Latest Stable Version**: `18.0.9`.
- **Recommendation**:
  - Add `"dotenv": "^18.0.9"` to `package.json` `dependencies`.

---

### 3.8 Cross-env, Nodemon, and ts-node

- **`cross-env`**:
  - In `package.json`: `"start": "cross-env NODE_ENV=production node dist/server.js"`.
  - Version `10.1.0` was released by Kent C. Dodds targeting Node `>= 20`.
  - Recommendation: Update to `^10.1.0`.
- **`nodemon`**:
  - Used in `npm run dev` (`nodemon.json` runs `ts-node --project tsconfig.server.json server.ts`).
  - Currently `3.1.10`, latest is `3.1.14`.
  - Recommendation: Update to `^3.1.14`.
- **`ts-node`**:
  - Currently `10.9.2`, which is the latest stable release.
  - Verified: `npx tsc --project tsconfig.server.json --noEmit` succeeds with code 0.
  - Recommendation: Retain `^10.9.2`.

---

## 4. Step-by-Step Implementation Guide for Implementer

When the implementation phase executes, apply these changes to `package.json`:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^4.1.3",
    "@lucia-auth/adapter-prisma": "^4.0.1",
    "@node-rs/argon2": "^2.2.2",
    "@plaiceholder/next": "^3.0.0",
    "@prisma/client": "^6.4.1",
    ...
    "arctic": "^3.7.0",
    "cross-env": "^10.1.0",
    "date-fns": "^4.4.0",
    "dotenv": "^18.0.9",
    "firebase": "^11.6.0",
    "framer-motion": "^12.9.4",
    "ky": "^2.2.0",
    "lucia": "^3.2.2",
    "lucide-react": "^0.479.0",
    "motion": "^12.9.4",
    "next": "15.2.1",
    "next-themes": "^0.4.4",
    "plaiceholder": "^3.0.0",
    "prisma": "^6.4.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-easy-crop": "^5.4.1",
    "react-hook-form": "^7.54.2",
    "react-intersection-observer": "^9.16.0",
    "react-linkify-it": "^1.0.8",
    "sharp": "^0.34.1",
    "socket.io": "^4.8.4",
    "socket.io-client": "^4.8.4",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    ...
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

### Verification Commands
1. `npm install`
2. `npx tsc --project tsconfig.server.json --noEmit`
3. `npx tsc --noEmit`
4. `npm run lint`
5. Test server compilation: `npx tsc --project tsconfig.server.json`
