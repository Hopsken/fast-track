# Research: Ticket Actions Metadata

## Decisions & Rationale

### 1. UX Approach
**Decision**: Embed metadata chips directly in the `TicketActionsMenu` instead of a separate detail page.
**Rationale**: 
-   **Efficiency**: Reduces navigation clicks. Users typically want to check status/priority or copy links/keys.
-   **Context**: Provides context immediately where actions are taken.
**Alternatives Considered**: Full Detail Page (Rejected: Too heavy/slow for quick checks).

### 2. Data Fetching
**Decision**: Use `useTicketDetails` (cached) to fetch extended data (Labels) asynchronously while displaying `JiraTicket` data (Status, Priority) immediately.
**Rationale**: `JiraTicket` (list data) is instant. Labels require a fetch. Hybrid approach provides best LCP (Largest Contentful Paint).

## Integration Patterns

-   **Component**: `TicketMetadataChips` inserted as the first item or header content in `TicketActionsMenu`.
-   **UI Library**: Use `@internal/ui` (Shadcn/UI) components exclusively for atomic elements.
-   **Style Mapping**:
    -   **Chips**: `Badge` from `@internal/ui/components/badge` for Status, Priority, Type, and Labels.
    -   **Layout**: Utilize Shadcn-based layout patterns (Flex/Grid via Tailwind) but ensure all visible elements are component-based.
    -   **Icons**: `lucide-react`.