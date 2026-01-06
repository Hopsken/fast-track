# Implementation Plan: Ticket Actions Metadata & Description

**Branch**: `001-ticket-details-action` | **Date**: 2026-01-06 | **Spec**: [specs/001-ticket-details-action/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ticket-details-action/spec.md`

## Summary

This feature enhances the Ticket Actions Menu to display key metadata chips and a truncated description preview. A "Show full description" action allows users to view the complete rich-text description in a dedicated view.

## Technical Context

**Language/Version**: TypeScript 5.x (via existing config)
**Primary Dependencies**: 
-   `wxt` (Extension framework)
-   `@tanstack/react-query` (Data fetching)
-   `lucide-react` (Icons)
-   `@internal/ui` (Shared Shadcn/UI components)
-   `jira.js` (Jira API client)
-   `dompurify` (HTML sanitization)

**Constraints**:
-   MUST use `@internal/ui` components (Badge, Button, etc.) instead of raw Tailwind CSS for styling UI elements.
-   Match "minimal chip style" from reference image.

**Storage**: N/A
**Testing**: Unit tests for new components.
**Target Platform**: Chrome Extension (Popup).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   **Code Quality**: PASSED.
-   **Test Evidence**: PASSED.
-   **UX Consistency**: PASSED.
-   **Performance**: PASSED.

## Project Structure

### Documentation (this feature)

```text
specs/001-ticket-details-action/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/extension/src/
├── components/
│   ├── actions/
│   │   └── tickets/
│   │       ├── TicketMetadataChips.tsx     # KEEP: Chip row
│   │       ├── TicketDescriptionPreview.tsx # KEEP: Content renderer
│   │       ├── TicketHeaderAction.tsx      # NEW: Custom CommandItem for header
│   │       ├── TicketDescriptionAction.tsx # NEW: Custom CommandItem for description
│   │       ├── TicketDescriptionFull.tsx   # KEEP: Full view renderer
│   │       ├── IssueDetail.tsx             # DELETE
│   │       ├── IssueDescription.tsx        # DELETE
│   │       ├── IssueMetadata.tsx           # DELETE
│   │       └── ChildIssuesList.tsx         # DELETE
│   └── ...
├── entrypoints/
│   └── popup/
│       └── menus/
│           └── TicketActionsMenu.tsx       # UPDATE: Integrate chips + preview
└── ...
```

**Structure Decision**: Hybrid approach: Preview in menu, Full view in separate route.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |
