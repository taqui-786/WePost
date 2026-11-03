# Agent Instructions (WePost)

Canonical instructions for AI coding agents vibecoding in this repository.

## Stack Overview
- **Framework**: Next.js 15 (App Router, Server Actions) + React 19
- **Realtime**: Server-Sent Events via `src/app/api/realtime/route.ts`, fanned out over Upstash Redis Streams (`src/lib/realtime.ts`), consumed by `src/hooks/RealtimeProvider.tsx` (`useRealtimeEvent`). No custom server — Next.js runs standalone on Vercel.
- **Database & ORM**: PostgreSQL (Neon) with Prisma ORM (`prisma/schema.prisma`)
- **Authentication**: Lucia Auth (`src/auth.ts`, session cookies, Arctic Google OAuth)
- **Client Fetching & State**: TanStack React Query + `ky` (`src/lib/ky.ts`)
- **UI & Styling**: Tailwind CSS v4, Lucide Icons, Radix UI / shadcn/ui (`src/components/ui/`)

## Package Manager & Commands
Use **npm**:
| Task | Command |
|------|---------|
| Dev Server | `npm run dev` (Next.js dev server; realtime needs `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) |
| Build | `npm run build` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Prisma Generate | `npx prisma generate` |
| Prisma DB Push | `npx prisma db push` |

## Vibecoding Guardrails
- **Preserve Existing Code**: Never wipe existing logic or leave placeholders (e.g. `// ... rest of code`).
- **No Duplicate Libraries**: Use existing `ky` (`@/lib/ky`), never install `axios`. Use Lucia (`@/auth`), never switch to NextAuth.
- **Prisma Singleton**: Always import `prisma` from `@/lib/prisma`. Do not instantiate new `PrismaClient` instances.
- **Auth Checks**: Validate session in server components and server actions via `validateRequest()` from `@/auth`.
- **UI Conventions**:
  - Primitives reside in `src/components/ui/` (shadcn).
  - Domain/feature components go in `src/components/<feature>/` or `src/components/customComponents/`.
  - Use `sonner` for notifications.
- **Database Migrations**: Always run `npx prisma generate` after modifying `prisma/schema.prisma`.
- **Realtime**: Publish via `publishToUser` / `publishGlobal` from `@/lib/realtime` (server-side only). Subscribe on the client with `useRealtimeEvent(type, handler)` from `@/hooks/RealtimeProvider`. Never reintroduce a custom `server.ts`/Socket.io — Vercel runs Next.js standalone.
- **Verification**: Run `npx tsc --noEmit` and `npm run lint` before finishing any task.

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Antigravity <noreply@google.com>
```


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
