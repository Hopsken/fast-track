# Tasks: Ticket Actions Metadata & Description

**Feature**: `001-ticket-details-action`
**Status**: Todo

## Dependencies

- Phase 2 (Foundations) MUST complete before Phase 3 (US1)
- Phase 3 (US1) MUST complete before Phase 4 (Cleanup)

## Implementation Strategy

- **Refactor**: Transform `TicketActionsMenu` to include metadata and description.
- **Components**: Build small, focused components (`TicketMetadataChips`, `TicketDescriptionPreview`) using `@internal/ui`.
- **Custom Actions**: Create dedicated `TicketHeaderAction` and `TicketDescriptionAction` wrapping `CommandItem` for custom layouts.
- **Navigation**: Add specific route for full description view.
- **Cleanup**: aggressive removal of unused files from the previous "full detail page" approach.

## Phase 1: Setup

**Goal**: Update routing and types for the new direction.

- [x] T001 Update `apps/extension/src/entrypoints/popup/menus/index.ts` to include `'/ticket/description'` in `CommandRoutes` and remove `'/ticket/details'`

## Phase 2: Foundations

**Goal**: Build the UI components for metadata and description preview.

- [x] T002 [P] Create `TicketMetadataChips` component in `apps/extension/src/components/actions/tickets/TicketMetadataChips.tsx` using `@internal/ui` `Badge`
- [x] T003 [P] Create `TicketDescriptionPreview` component in `apps/extension/src/components/actions/tickets/TicketDescriptionPreview.tsx` using `@internal/ui` components
- [x] T004 Create unit tests for `TicketMetadataChips` in `apps/extension/src/components/actions/tickets/TicketMetadataChips.test.tsx`
- [x] T005 Create unit tests for `TicketDescriptionPreview` in `apps/extension/src/components/actions/tickets/TicketDescriptionPreview.test.tsx`
- [x] T006 [P] Create `TicketHeaderAction.tsx` in `apps/extension/src/components/actions/tickets/` to display summary and chips
- [x] T007 [P] Create `TicketDescriptionAction.tsx` in `apps/extension/src/components/actions/tickets/` to display description preview
- [x] T008 [US1] Update `apps/extension/src/entrypoints/popup/menus/TicketActionsMenu.tsx` to use `TicketHeaderAction` and `TicketDescriptionAction`
- [x] T009 [US1] Create unit tests for `TicketHeaderAction` in `apps/extension/src/components/actions/tickets/TicketHeaderAction.test.tsx`
- [x] T010 [US1] Create unit tests for `TicketDescriptionAction` in `apps/extension/src/components/actions/tickets/TicketDescriptionAction.test.tsx`
- [x] T011 [US1] Update `apps/extension/src/entrypoints/popup/menus/TicketActionsMenu.tsx` to use `useTicketDetails` for asynchronously fetching extended data (labels, full description) without blocking initial render
- [x] T010 [US1] Create `TicketDescriptionFull.tsx` in `apps/extension/src/components/actions/tickets/` (refactored from `IssueDescription.tsx`) to display full rich text
- [x] T011 [US1] Create unit tests for `TicketDescriptionFull` in `apps/extension/src/components/actions/tickets/TicketDescriptionFull.test.tsx`
- [x] T012 [US1] Register `'/ticket/description'` route in `apps/extension/src/entrypoints/popup/App.tsx` rendering `TicketDescriptionFull`
- [x] T013 [US1] Connect "Show full description" action in `TicketDescriptionAction` (or `TicketActionsMenu`) to push `'/ticket/description'` route

## Phase 4: Cleanup

**Goal**: Remove unused artifacts from the previous design.

- [x] T014 Remove `apps/extension/src/components/actions/tickets/IssueDetail.tsx`
- [x] T015 Remove `apps/extension/src/components/actions/tickets/IssueDetail.test.tsx`
- [x] T016 Remove `apps/extension/src/components/actions/tickets/IssueMetadata.tsx` (replaced by Chips)
- [x] T017 Remove `apps/extension/src/components/actions/tickets/ChildIssuesList.tsx` (not in current scope)
- [x] T018 Remove `apps/extension/src/components/actions/tickets/IssueDescription.tsx` (replaced by TicketDescriptionFull)

## Phase 5: Polish & Quality

**Goal**: Ensure visual consistency and performance.

- [x] T019 Verify metadata chips use correct `@internal/ui` variants (e.g. outline/secondary) matching reference
- [x] T020 Verify description preview truncation works correctly (2 lines)
- [x] T021 [Perf] Verify `TicketActionsMenu` opens instantly and labels appear asynchronously (NFR-002)