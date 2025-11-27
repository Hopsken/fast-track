# Repository Guidelines

## Project Structure & Module Organization

- Monorepo: Turborepo + pnpm workspaces; prefer pnpm over npm.
- Apps: Extension at `apps/extension`; website (Next.js) at `apps/website`; shared code in `packages/`.
- Source (extension): `apps/extension/src/` with key folders `entrypoints/` (background, popup, options, `*.content.ts`), `components/`, `hooks/`, `services/`, `storage/` (typed persistence), `stores/`, `utils/`, `assets/`.
- Config (extension): `apps/extension/wxt.config.ts`, `apps/extension/web-ext.config.ts`, `apps/extension/tsconfig.json` (extends `apps/extension/.wxt/tsconfig.json`), root `eslint.config.js`, `.prettierrc.cjs`.
- Builds: extension output in `apps/extension/.output/`; zips produced via `wxt zip`. Load unpacked from `apps/extension/.output/chromium-mv3` (or `firefox-mv3`).

## Environment

- Node.js 22; pnpm installed. Test against Chrome/Firefox/Edge locally when working on the extension.

## Tech Stack & Architecture

- Frontend: React 19 + TypeScript with strict mode; Tailwind/DaisyUI referenced in docs.
- Build/runtime: WXT + Vite; WebExt proxy services for messaging; Jira integration via `jira.js`; reactive flows with RxJS; state via Zustand slices; data cached in typed storage/RxDB (persistent IndexedDB preferred).
- Runtime roles: Background (`apps/extension/src/entrypoints/background/`) coordinates omnibox/install, registers proxy services, and fronts RxDB; content scripts (`*.content.ts`) use `PageObserver` for Jira SPA changes; popup/options are React UIs with dumb components and hook/service logic.

## Key Commands (run at repo root)

- Extension dev/build: `pnpm dev`, `pnpm build`, `pnpm zip`;
- Website: `pnpm dev:website | build:website`.
- Quality gates: `pnpm lint`, `pnpm test`, `pnpm typecheck`.
- Turborepo filters: use `--filter=extension` or `--filter=website` for project-specific lint/test/typecheck.

## Coding Style & Standards

- Formatting: 2 spaces, no semicolons, single quotes, 80-char width; alphabetized imports; prefer `~/` aliases and `#imports` in extension code.
- Formatting workflow: rely on lint auto-fix (`pnpm lint:fix`) instead of hand-formatting; use `pnpm format:check` for verification.
- Naming: React components in PascalCase; hooks start with `use*`; services suffixed with `Service`; colocate Zustand slices in `stores/`.
- Principles: SOLID, DRY, KISS, YAGNI; keep functions small with early returns; TypeScript strict (avoid `any`, prefer generics and type guards); favor named exports.
- Logging: Avoid `console`; use structured logger when needed. Keep storage access typed and error-safe.

## Architecture Overview

- Search: RxJS orchestration with debounce/cancel; merges Jira API results with cached RxDB/storage data; keep UI dumb and hook/service-driven.
- State: Lightweight Zustand slices; selectors optimized (e.g., `useShallow`).
- Storage: Typed storage schemas; secure token handling; no sensitive values in logs.
- Content scripts: Lightweight DOM observers and effects; re-apply on SPA route changes via `PageObserver`.

## Testing Guidelines

- Tests run with Vitest; prefer React Testing Library for components.
- Naming: Place tests next to code as `*.test.ts`/`*.test.tsx` (ESLint recognizes these).
- Scope: Unit-test utilities, services, and complex hooks; keep tests deterministic.
- On code changes, run `turbo run typecheck lint:fix test`.

## Commit & Pull Request Guidelines

- Commits follow Conventional Commits (e.g., `feat(search): add RxJS orchestration`, `fix: resolve TS errors`).
- PRs: Clear description, linked issues, and screenshots/GIFs for UI changes (popup/options/content). Note any permission changes.
- CI and zips read output from `apps/extension/.output/`.

## Security & Configuration Tips

- Do not commit tokens or secrets. Jira tokens live only in typed storage; never log them.
- Keep extension permissions minimal (`storage`, `tabs`, Atlassian host permissions). Reflect permission changes in `apps/extension/wxt.config.ts` and note them in PRs/docs.

## Agent Notes

- Prefer small, focused patches; avoid unrelated refactors.
- When adding a new app, place it under `apps/` and wire scripts so Turborepo can run them; put shared code in `packages/`.

## MCP

Always use context7 when i need code generation, setup or configuration steps, or library / API documentations. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask you to do so.

Use these known libraries in the following:

- Wxt: `/wxt-dev/wxt`
- RxJS: `/reactivex/rxjs`
- Zustand: `/pmndrs/zustand`
- Jira.js: `/mrrefactoring/jira.js`
- WebExt Core: `/aklinker1/webext-core` for messaging and proxy service
