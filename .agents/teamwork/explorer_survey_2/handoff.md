# Handoff Report — Explorer Survey 2 (Backend, Auth, Realtime, Networking)

**Type**: Hard Handoff (Task Complete)  
**Author**: Survey Explorer 2  
**Target Recipient**: Orchestrator (`65a48b3c-552d-4e28-ba5e-0b70343cb2e3`)  
**Working Directory**: `/home/md-taqui-imam/my-projects/WePost/.agents/teamwork/explorer_survey_2/`

---

## 1. Observation

### O1: Lucia Auth and Prisma Adapter State
- `package.json` lines 14 & 41:
  - `"@lucia-auth/adapter-prisma": "^4.0.1"`
  - `"lucia": "^3.2.2"`
- Command `npm view lucia version` returns `3.2.2`.
- Command `npm view @lucia-auth/adapter-prisma version` returns `4.0.1`.
- Upstream documentation and community notice (Pilcrow announcement October 2024): Lucia reached end-of-life in March 2025 and shifted from an installable package to an educational guide. No v4 or later package was published on npm.
- `src/auth.ts` lines 1-84:
  - Lucia instance initialized at line 9: `export const lucia = new Lucia(adapter, { ... })`.
  - Next.js 15 async cookies handled at line 52: `const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;` and lines 66, 74.
- `AGENTS.md` lines 24-28:
  - Vibecoding guardrail rule: *"Use Lucia (@/auth), never switch to NextAuth."*

### O2: Undeclared Dependency in `server.ts` (`dotenv`)
- `server.ts` line 1: `import "dotenv/config";`.
- `package.json` dependencies: `dotenv` is completely absent from `dependencies` and `devDependencies`.
- Command `npm ls dotenv` output:
  ```
  wepost@0.1.0 /home/md-taqui-imam/my-projects/WePost
  └── (empty)
  ```
- Command `node -e "console.log(require.resolve('dotenv/config'))"` output:
  ```
  /home/md-taqui-imam/node_modules/dotenv/config.js
  ```
  `dotenv` resolves strictly from the parent user directory outside the project. In any isolated Docker container or CI build, this causes immediate failure (`MODULE_NOT_FOUND`).
- Command `npm view dotenv version` returns `18.0.9`.

### O3: Socket.io Vulnerabilities in `4.8.1` & Patches in `4.8.4`
- `package.json` lines 55-56:
  - `"socket.io": "^4.8.1"`
  - `"socket.io-client": "^4.8.1"`
- Command `npm audit` shows:
  - `socket.io-parser`: GHSA-677m-j7p3-52f9 (unbounded attachments) & GHSA-2m8v-j782-fhvr (zero-attachment DoS).
  - `ws`: GHSA-58qx-3vcg-4xpx (uninitialized memory disclosure) & GHSA-96hv-2xvq-fx4p (tiny fragments DoS).
- Command `npm view socket.io version` returns `4.8.4`.
- Command `npm view socket.io@4.8.4 dependencies` shows updated `engine.io@~6.6.0`, `socket.io-parser@~4.2.4`, `socket.io-adapter@~2.5.2`.

### O4: Ky Version 2.2.0 Compatibility & Usage
- `package.json` line 40: `"ky": "^1.7.5"`.
- Command `npm view ky version` returns `2.2.0`.
- Command `npm view ky@2.2.0 engines` returns `{ node: '>=22' }`.
- Command `node -v` returns `v24.21.0`.
- Codebase inspection for ky usage:
  - `src/lib/ky.ts`: uses `ky.create({ parseJson: (text) => ... })`. Ky 2.0 maintains the `parseJson: (text, context) => unknown` signature.
  - `src/components/customComponents/UserLinkWithTooltip.tsx`: uses `error instanceof HTTPError && error.response.status === 404`. Ky 2.0 maintains `error.response.status`.
  - No occurrence of `prefixUrl` found anywhere in the project (`grep_search` returned 0 results).
  - No occurrence of `error.response.json()` found in the project.

### O5: Other Backend Dependencies
- `arctic`: currently installed `3.5.0`, `npm view arctic version` returns `3.7.0`. Diff shows additions of Autodesk, Mastodon, Withings, and bug fixes for Strava/StartGG; Google OAuth exports and methods are identical.
- `@node-rs/argon2`: currently `2.0.2`, `npm view @node-rs/argon2 version` returns `2.2.2`.
- `date-fns`: currently `4.1.0`, `npm view date-fns version` returns `4.4.0`.
- `cross-env`: currently `7.0.3`, `npm view cross-env version` returns `10.1.0` (Node >= 20 required).
- `nodemon`: currently `3.1.10`, `npm view nodemon version` returns `3.1.14`.
- `ts-node`: currently `10.9.2`, already at latest stable version.
- `lodash`: checked via `grep_search` across project; not used or imported directly.

---

## 2. Logic Chain

1. **Premise 1 (Lucia Auth)**:
   - Per O1, `lucia@3.2.2` and `@lucia-auth/adapter-prisma@4.0.1` are the latest and final releases published to npm, with Lucia transitioning to an educational guide.
   - Per O1, `AGENTS.md` explicitly forbids switching to NextAuth.
   - Per O1, `src/auth.ts` already correctly handles Next.js 15 async cookies `(await cookies())`.
   - *Inference 1*: Lucia and the Prisma adapter must NOT be replaced or rewritten; they should be locked/preserved at `lucia: "3.2.2"` and `@lucia-auth/adapter-prisma: "4.0.1"`.

2. **Premise 2 (Dotenv Missing Dependency)**:
   - Per O2, `server.ts` executes `import "dotenv/config";`, but `dotenv` is omitted from `package.json`.
   - Per O2, the runtime is currently loading `dotenv` from `/home/md-taqui-imam/node_modules/` outside the project root.
   - *Inference 2*: Leaving this unaddressed creates an invisible runtime deployment failure in clean environments. Adding `"dotenv": "^18.0.9"` to `package.json` `dependencies` is an essential fix.

3. **Premise 3 (Realtime / Socket.io)**:
   - Per O3, `socket.io@4.8.1` carries high-severity parser and websocket vulnerabilities.
   - Per O3, `4.8.4` provides the official security patch while maintaining 100% API compatibility with `server.ts` and `src/hooks/SocketContext.tsx`.
   - *Inference 3*: Both `socket.io` and `socket.io-client` should be upgraded to `^4.8.4`.

4. **Premise 4 (Networking / Ky)**:
   - Per O4, `ky@2.2.0` is the latest stable release.
   - Per O4, Node 24 satisfies the Node >= 22 engine requirement.
   - Per O4, WePost does not utilize any deprecated options (`prefixUrl`) or broken patterns (`error.response.json()`), and uses compatible `parseJson` syntax.
   - *Inference 4*: `ky` can be safely upgraded to `^2.2.0` (or `^1.14.3` if preserving major version).

5. **Premise 5 (Utilities & Process)**:
   - Per O5, `arctic` (3.7.0), `@node-rs/argon2` (2.2.2), `date-fns` (4.4.0), `cross-env` (10.1.0), and `nodemon` (3.1.14) have compatible in-place upgrades.
   - `ts-node` is already on latest (`10.9.2`). `lodash` is not needed.

---

## 3. Caveats

1. **Future Lucia Auth Maintenance**: Because Lucia v3 is end-of-life upstream, while it functions flawlessly today with Next.js 15 and Prisma 6, future major updates of Prisma (e.g. Prisma 7) or Next.js might eventually require converting the simple 97-line adapter to an in-house database session utility as documented on `lucia-auth.com`. However, for this project upgrade, preserving Lucia directly conforms to `AGENTS.md` and requires zero code churn.
2. **Socket URL in `SocketContext.tsx`**: In `src/hooks/SocketContext.tsx` line 21, the client connects to `http://localhost:3001` hardcoded, while `server.ts` defaults to port 3000 (`process.env.PORT || "3000"`). This is pre-existing application architecture and does not impede dependency version upgrading.

---

## 4. Conclusion

The recommended backend/auth/realtime/networking upgrade targets are:

| Package | Recommended Version | Action |
|---|---|---|
| `lucia` | `3.2.2` | Retain / lock (latest & final) |
| `@lucia-auth/adapter-prisma` | `4.0.1` | Retain / lock (latest & final) |
| `arctic` | `^3.7.0` | Upgrade from `^3.5.0` |
| `@node-rs/argon2` | `^2.2.2` | Upgrade from `^2.0.2` |
| `socket.io` | `^4.8.4` | Upgrade from `^4.8.1` (security fixes) |
| `socket.io-client` | `^4.8.4` | Upgrade from `^4.8.1` (security fixes) |
| `ky` | `^2.2.0` | Upgrade from `^1.7.5` (compatible with current Node 24) |
| `date-fns` | `^4.4.0` | Upgrade from `^4.1.0` |
| `dotenv` | `^18.0.9` | **Add to `dependencies`** (critical fix for `server.ts`) |
| `cross-env` | `^10.1.0` | Upgrade from `^7.0.3` |
| `nodemon` | `^3.1.14` | Upgrade from `^3.1.10` |
| `ts-node` | `^10.9.2` | Keep (already latest) |

---

## 5. Verification Method

To verify these findings and recommendations independently:

1. **Verify dependency status**:
   ```bash
   npm view lucia version
   npm view @lucia-auth/adapter-prisma version
   npm view arctic version
   npm view socket.io version
   npm view ky version
   npm view dotenv version
   ```
2. **Verify dotenv resolution anomaly**:
   ```bash
   npm ls dotenv
   node -e "console.log(require.resolve('dotenv/config'))"
   ```
3. **Verify typecheck on custom server**:
   ```bash
   npx tsc --project tsconfig.server.json --noEmit
   ```
4. **Verify project typecheck and lint**:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
5. **Invalidation conditions**:
   - If an unexpected major release of `lucia` (v4+) is released on npm (currently 3.2.2 is latest).
   - If Node.js environment is downgraded below v22 (which would invalidate `ky@2.2.0` and require `ky@1.14.3`).
