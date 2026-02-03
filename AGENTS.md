# Repository Guidelines

## Project Structure

- **Monorepo**: Turborepo + pnpm workspaces (Node.js 22)
- **Apps**: `apps/extension` (WXT), `apps/website` (Next.js), `packages/` (shared code)
- **Shared UI**: `packages/ui` owns Shadcn components; add new ones via Shadcn CLI from there.
- **Extension source**: `apps/extension/src/` → `entrypoints/`, `components/`, `hooks/`, `services/`, `storage/`, `stores/`, `utils/`
- **Build output**: `apps/extension/.output/`; zips via `pnpm zip`
- **Shared configs**: `packages/eslint-config`, `packages/typescript-config`, `packages/tailwind-config`.

### Package names

- `pnpm run --filter extensions` owns extension code
- `pnpm run --filter website` owns website code
- `pnpm run --filter @internal/ui` owns Shadcn components; add new ones via Shadcn CLI from there.

## Tech Stack

- **Frontend**: React 19 + TypeScript (strict), Tailwind (tw-animate-css configured) + Shadcn
- **Build**: WXT + Vite, WebExt proxy services, `jira.js`, RxJS, Zustand, React Query, Lodash-es
- **Runtime**: Background (omnibox, proxy services) | Content scripts (`PageObserver`) | Popup/Options (React UI)

#### Framework

- Prefer zustand over React context for complex states
- Prefer lodash-es utils over custom implementations
- Use `pnpm run lint:fix` to auto fix eslint errors

## Core Principles

- **Module-First**: Abstract features into reusable modules before app code
- **Test-First (TDD)**: Write failing tests → then implement (non-negotiable)
- **Simplicity**: Use framework features directly; no unnecessary wrappers
- **Best practice**: Follow React best practices and composition patterns. Strictly one component per file. No big monolithic components.

## Quality Gates

- `pnpm lint`, `pnpm typecheck`, `pnpm test` must pass.
- For lint issues, don't worry about style/format issues, they can be autofixed. Focus on functional ones.
- No `any`, `@ts-ignore`, or disabled lint rules without justification
- UI changes: reuse `packages/ui`, verify across surfaces + browsers
- Performance: 100ms target for most actions; declare budgets; include debounce/cache strategies

## Commits & PRs

- Conventional Commits: `feat(scope):`, `fix:`, etc.
- PRs: clear description, linked issues, screenshots/GIFs for UI, note permission changes

## Security

- Never commit tokens/secrets; Jira tokens in typed storage only
- Minimal permissions (`storage`, `tabs`, Atlassian hosts); document changes in `wxt.config.ts`
