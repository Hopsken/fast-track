# CreateIssueMenu Refactoring

## Problem
The original `CreateIssueMenu.tsx` was ~400+ lines with:
- Complex business logic mixed with presentation
- Helper functions scattered throughout
- Difficult to test in isolation
- Hard to understand and maintain

## Solution
Split the monolithic component into focused, single-responsibility modules:

### 1. **Pure Utilities** (`utils.ts`)
Extracted all helper functions into testable pure functions:
- `toCacheKey()` - Generate cache key from template
- `getFieldName()` - Get display name for field
- `isEmptyValue()` - Check if value is empty (handles various types)
- `formatValuePreview()` - Format values for display
- `pickNonEmptyValues()` - Filter out empty values
- `buildInitialValues()` - Build initial form state
- `computeFinalVisibleFields()` - Compute visible fields with promotions
- `extractJiraFieldErrors()` - Parse Jira API error responses

**Benefits:**
- ✅ 100% testable (see `utils.test.ts` with 20 passing tests)
- ✅ Reusable across components
- ✅ Type-safe with explicit return types

### 2. **Custom Hooks**

#### `useCreateIssueForm.ts`
Extracted form submission logic into a reusable hook:
- Handles API calls to create issue
- Manages loading/success/error states via toast
- Handles error parsing and field promotion
- Manages navigation after submit

#### `useSetupWizard.ts`
Computes and maintains the wizard field sequence:
- Derives `visibleFields` from template config + promoted fields
- Recomputes `wizardFields` whenever `visibleFields` changes (e.g. after error recovery promotes new fields)

#### `useWizardNavigation.ts`
Handles step-by-step wizard navigation:
- Scans forward for the next unfilled field using `isEmptyValue` from `utils.ts` (single source of truth for empty-value checks, consistent with submit-time filtering in `pickNonEmptyValues`)
- Navigates to the review screen when all fields are filled

**Benefits:**
- ✅ Separates business logic from UI
- ✅ Can be tested independently
- ✅ Single source of truth for submission logic
- ✅ Wizard setup and navigation are decoupled — each hook depends only on the store, not on each other

### 3. **Presentational Components**

#### `FieldListItem.tsx`
Individual field row with:
- Required indicator (*)
- Value preview
- Check mark for filled fields
- Error display with icon
- Chevron for navigation

#### `FieldList.tsx`
Container for groups of fields (Required/Optional)

#### `ConflictWarning.tsx`
Dismissible warning banner for template conflicts

#### `CreateIssueActions.tsx`
Bottom action bar with "Create issue" button and keyboard hint

### 4. **Main Orchestrator** (`CreateIssueMenu.tsx`)
Now a lean ~180 lines that:
- Coordinates data fetching (templates, cache, conflicts)
- Manages initialization
- Delegates rendering to smaller components
- Handles routing

## File Structure

```
CreateIssue/
├── index.ts                        # Public exports
├── CreateIssueMenu.tsx             # Main orchestrator
├── CreateIssueFieldsMenu.tsx       # Fields review screen
├── FieldInputMenu.tsx              # Field value input (routing hub)
├── useCreateIssueForm.ts           # Form submission hook
├── useCreateIssueDraftStore.tsx    # Zustand store (React Context)
├── useScalarFieldEnter.ts          # Enter key handler for scalar fields
├── useSetupWizard.ts               # Wizard field sequence setup
├── useWizardNavigation.ts          # Step-by-step wizard navigation
├── utils.ts                        # Pure helper functions
├── utils.test.ts                   # Unit tests
├── FieldList.tsx                   # Field group component
├── FieldListItem.tsx               # Individual field row
├── ConflictWarning.tsx             # Conflict banner
└── fields/
    ├── MultiSelectFieldInput.tsx             # Multi-select option picker
    ├── SingleSelectFieldInput.tsx            # Single-select option picker
    ├── SummaryDescriptionFieldInputMenu.tsx  # Summary + description editor
    └── UserFieldInputMenu.tsx               # User picker
```

## Testing Strategy

### Pure Functions (utils.ts)
✅ **Fully tested** with 20 unit tests covering:
- Empty value detection
- Value formatting for display
- Initial value building
- Error extraction

### Components
- Small, focused components are easier to test
- Each component has clear props interface
- No hidden dependencies or side effects

### Custom Hook
- Business logic isolated and testable
- No UI coupling

## Metrics

| Metric | Before | After |
|--------|--------|-------|
| CreateIssueMenu.tsx lines | ~400 | ~180 |
| Largest component | 400 lines | 180 lines |
| Testable functions | 0 | 8 |
| Test coverage | 0% | ~90% (utils) |
| Reusable components | 0 | 4 |

## Benefits

1. **Maintainability**: Each file has a single responsibility
2. **Testability**: Pure functions are 100% testable
3. **Reusability**: Components can be used elsewhere
4. **Readability**: Clear separation of concerns
5. **Type Safety**: Explicit interfaces for all props
6. **Performance**: No performance impact (same component tree)

## Migration Notes

No breaking changes - all exports remain the same:
- `CreateIssueMenu` - Still exported with same props
- `FieldInputMenu` - Unchanged
- New components exported but not required for existing code
