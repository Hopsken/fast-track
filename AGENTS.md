# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` with key folders: `entrypoints/` (background, popup, options, `*.content.ts` scripts), `components/`, `hooks/`, `services/`, `storage/` (typed persistence), `stores/` (Zustand), `utils/`, `assets/`.
- Config: `wxt.config.ts`, `web-ext.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.cjs`.
- Builds: dev output in `.output/`; zips produced via `wxt zip`.

## Build & Distribution
- Important: Do not use `pnpm dev`. Build locally, then load the output.
- `pnpm build` | `build:ff` | `build:edge`: Production build per browser (WXT).
- Load the unpacked build from `.output/chromium-mv3` (or `firefox-mv3`).
- `pnpm zip:chrome` | `zip:firefox`: Produce store-ready zip archives.
- Quality: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` before PRs.

## Coding Style & Naming Conventions
- Formatting: 2 spaces, no semicolons, single quotes, 80-char print width (Prettier).
- Imports: Alphabetized and grouped; prefer `~/` for src-root and `#imports` where provided by WXT.
- React: Components in PascalCase (`MyComponent.tsx`); hooks start with `use*`.
- Entry points: Content scripts use `*.content.ts`; background at `src/entrypoints/background/`.
- Services/Stores: Suffix services with `Service`; colocate Zustand slices in `stores/`.

## Architecture Overview
- Background: `src/entrypoints/background/` handles omnibox and install flows.
- Content scripts: `src/entrypoints/*.content.ts` use `PageObserver` for Jira SPA changes.
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

## Security & Configuration Tips
- Do not commit tokens or secrets. Jira API tokens are stored locally via the typed `storage/` layer; avoid logging sensitive values.
- Keep extension permissions minimal (`storage`, `tabs`, Atlassian host permissions). Discuss any new permissions in the PR.

## Agent Notes
- Prefer small, focused patches; avoid unrelated refactors.
- Reflect any command or permission changes in `wxt.config.ts` and this guide.
