# Data Model: Ticket Actions Metadata

## Entities

### `IssueDetail`

(Same as before)

```typescript
export interface IssueDetail extends JiraTicket {
  description: string
  // ...
}
```

## State & Store

### `AppRouteMap` (Navigation)

-   **New**: `/ticket/description`: { issueKey: string }
-   **Existing**: `/actions` (JiraTicket)

## API Contracts

### `useTicketDetails(issueKey: string)`

(Retained)
