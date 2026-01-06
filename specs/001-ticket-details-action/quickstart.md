# Quickstart: View Ticket Details Action

## Overview

The "View Ticket Details" feature allows users to inspect the full context of a Jira issue without leaving the extension. It is implemented as a drilled-down view accessible from the main ticket list.

## Usage

### 1. Triggering the View

In the ticket list:
1.  Hover over a ticket row.
2.  Click the **"View Details"** action (likely an eye icon or a primary action button).
    *   *Alternative*: Use keyboard shortcut (e.g., `Enter` or `Space` if implemented) when the row is focused.

### 2. Navigating Back

In the detail view:
1.  Click the **"Back"** button (top-left chevron).
2.  Or press `Escape`.

## Development

### Components

- **`IssueDetail.tsx`**: The main container. Fetches data (if needed) and orchestrates layout.
- **`IssueDescription.tsx`**: Handles rich text rendering.
- **`IssueMetadata.tsx`**: Displays side-bar/header fields (Status, Priority, etc.).

### Adding New Fields

To add a new field to the detail view:
1.  Update `IssueDetail` interface in `data-model.md` and types file.
2.  Ensure `api.getIssue` requests the new field in the `fields` param.
3.  Add a renderer in `IssueMetadata.tsx` (for key-value pairs) or `IssueDetail.tsx` (for major content).

## Testing

### Unit Tests

```bash
pnpm test apps/extension/src/components/actions/tickets/IssueDetail.test.tsx
```

### Manual Verification

1.  Open the extension in `apps/extension` (dev mode).
2.  Find a ticket with **rich description**, **labels**, and **parent**.
3.  Click "View Details".
4.  Verify all fields match the Jira source of truth.
5.  Verify "Back" button returns to list at the same scroll position (if state preserved).
