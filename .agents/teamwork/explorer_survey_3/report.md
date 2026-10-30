# Client, UI, State Management & File Upload Dependency Upgrade Survey Report

**Project**: WePost (`/home/md-taqui-imam/my-projects/WePost`)  
**Explorer**: Survey Explorer 3 (Client, UI, State Management, Media & Uploads)  
**Date**: October 28, 2026  
**Status**: Completed  

---

## 1. Executive Summary

This survey conducted an in-depth audit of WePost's client-side, UI, state management, media processing, and file upload dependencies. Each package was evaluated against npm registry releases, React 19 compatibility, Next.js 15+ App Router patterns, Tailwind CSS v4 design tokens, and actual codebase consumption across `src/components/ui/`, `src/components/`, `src/hooks/`, and `src/app/`.

### Key Survey Findings:
1. **Critical Breaking Change in `lucide-react`**:
   - Upgrading from `0.479.0` to latest stable `1.63.0` removes brand icons. Specifically, `Github` was removed in Lucide v1.0 and is actively imported in `src/app/(main)/Navbar.tsx:6`. Upgrading directly to `1.63.0` without code changes causes a TypeScript build break (`Module 'lucide-react' has no exported member 'Github'`).
   - *Recommendation*: Migrate `Github` in `Navbar.tsx` to an inline SVG / custom Icon component before moving to `1.63.0`, OR upgrade within the 0.x line to `0.577.0` (zero breaking changes).
2. **File Upload Architecture Clarification (UploadThing vs Firebase)**:
   - While the survey prompt specifically tasked checking UploadThing (`@uploadthing/react`, `uploadthing` 7.5.2) and `src/app/api/uploadthing/`, **UploadThing is not installed or configured in this repository**.
   - Instead, file and image uploads in WePost are handled via **Firebase Storage** (`"firebase": "^11.6.0"`) encapsulated in `src/lib/Firebase.ts` and consumed in `src/components/post/editor/PostEditor.tsx` and `src/components/customComponents/actionButtons/EditProfileDialog.tsx`.
   - Both Firebase Storage and latest UploadThing (`uploadthing@7.7.4` / `@uploadthing/react@7.3.3`) have been audited for React 19 compatibility.
3. **Chat Architecture Clarification (Stream Chat vs Socket.io)**:
   - Neither `stream-chat` nor `stream-chat-react` is installed or used in WePost. WePost uses custom WebSockets via `socket.io` and `socket.io-client` (`^4.8.1` -> `4.8.4`) driven by `server.ts` and `src/hooks/SocketContext.tsx`.
4. **TanStack React Query v5**:
   - Currently on `^5.67.2`. Latest stable is `5.105.0`.
   - 100% backward-compatible within major version v5; first-class React 19 support verified via Context7 docs.
5. **Tailwind CSS v4 & Styling Stack**:
   - Currently on `tailwindcss@4.0.12` and `@tailwindcss/postcss@4.0.12`. Latest is `4.3.3`.
   - `postcss.config.mjs` cleanly specifies `plugins: ["@tailwindcss/postcss"]`.
   - `src/app/globals.css` uses `@import "tailwindcss";`, `@plugin "tailwindcss-animate";`, and `@theme inline`.
   - `tailwind-merge` upgrades cleanly from `3.0.2` to `3.7.0` with full Tailwind v4 class resolution.
   - `prettier-plugin-tailwindcss` upgrades from `0.6.11` to `0.8.1`.
6. **Peer Dependencies and `.npmrc` (`legacy-peer-deps=true`)**:
   - Testing `npm install --legacy-peer-deps=false` reveals that the primary peer conflict stems from `@lucia-auth/adapter-prisma@4.0.1` expecting `@prisma/client@^4.2.0 || ^5.0.0` while Prisma 6 is installed, as well as `tailwindcss-animate@1.0.7` having peerDependency `tailwindcss: ">=3.0.0 || insiders"`.
   - Keeping `legacy-peer-deps=true` in `.npmrc` remains essential unless those packages are adapted or wrapped.

---

## 2. Detailed Dependency Survey

### 2.1 State Management: TanStack React Query

| Package | Current Version | Wanted Version | Latest Stable | Upgrade Recommendation | Breaking Changes / Risk |
|---|---|---|---|---|---|
| `@tanstack/react-query` | `^5.67.2` (installed: 5.67.2) | `5.105.0` | `5.105.0` | `^5.105.0` | Low / None (Non-breaking v5 minor) |
| `@tanstack/react-query-devtools` | Not installed | - | `5.105.0` | Optional `^5.105.0` | Low |

#### Context7 & Codebase Audit:
- **Usage**: Used extensively across feeds (`MyFeed`, `ProfileFeed`, `BookmarkFeed`, `NotificationFeed`, `MessageUsersFeed`), comment mutations (`src/components/post/comment/mutation.ts`), post mutations (`src/components/post/editor/mutations.ts`), and like/bookmark state.
- **Provider Setup**: `src/components/ReactQueryProvider.tsx` defines:
  ```tsx
  "use client";
  import React, { useState } from "react";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = useState(new QueryClient());
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  export default ReactQueryProvider;
  ```
- **React 19 Compatibility**: `@tanstack/react-query@5.105.0` explicitly declares peerDependencies:
  ```json
  { "react": "^18 || ^19", "@types/react": "^18 || ^19" }
  ```
- **Infinite Queries & Mutations**: All usages (`useInfiniteQuery`, `useMutation`, `useQueryClient`, `infiniteQueryOptions`) conform to current v5 APIs. No syntax adjustments required.

---

### 2.2 Styling Ecosystem: Tailwind CSS v4 & PostCSS

| Package | Current Version | Wanted Version | Latest Stable | Upgrade Recommendation | Breaking Changes / Risk |
|---|---|---|---|---|---|
| `tailwindcss` | `^4` (installed: 4.0.12) | `4.3.3` | `4.3.3` | `^4.3.3` | Low (Patch/Minor stability) |
| `@tailwindcss/postcss` | `^4` (installed: 4.0.12) | `4.3.3` | `4.3.3` | `^4.3.3` | Low |
| `postcss` | 8.5.3 (transitive) | 8.5.32 | 8.5.32 | `^8.5.32` (if added) | Low |
| `tailwind-merge` | `^3.0.2` (installed: 3.0.2) | `3.7.0` | `3.7.0` | `^3.7.0` | Low |
| `clsx` | `^2.1.1` (installed: 2.1.1) | `2.1.1` | `2.1.1` | `^2.1.1` | None (Already latest) |
| `class-variance-authority` | `^0.7.1` (installed: 0.7.1) | `0.7.1` | `0.7.1` | `^0.7.1` | None (Already latest) |
| `tailwindcss-animate` | `^1.0.7` (installed: 1.0.7) | `1.0.7` | `1.0.7` | `^1.0.7` | Low (Requires `.npmrc` peer bypass) |
| `prettier-plugin-tailwindcss` | `^0.6.11` (installed: 0.6.11) | `0.6.14` | `0.8.1` | `^0.8.1` | Low |

#### Audit Findings:
- `src/app/globals.css` uses Tailwind v4's native `@import "tailwindcss";` and `@theme inline` blocks.
- `@plugin "tailwindcss-animate";` is successfully loaded via Tailwind v4's legacy plugin bridge.
- `tailwind-merge` v3.7.0 improves class deduplication for new Tailwind v4 utilities and arbitrary properties.
- `prettier-plugin-tailwindcss@0.8.1` works seamlessly with Prettier 3.5.3+ and correctly handles Tailwind v4 class ordering in JSX attributes and `cn()` calls.

---

### 2.3 Radix UI Primitives & shadcn Components

All Radix UI primitives installed in WePost were verified against npm and React 19:

| Package | Current Version | Wanted Version | Latest Stable | React 19 Peer Dependency |
|---|---|---|---|---|
| `@radix-ui/react-avatar` | `^1.1.3` | `1.3.1` | `1.3.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-dialog` | `^1.1.6` | `1.3.1` | `1.3.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-dropdown-menu` | `^2.1.6` | `2.2.1` | `2.2.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-label` | `^2.1.2` | `2.1.17` | `2.1.17` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-select` | `^2.1.6` | `2.4.1` | `2.4.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-separator` | `^1.1.2` | `1.2.0` | `1.2.0` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-slider` | `^1.3.2` | `1.6.1` | `1.6.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-slot` | `^1.1.2` | `1.5.0` | `1.5.0` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-tabs` | `^1.1.3` | `1.2.1` | `1.2.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |
| `@radix-ui/react-tooltip` | `^1.1.8` | `1.4.1` | `1.4.1` | `^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0` |

#### shadcn Component Inspection:
- Components in `src/components/ui/` (`dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `button.tsx`, etc.) are already modernized to use `data-slot="..."`, `React.ComponentProps<...>`, and `@radix-ui/react-slot`.
- Radix UI releases 1.3.1 - 2.4.1 resolve hydration mismatches with React 19's new ref-as-prop behavior and strict DOM hydration checks.
- All can be safely upgraded simultaneously to latest releases.

---

### 2.4 Lucide Icons: `lucide-react` (CRITICAL BREAKING CHANGE)

| Package | Current Version | Wanted Version | Latest Stable | Upgrade Recommendation | Risk Level |
|---|---|---|---|---|---|
| `lucide-react` | `^0.479.0` (installed: 0.479.0) | `0.479.0` | `1.63.0` | **Option A**: `^0.577.0` (Safe)<br>**Option B**: `^1.63.0` (Requires SVG migration) | **HIGH** if 1.x without code edit |

#### The Discovery & Codebase Evidence:
In Lucide v1.0.0, the Lucide team made an architectural decision to **remove all third-party brand icons** (including `Github`, `Twitter`, `Facebook`, etc.) from the core package to focus strictly on generic UI iconography.
Across WePost, 34 distinct icons are imported from `lucide-react`:
`LogOut`, `Settings`, `User`, `Search`, `Tag`, `UserPlus`, `Upload`, `Loader2`, `Camera`, `Pin`, `Bell`, `Heart`, `Copy`, `Share2`, `AtSign`, `LockIcon`, `MessageSquare`, `Mail`, `MoreHorizontal`, `Trash2`, `Image`, `Trash`, `Bookmark`, `Home`, `CheckIcon`, `ChevronDownIcon`, `ChevronUpIcon`, `MailPlus`, `Check`, `ChevronRight`, `Circle`, `XIcon`, and **`Github`**.

All 33 generic UI icons remain intact and functional in `lucide-react@1.63.0`.
However, `Github` is imported in `src/app/(main)/Navbar.tsx:6`:
```tsx
import { Github } from "lucide-react";
...
<Link href="https://github.com/taqui-786/WePost" target="_blank" className={cn(buttonVariants({variant:"ghost"}),"font-semibold animate-pulse")}>
  <Github size={4} /> Github
</Link>
```
If `lucide-react` is bumped to `^1.63.0`, `npm run build` will fail with:
```
Type error: Module '"lucide-react"' has no exported member 'Github'.
```

#### Remediation Paths:
- **Option 1 (Recommended for pure dependency bump)**: Upgrade to `lucide-react@^0.577.0` (the highest release in the 0.x line before v1.0). In `0.577.0`, `Github` is present, all other icons are updated, and no code changes are required.
- **Option 2 (Modernize to 1.63.0)**: Replace `<Github />` in `Navbar.tsx` with a custom SVG or dedicated icon component in `src/components/Icon.tsx`:
  ```tsx
  export function GithubIcon({ className, size = 16 }: { className?: string; size?: number }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }
  ```

---

### 2.5 Toast Notifications: Sonner

| Package | Current Version | Wanted Version | Latest Stable | Upgrade Recommendation | Risk Level |
|---|---|---|---|---|---|
| `sonner` | `^2.0.1` (installed: 2.0.1) | `2.0.8` | `2.0.8` | `^2.0.8` | Low |

- **Usage**: Configured in `src/components/ui/sonner.tsx` wrapping Sonner with `next-themes`, and invoked as `toast.success(...)` across actions and mutations.
- **Compatibility**: Fully compatible with React 19. Fixes positioning, dark-mode CSS variable bindings, and portal rendering issues present in 2.0.1.

---

### 2.6 File Uploads: UploadThing vs Firebase Storage

| Package | In Package.json? | Used in Code? | Latest Stable | Recommendation |
|---|---|---|---|---|
| `uploadthing` | No | No | `7.7.4` | Keep out unless refactoring from Firebase |
| `@uploadthing/react` | No | No | `7.3.3` | Keep out unless refactoring from Firebase |
| `firebase` | Yes (`^11.6.0`) | Yes (`src/lib/Firebase.ts`) | `11.10.0` (v11) / `13.1.0` (v13) | Upgrade to `^11.10.0` |

#### Architectural Analysis:
The prompt explicitly requested checking UploadThing and `src/app/api/uploadthing/`. However, codebase inspection demonstrates:
1. `src/app/api/uploadthing/` does **not exist**.
2. WePost's entire media pipeline uses Firebase Client SDK:
   - `src/lib/Firebase.ts` initializes Firebase Storage and exports `handleFirebaseImageUpload` and `handleMultipleFirebaseUploads`.
   - Used in `src/components/post/editor/PostEditor.tsx` for post attachments and `src/components/customComponents/actionButtons/EditProfileDialog.tsx` for avatar updates.
3. **If UploadThing were to be introduced**: `@uploadthing/react@7.3.3` supports React 19 (`peerDependencies: { "react": "^17.0.2 || ^18.0.0 || ^19.0.0", "next": "*" }`), and `uploadthing@7.7.4` supports Tailwind v4.
4. **Current Firebase Recommendation**: Upgrade `firebase` from `11.6.0` to `^11.10.0` (latest v11 maintenance release). Note that Firebase v12/v13 introduced breaking changes to modular initialization and auth emulator configs, which are unnecessary for this upgrade pass.

---

### 2.7 Rich Text Editor: TipTap Stack

| Package | Current Version | Wanted Version | Latest Stable | Recommendation | Risk Level |
|---|---|---|---|---|---|
| `@tiptap/react` | `^2.11.5` | `2.27.3` | `3.32.0` | `^2.27.3` | Medium (if v3) / Low (if v2) |
| `@tiptap/starter-kit` | `^2.11.5` | `2.27.3` | `3.32.0` | `^2.27.3` | Medium (if v3) / Low (if v2) |
| `@tiptap/extension-placeholder` | `^2.11.5` | `2.27.3` | `3.32.0` | `^2.27.3` | Medium (if v3) / Low (if v2) |
| `@tiptap/pm` | `^2.11.5` | `2.27.3` | `3.32.0` | `^2.27.3` | Medium (if v3) / Low (if v2) |

#### Analysis:
- In `src/components/post/editor/PostEditor.tsx`:
  ```tsx
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({ placeholder: "what's crack-a-lackin ?" }),
    ],
  });
  ```
- **Tiptap v3 Breaking Changes**:
  1. `Placeholder` has been moved to `@tiptap/extensions` (the `@tiptap/extension-placeholder` package was deprecated/reorganized).
  2. `shouldRerenderOnTransaction` now defaults to `false` in `@tiptap/react` v3.
  3. UMD builds removed; Tippy.js dropped in favor of Floating UI.
- **Recommended Path**: Update all 4 TipTap packages to `^2.27.3` (`v2-latest`). This brings full React 19 compatibility (`peerDependencies: { "react": "^17.0.0 || ^18.0.0 || ^19.0.0" }`) without requiring package reorganization or editor refactoring.

---

### 2.8 Animation Libraries: `motion` & `framer-motion`

| Package | Current Version | Wanted Version | Latest Stable | Upgrade Recommendation | Risk Level |
|---|---|---|---|---|---|
| `motion` | `^12.9.4` | `12.43.0` | `14.7.1` | `^14.7.1` | Low |
| `framer-motion` | `^12.9.4` | `12.43.0` | `14.7.1` | Remove or keep at `^14.7.1` | Low |

- **Usage**: `src/components/customComponents/animations/BackgroundLInes.tsx` imports `{ motion } from "motion/react"`.
- **Finding**: Nothing in the codebase imports `from "framer-motion"`. `framer-motion` in `package.json` is redundant legacy residue.
- `motion@14.7.1` has peer dependencies `"react": "^18.0.0 || ^19.0.0"`. Upgrading `motion` to `^14.7.1` is safe and preserves all SVG path animation functionality in `BackgroundLInes.tsx`.

---

### 2.9 Forms, Validation & Utilities

| Package | Current Version | Wanted Version | Latest Stable | Recommendation | Risk Level |
|---|---|---|---|---|---|
| `react-hook-form` | `^7.54.2` | `7.91.0` | `7.91.0` | `^7.91.0` | Low (Minor bump) |
| `@hookform/resolvers` | `^4.1.3` | `4.1.3` | `6.0.2` | `^6.0.2` | Low |
| `zod` | `^3.24.2` | `3.25.76` | `4.6.7` | `^3.25.76` | Low (Avoid v4 breaking changes) |
| `react-easy-crop` | `^5.4.1` | `5.5.7` | `6.2.4` | `^6.2.4` | Low (Verified API compatibility) |
| `react-intersection-observer` | `^9.16.0` | `9.16.0` | `11.0.1` | `^11.0.1` | Low (Verified `useInView` compatibility) |
| `react-linkify-it` | `^1.0.8` | `1.0.8` | `2.0.0` | `^2.0.0` | Low (React 19 native update) |
| `date-fns` | `^4.1.0` | `4.4.0` | `4.4.0` | `^4.4.0` | Low |
| `next-themes` | `^0.4.4` | `0.4.6` | `0.4.6` | `^0.4.6` | Low |

#### Detailed Observations:
1. **`zod` & `@hookform/resolvers`**:
   - `@hookform/resolvers@6.0.2` specifies `"peerDependencies": { "react-hook-form": "^7.55.0", "zod": "^3.25.0 || ^4.0.0" }`.
   - Bumping `react-hook-form` to `^7.91.0` and `zod` to `^3.25.76` satisfies these peer constraints cleanly while avoiding Zod 4's schema migration overhead.
2. **`react-easy-crop@6.2.4`**:
   - `src/components/customComponents/actionButtons/EditProfileDialog.tsx` uses `<Cropper image={...} crop={...} zoom={...} rotation={...} aspect={1} onCropChange={...} onCropComplete={...} onZoomChange={...} cropShape="round" showGrid={false} />`.
   - All props and the `Area` type remain identical in v6.2.4.
3. **`react-intersection-observer@11.0.1`**:
   - `src/components/customComponents/InfiniteScrollingContainer.tsx` and `src/components/messages/MessagePage.tsx` use `useInView({ rootMargin: "200px", onChange(inView) { if (inView) { ... } } })`.
   - v11 suppresses false initial emissions on mount, which improves infinite scroll performance and prevents unwanted double-fetches.
4. **`react-linkify-it@2.0.0`**:
   - v2.0.0 is an ESM modernization built specifically for React 19 (`peerDependencies: { "react": "*" }`). `LinkIt` and `LinkItUrl` exports in `src/components/customComponents/Linkify.tsx` remain unchanged.

---

## 3. Comprehensive Target Version Matrix

| Category | Package | Current | Recommended Target | Risk Level | Notes |
|---|---|---|---|---|---|
| **State Management** | `@tanstack/react-query` | `5.67.2` | `^5.105.0` | Low | Full React 19 support, non-breaking |
| | `@tanstack/react-query-devtools` | Not installed | `^5.105.0` (optional) | Low | Can be added for debugging if desired |
| **Styling & CSS** | `tailwindcss` | `4.0.12` | `^4.3.3` | Low | Tailwind v4 stable line |
| | `@tailwindcss/postcss` | `4.0.12` | `^4.3.3` | Low | Matches tailwindcss |
| | `tailwind-merge` | `3.0.2` | `^3.7.0` | Low | Tailwind v4 class conflict support |
| | `clsx` | `2.1.1` | `^2.1.1` | None | Already latest |
| | `class-variance-authority` | `0.7.1` | `^0.7.1` | None | Already latest |
| | `tailwindcss-animate` | `1.0.7` | `^1.0.7` | Low | Retain in .npmrc peer bypass |
| | `prettier-plugin-tailwindcss` | `0.6.11` | `^0.8.1` | Low | Tailwind v4 sorting |
| **Radix UI** | `@radix-ui/react-avatar` | `1.1.3` | `^1.3.1` | Low | React 19 peer support |
| | `@radix-ui/react-dialog` | `1.1.6` | `^1.3.1` | Low | React 19 peer support |
| | `@radix-ui/react-dropdown-menu` | `2.1.6` | `^2.2.1` | Low | React 19 peer support |
| | `@radix-ui/react-label` | `2.1.2` | `^2.1.17` | Low | React 19 peer support |
| | `@radix-ui/react-select` | `2.1.6` | `^2.4.1` | Low | React 19 peer support |
| | `@radix-ui/react-separator` | `1.1.2` | `^1.2.0` | Low | React 19 peer support |
| | `@radix-ui/react-slider` | `1.3.2` | `^1.6.1` | Low | React 19 peer support |
| | `@radix-ui/react-slot` | `1.1.2` | `^1.5.0` | Low | React 19 peer support |
| | `@radix-ui/react-tabs` | `1.1.3` | `^1.2.1` | Low | React 19 peer support |
| | `@radix-ui/react-tooltip` | `1.1.8` | `^1.4.1` | Low | React 19 peer support |
| **Icons & Toast** | `lucide-react` | `0.479.0` | `^0.577.0` (or `^1.63.0`*) | **HIGH** if 1.x | *If 1.63.0, replace `Github` in `Navbar.tsx` |
| | `sonner` | `2.0.1` | `^2.0.8` | Low | React 19 portal/theme fixes |
| **File Storage** | `firebase` | `11.6.0` | `^11.10.0` | Low | Actual storage provider in `Firebase.ts` |
| | `uploadthing` | - | `7.7.4` (if introduced) | Low | Not in repo; compatible if needed |
| | `@uploadthing/react` | - | `7.3.3` (if introduced) | Low | Not in repo; compatible if needed |
| **Editor** | `@tiptap/react` | `2.11.5` | `^2.27.3` | Low | Stay on v2-latest for zero breaking code changes |
| | `@tiptap/starter-kit` | `2.11.5` | `^2.27.3` | Low | v2-latest |
| | `@tiptap/extension-placeholder`| `2.11.5` | `^2.27.3` | Low | v2-latest |
| | `@tiptap/pm` | `2.11.5` | `^2.27.3` | Low | v2-latest |
| **Animation** | `motion` | `12.9.4` | `^14.7.1` | Low | Modern motion library |
| | `framer-motion` | `12.9.4` | Remove (or `^14.7.1`) | Low | Redundant dependency |
| **Forms & Utils** | `react-hook-form` | `7.54.2` | `^7.91.0` | Low | Compatible with resolvers v6 |
| | `@hookform/resolvers` | `4.1.3` | `^6.0.2` | Low | Requires RHF ^7.55 and Zod ^3.25 |
| | `zod` | `3.24.2` | `^3.25.76` | Low | Avoids Zod 4 breaking changes |
| | `react-easy-crop` | `5.4.1` | `^6.2.4` | Low | Compatible API confirmed |
| | `react-intersection-observer` | `9.16.0` | `^11.0.1` | Low | Resilient React 19 lifecycles |
| | `react-linkify-it` | `1.0.8` | `^2.0.0` | Low | React 19 ESM update |
| | `date-fns` | `4.1.0` | `^4.4.0` | Low | Bug fixes & date format enhancements |
| | `next-themes` | `0.4.4` | `^0.4.6` | Low | Next 15 / React 19 stability |

---

## 4. Step-by-Step Migration Recommendations

When the implementer executes this upgrade milestone, follow this structured procedure:

### Step 1: Handle the `lucide-react` Decision
- **If choosing Option A (Conservative / Zero Code Changes)**:
  - Install `lucide-react@^0.577.0`.
  - No changes needed in `src/app/(main)/Navbar.tsx`.
- **If choosing Option B (Modern 1.x Line)**:
  - Create a custom GitHub icon component or embed inline SVG in `src/app/(main)/Navbar.tsx`:
    ```tsx
    function GithubIcon({ className }: { className?: string }) {
      return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
          <path d="M9 18c-4.51 2-5-2-7-2"/>
        </svg>
      );
    }
    ```
  - Remove `import { Github } from "lucide-react";` from `Navbar.tsx` and use `<GithubIcon />`.
  - Install `lucide-react@^1.63.0`.

### Step 2: Keep `.npmrc` (`legacy-peer-deps=true`) Intact
- Do **not** delete `.npmrc` or disable `legacy-peer-deps=true`. `@lucia-auth/adapter-prisma` and `tailwindcss-animate` have strict v3/v5 peer ranges that will otherwise halt `npm install`.

### Step 3: Upgrade Safe Core UI Packages
Update `package.json` with the recommended target versions:
```json
{
  "dependencies": {
    "@hookform/resolvers": "^6.0.2",
    "@radix-ui/react-avatar": "^1.3.1",
    "@radix-ui/react-dialog": "^1.3.1",
    "@radix-ui/react-dropdown-menu": "^2.2.1",
    "@radix-ui/react-label": "^2.1.17",
    "@radix-ui/react-select": "^2.4.1",
    "@radix-ui/react-separator": "^1.2.0",
    "@radix-ui/react-slider": "^1.6.1",
    "@radix-ui/react-slot": "^1.5.0",
    "@radix-ui/react-tabs": "^1.2.1",
    "@radix-ui/react-tooltip": "^1.4.1",
    "@tanstack/react-query": "^5.105.0",
    "@tiptap/extension-placeholder": "^2.27.3",
    "@tiptap/pm": "^2.27.3",
    "@tiptap/react": "^2.27.3",
    "@tiptap/starter-kit": "^2.27.3",
    "date-fns": "^4.4.0",
    "firebase": "^11.10.0",
    "lucide-react": "^0.577.0",
    "motion": "^14.7.1",
    "next-themes": "^0.4.6",
    "react-easy-crop": "^6.2.4",
    "react-hook-form": "^7.91.0",
    "react-intersection-observer": "^11.0.1",
    "react-linkify-it": "^2.0.0",
    "sonner": "^2.0.8",
    "tailwind-merge": "^3.7.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "prettier-plugin-tailwindcss": "^0.8.1",
    "tailwindcss": "^4.3.3"
  }
}
```

### Step 4: Verification Command
Run:
```bash
npm install
npx tsc --noEmit
npm run lint
```
Verify that all TypeScript types, icon imports, and Next.js builds resolve cleanly without regressions.
