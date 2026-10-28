# Agent Instructions (WePost)

Canonical instructions for AI coding agents vibecoding in this repository.

## Stack Overview
- **Framework**: Next.js 15 (App Router, Server Actions) + React 19
- **Server**: Custom Node HTTP server with Socket.io (`server.ts`, nodemon)
- **Database & ORM**: PostgreSQL (Neon) with Prisma ORM (`prisma/schema.prisma`)
- **Authentication**: Lucia Auth (`src/auth.ts`, session cookies, Arctic Google OAuth)
- **Client Fetching & State**: TanStack React Query + `ky` (`src/lib/ky.ts`)
- **UI & Styling**: Tailwind CSS v4, Lucide Icons, Radix UI / shadcn/ui (`src/components/ui/`)

## Package Manager & Commands
Use **npm**:
| Task | Command |
|------|---------|
| Dev Server | `npm run dev` (runs nodemon + custom Socket.io server) |
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
- **WebSockets / Realtime**: Socket.io handlers are defined in `server.ts` and consumed via `src/hooks/SocketContext.tsx`.
- **Verification**: Run `npx tsc --noEmit` and `npm run lint` before finishing any task.

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Antigravity <noreply@google.com>
```

