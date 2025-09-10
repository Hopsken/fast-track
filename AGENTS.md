# Repository Guidelines

## Project Structure & Module Organization
- Monorepo: Nx + pnpm workspaces.
- Apps: Extension lives at `apps/extension`.
- Source (extension): `apps/extension/src/` with key folders: `entrypoints/` (background, popup, options, `*.content.ts` scripts), `components/`, `hooks/`, `services/`, `storage/` (typed persistence), `stores/` (Zustand), `utils/`, `assets/`.
- Config (extension): `apps/extension/wxt.config.ts`, `apps/extension/web-ext.config.ts`, `apps/extension/tsconfig.json` (extends `apps/extension/.wxt/tsconfig.json`), root-level `eslint.config.js`, `.prettierrc.cjs`.
- Builds: extension output in `apps/extension/.output/`; zips produced via `wxt zip`.

## Build & Distribution
- Important: Prefer production builds over dev. Build locally, then load the output.
- Root scripts proxy to Nx targets for the extension app:
  - `pnpm build` | `pnpm build:ff` | `pnpm build:edge`
  - `pnpm zip:chrome` | `pnpm zip:firefox`
- Load the unpacked build from `apps/extension/.output/chromium-mv3` (or `firefox-mv3`).
- Quality gates (run at repo root): `pnpm typecheck`, `pnpm lint`, `pnpm format:check`.

## Coding Style & Naming Conventions
- Formatting: 2 spaces, no semicolons, single quotes, 80-char print width (Prettier).
- Imports: Alphabetized and grouped; prefer `~/` for `apps/extension/src` root and `#imports` where provided by WXT.
- React: Components in PascalCase (`MyComponent.tsx`); hooks start with `use*`.
- Entry points: Content scripts use `*.content.ts`; background at `apps/extension/src/entrypoints/background/`.
- Services/Stores: Suffix services with `Service`; colocate Zustand slices in `stores/`.

## Architecture Overview
- Background: `apps/extension/src/entrypoints/background/` handles omnibox and install flows.
- Content scripts: `apps/extension/src/entrypoints/*.content.ts` use `PageObserver` for Jira SPA changes.
- Search: RxJS-based orchestration (debounce/cancel), results persisted via typed `storage/`.
- State: Lightweight slices in `stores/` (Zustand); UI stays dumb, logic in hooks/services.

## Testing Guidelines
- Current status: No test runner configured. If adding tests, prefer Vitest + React Testing Library.
- Naming: Place tests next to code as `*.test.ts`/`*.test.tsx` (ESLint is configured to recognize these).
- Scope: Unit-test utilities, services, and complex hooks; keep tests deterministic.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (e.g., `feat(search): add RxJS orchestration`, `fix: resolve TS errors`).
- PRs: Include clear description, linked issues, and screenshots/GIFs for UI changes (popup/options/content behavior). Note any permission changes.
- Quality gates: Run `pnpm typecheck`, `pnpm lint`, and `pnpm format:check` before submitting.
- CI: GitHub Actions build/zip paths now read from `apps/extension/.output/`.

## Security & Configuration Tips
- Do not commit tokens or secrets. Jira API tokens are stored locally via the typed `storage/` layer; avoid logging sensitive values.
- Keep extension permissions minimal (`storage`, `tabs`, Atlassian host permissions). Discuss any new permissions in the PR.

## Agent Notes
- Prefer small, focused patches; avoid unrelated refactors.
- Reflect any command or permission changes in `apps/extension/wxt.config.ts` and this guide.
- When adding a new app (e.g., website), place under `apps/` and add an Nx `project.json`. Shared code should go in `packages/`.
