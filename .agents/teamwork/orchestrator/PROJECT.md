# Project: WePost Tech Stack Upgrade

## Architecture
- **Framework**: Next.js 16 (App Router, Server Actions) + React 19.3.1
- **Server**: Custom Node HTTP server with Socket.io (`server.ts`, nodemon, ts-node)
- **Database & ORM**: PostgreSQL (Neon) with Prisma ORM 6.19.3
- **Authentication**: Lucia Auth 3.2.2 with `@lucia-auth/adapter-prisma` 4.0.1 (Prisma 6 compatible) & Arctic 3.7.0 (Google OAuth)
- **Client Fetching & State**: TanStack React Query 5.105.0 + `ky` 2.2.0
- **UI & Styling**: Tailwind CSS v4.3.3, Lucide Icons, Radix UI primitives, Sonner, Firebase Storage

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Next.js 16 Upgrade | Upgrade `next` and `eslint-config-next` to `16.4.3` | M1 | survey |
| 2 | React 19.3.1 Upgrade | Upgrade `react`, `react-dom` to `^19.3.1` and types to `^19.3.0` | M1 | survey |
| 3 | Prisma 6.19.3 Upgrade | Upgrade `prisma` and `@prisma/client` to latest 6.x stable | M1 | survey |
| 4 | TypeScript & Tooling Upgrade | Upgrade `typescript` to `^5.9.3`, `@types/node` to `^20.19.43`, `nodemon` to `^3.1.14` | M1 | survey |
| 5 | Lint Script Modernization | Change `"lint": "next lint"` to `"lint": "eslint ."` for Next.js 16 | M1 | survey |
| 6 | Missing Dotenv Fix | Add `"dotenv": "^18.0.9"` to `package.json` for `server.ts` | M1 | survey |
| 7 | Lucia Auth Compatibility Check | Lock `lucia@3.2.2` & `@lucia-auth/adapter-prisma@4.0.1` | M2 | survey |
| 8 | Arctic & Crypto Upgrade | Upgrade `arctic` to `^3.7.0` and `@node-rs/argon2` to `^2.2.2` | M2 | survey |
| 9 | Socket.io Security Patches | Upgrade `socket.io` and `socket.io-client` to `^4.8.4` (CVE fixes) | M2 | survey |
| 10 | Ky HTTP Client Upgrade | Upgrade `ky` to `^2.2.0` (Node 24 runtime compatible) | M2 | survey |
| 11 | Backend Utility Upgrades | Upgrade `date-fns` to `^4.4.0` and `cross-env` to `^10.1.0` | M2 | survey |
| 12 | TanStack Query Upgrade | Upgrade `@tanstack/react-query` and devtools to `^5.105.0` | M3 | survey |
| 13 | Tailwind v4 Ecosystem Upgrade | Upgrade `tailwindcss`, `@tailwindcss/postcss` to `^4.3.3`, `tailwind-merge` to `^3.7.0` | M3 | survey |
| 14 | Radix UI Primitives Upgrade | Upgrade all 10 `@radix-ui/react-*` primitives to latest versions | M3 | survey |
| 15 | Lucide React Upgrade & Brand Icon | Upgrade `lucide-react` (ensure `Github` icon in `Navbar.tsx` works) | M3 | survey |
| 16 | Client UI & Form Upgrades | Upgrade `sonner@2.0.8`, `firebase@11.10.0`, `motion@14.7.1`, `react-hook-form@7.91.0`, `zod@3.25.76` | M3 | survey |
| 17 | Full Verification (Typecheck & Lint) | Run `npx tsc --noEmit`, server build, and `npm run lint` | M4 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Core Manifest, Tooling & Prisma | Update core packages in `package.json`, add `dotenv`, update lint script, run npm install & prisma generate | none | DONE |
| 2 | Backend, Auth & Realtime Stack | Update Arctic, Argon2, Socket.io, ky, date-fns, cross-env; verify server.ts and src/auth.ts | M1 | DONE |
| 3 | Client, UI & Form Stack | Update TanStack Query, Tailwind v4, Radix primitives, Lucide, Sonner, Firebase, Motion, Hook-Form; adapt QueryFilters in mutations | M2 | DONE |
| 4 | Full Verification & Hardening | Modernize ESLint flat config, resolve Turbopack configuration, rename route directory, execute full clean build | M3 | DONE |

## Interface Contracts
### `package.json` ↔ Core Scripts
- `"lint"` script executes `eslint .` without relying on removed `next lint`.
- `server.ts` imports `"dotenv/config"` resolved directly from project dependencies.

### Auth ↔ Database (`src/auth.ts` ↔ `prisma`)
- Prisma client remains 6.x singleton (`@/lib/prisma`).
- `new PrismaAdapter(prisma.session, prisma.user)` remains 100% compatible with Prisma 6.19.3.
- All session reads await `cookies()`.

### Client ↔ Networking (`src/lib/ky.ts` ↔ `ky`)
- `ky.create({ parseJson: (text) => ... })` remains compatible with `ky@2.2.0`.

### UI ↔ Icons (`src/app/(main)/Navbar.tsx` ↔ `lucide-react`)
- Navbar navigation bar renders GitHub link without missing icon runtime or compilation error.

## Code Layout
- `package.json`: Project manifest & scripts
- `server.ts`: Custom HTTP server with Socket.io & Next.js handler
- `prisma/schema.prisma`: Database models & schema
- `src/auth.ts`: Lucia authentication instance & helper functions
- `src/lib/ky.ts`: Ky client singleton
- `src/lib/Firebase.ts`: Firebase client & storage upload functions
- `src/components/ui/`: Radix-based UI components (shadcn)
- `src/app/(main)/Navbar.tsx`: Main navigation bar with GitHub icon
- `src/components/post/editor/mutations.ts`: Post editor mutations (QueryFilters)
- `src/components/post/mutation.ts`: Post delete/action mutations (QueryFilters)
- `src/app/api/message/[messageId]/route.ts`: Message route handler (aligned with [messageId])
- `eslint.config.mjs`: ESLint 9 native flat configuration
- `next.config.ts`: Next.js config (with turbopack configuration and sharp external)
- `tsconfig.server.json`: Custom server TypeScript config (with `"moduleResolution": "node"`)
