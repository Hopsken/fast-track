# Architecture Overview

## Runtime Topology
- Background (`src/entrypoints/background/`): Initializes services, handles omnibox, installation events, and exposes APIs via `@webext-core/proxy-service` (see `registerTicketService`).
- Content Scripts (`src/entrypoints/*.content.ts`): Feature modules injected into Jira pages (dark mode, card highlighting, theme manager, standup mode, ticket collector).
- UI Apps: Popup (`src/entrypoints/popup/`) and Options (`src/entrypoints/options/`) are React apps.

## Data Flow (Search)
- Collection: `ticket-collector.content.ts` extracts keys from the Jira DOM.
- Fetching: Background uses Jira API (via `jira.js`) to enrich tickets.
- Storage: Results persisted through the typed `storage/` layer.
- Orchestration: RxJS streams debounce and cancel in-flight work; Zustand stores keep UI state simple.

Example flow
`User input → Zustand state → RxJS pipeline (debounce/switchMap) → background fetch → storage update → UI subscribe`

## Storage Layer
- Core: `src/storage/` with `PersistLayer`, `StorageKey`, and typed value schema.
- Capabilities: `get/set/remove`, batched ops, watch for live updates.
- Guidance: Avoid logging tokens; use keys from `storage/keys.ts` and types from `storage/schema.ts`.

## State & UI
- State: Small, focused Zustand slices in `src/stores/`.
- UI: React 19 with hooks; components dumb, logic in hooks/services.
- Utilities: `src/utils/` hosts pure helpers (e.g., search scoring, caching, page observers).

## Page Observation
- `PageObserver` watches Jira’s SPA navigation and re-applies effects when `location.pathname` changes. Register effects with a unique `key`, `when(document)`, and cleanup-enabled `effect`.

## Messaging & Services
- Prefer proxy service pattern for cross-context calls (background ↔ UI/content).
- Keep background as coordinator; content scripts stay lightweight and cleanup listeners.

## Build & Manifest
- WXT config (`wxt.config.ts`) defines `srcDir`, modules, omnibox, permissions, and browser-specific IDs.
- Output: `.output/chromium-mv3` (and `chrome-mv3`, `*-dev` variants) for loading unpacked builds.

## Extending
- New content script: add `src/entrypoints/<feature>.content.ts`, register via WXT, and gate with `PageObserver`.
- New service: add in `src/services/`, expose through background and proxy; persist via `storage/` with typed keys.
