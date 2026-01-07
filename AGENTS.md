# Repository Guidelines

## Project Structure & Module Organization

- Monorepo: Turborepo + pnpm workspaces; prefer pnpm over npm.
- Apps: Extension at `apps/extension`; website (Next.js) at `apps/website`; shared code in `packages/`.
- Shared UI: `packages/ui` owns Shadcn-based shared components; apps import from it,
  and add missing pieces via the Shadcn CLI run from `packages/ui`.
- Source (extension): `apps/extension/src/` with key folders `entrypoints/` (background, popup, options, `*.content.ts`), `components/`, `hooks/`, `services/`, `storage/` (typed persistence), `stores/`, `utils/`, `assets/`.
- Config (extension): `apps/extension/wxt.config.ts`, `apps/extension/web-ext.config.ts`, `apps/extension/tsconfig.json` (extends `apps/extension/.wxt/tsconfig.json`), root `eslint.config.js`, `.prettierrc.cjs`.
- Builds: extension output in `apps/extension/.output/`; zips produced via `wxt zip`. Load unpacked from `apps/extension/.output/chromium-mv3` (or `firefox-mv3`).

### Environment

- Node.js 22; pnpm installed. Test against Chrome/Firefox/Edge locally when working on the extension.

### Tech Stack & Architecture

- Frontend: React 19 + TypeScript with strict mode; Tailwind/DaisyUI referenced in docs.
- Build/runtime: WXT + Vite; WebExt proxy services for messaging; Jira integration via `jira.js`; reactive flows with RxJS; state via Zustand slices; data cached in typed storage and React Query (persistent IndexedDB preferred).
- Runtime roles: Background (`apps/extension/src/entrypoints/background/`) coordinates omnibox/install, registers proxy services, and fronts RxDB; content scripts (`*.content.ts`) use `PageObserver` for Jira SPA changes; popup/options are React UIs with dumb components and hook/service logic.

### Key Commands (run at repo root)

- Extension dev/build: `pnpm dev`, `pnpm build`, `pnpm zip`;
- Website: `pnpm dev:website | build:website`.
- Quality gates: `pnpm lint`, `pnpm test`, `pnpm typecheck`.
- Turborepo filters: use `--filter=extension` or `--filter=website` for project-specific lint/test/typecheck.

## Core Principles

MUST followed principles of the Development Process:

### Principle I: Library-First Principle

Every feature must begin as a standalone library—no exceptions. No feature shall be implemented directly within application code without first being abstracted into a reusable library component.

### Principle II: Test-First Imperative

The most transformative article—no code before tests:

This is NON-NEGOTIABLE: All implementation MUST follow strict Test-Driven Development.
No implementation code shall be written before:

1. Unit tests are written
2. Tests are validated and approved by the user
3. Tests are confirmed to FAIL (Red phase)

### Principle III: Simplicity and Anti-Abstraction

Section 7.3: Minimal Project Structure

- Maximum 3 projects for initial implementation
- Additional projects require documented justification

Section 8.1: Framework Trust

- Use framework features directly rather than wrapping them

### Principle IV: Integration-First Testing

Prioritizes real-world testing over isolated unit tests:

Tests MUST use realistic environments:

- Prefer real databases over mocks
- Use actual service instances over stubs
- Contract tests mandatory before implementation

## Quality Gates

- Changes MUST keep `pnpm lint`, `pnpm typecheck`, and `pnpm test` clean.
- No new `any`, `@ts-ignore`, or disabled lint rules without documented justification.
- Diffs MUST stay focused; unrelated refactors require explicit approval.

### Test Evidence Required

- New or changed logic MUST include automated tests at the right level.
- Tests MUST be deterministic and colocated as `*.test.ts` or `*.test.tsx`.
- If automated tests are impractical, document the exception and add manual
  verification steps in the spec and tasks.

### UX Consistency Across Surfaces

- UI changes MUST reuse shared components from `packages/ui` when available.
- Loading, empty, error states, and keyboard behaviors MUST match existing
  patterns; deviations require a design note and approval.
- User-visible changes MUST be verified in all relevant surfaces
  (popup/options/content/website) and at least one additional browser for the
  extension.

### Performance Budgets and Regression Prevention

- Feature specs MUST declare performance budgets when impact is plausible
  (latency, CPU, memory, bundle size). Most actions should complete within 100ms.
- New network or compute-heavy flows MUST include a debounce/cancel/caching
  strategy and measurement notes.
- Performance regressions are release blockers until budgets are restored or an
  exception is approved.

### Code Quality Gates

- `pnpm lint`, `pnpm typecheck`, and `pnpm test` MUST pass before merge.
- UI changes MUST include manual verification notes covering target browsers
  and surfaces in tasks or PR notes.
- Performance targets declared in specs MUST be verified or explicitly waived.

## Commit & Pull Request Guidelines

- Commits follow Conventional Commits (e.g., `feat(search): add RxJS orchestration`, `fix: resolve TS errors`).
- PRs: Clear description, linked issues, and screenshots/GIFs for UI changes (popup/options/content). Note any permission changes.
- CI and zips read output from `apps/extension/.output/`.

## Security & Configuration Tips

- Do not commit tokens or secrets. Jira tokens live only in typed storage; never log them.
- Keep extension permissions minimal (`storage`, `tabs`, Atlassian host permissions). Reflect permission changes in `apps/extension/wxt.config.ts` and note them in PRs/docs.

## MCP

Always use context7 when i need code generation, setup or configuration steps, or library / API documentations. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask you to do so.

Use these known libraries in the following:

- Wxt: `/wxt-dev/wxt`
- RxJS: `/reactivex/rxjs`
- Zustand: `/pmndrs/zustand`
- Jira.js: `/mrrefactoring/jira.js`
- WebExt Core: `/aklinker1/webext-core` for messaging and proxy service
