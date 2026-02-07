# Tech Design: Issue Template Field Adapter Architecture

| Metadata         | Details                                                                 |
| :--------------- | :---------------------------------------------------------------------- |
| **Author**       | @Hopsken                                                                |
| **Status**       | Updated to match implementation                                         |
| **Last Updated** | 2026-02-07                                                              |
| **Topic**        | Field adapter registration, resolution, context wiring, and option flow |

## 1. Scope

This document reflects the behavior implemented in:

- `src/common/fields/index.ts`
- `src/common/fields/registry.ts`
- `src/common/fields/adapters/shared/context.tsx`
- `src/common/fields/hooks/useFieldOptions.ts`

It describes current runtime behavior (not planned behavior).

## 2. Adapter Registration (`src/common/fields/index.ts`)

Adapters are registered at module load time via `registerAdapter(...)`.

Registration list in code:

- System-focused adapters:
  - `JiraPriorityAdapter`
  - `JiraAssigneeAdapter`
  - `JiraLabelAdapter`
  - `JiraParentAdapter`
- Custom-focused adapters:
  - `JiraSprintAdapter`
- General type adapters:
  - `JiraComponentAdapter`
  - `JiraUserAdapter`
  - `JiraResolutionAdapter`
  - `JiraDateAdapter`
  - `JiraDateTimeAdapter`

**Design Rationale:**

- **Categorization by purpose**: System fields (Jira built-ins), custom fields (plugin extensions), general type adapters (reusable across field types)
- **Module-level registration**: Ensures adapters are available before any component renders
- **Single-entry module pattern**: All registration happens in one file for discoverability

**Extension Point:**

To add a new adapter:
1. Create adapter implementing `FieldAdapter<Schema>`
2. Implement `fromDTO`, `toDTO`, and validation aligned with schema
3. Register in `index.ts` via `registerAdapter(adapter)`

Type safety: `FieldAdapter<Schema>` generic ensures `fromDTO`, `toDTO`, and validation align with schema at compile time.

Exports from `index.ts`:

- `getFieldAdapter` - Imperative API for non-React contexts (services, utilities)
- `useFieldAdapter` - Hook API for React components with React Query integration

## 3. Adapter Resolution (`src/common/fields/registry.ts`)

**Pattern: Strategy Pattern**

The registry implements the Strategy Pattern, selecting the appropriate field handling strategy at runtime based on schema characteristics.

`getFieldAdapter(schema)` selects an adapter using this strategy:

1. `schema.system` exact match in registry
2. `schema.custom` exact match in registry
3. `schema.type` handling
   - If `schema.type === 'array'` and `schema.items` exists, try match by `schema.items`
   - Otherwise try direct match by `schema.type`
4. Fallback to `FallbackAdapter` and emit a warning log

**Design Rationale - Specificity Hierarchy:**

1. **System key first** (highest specificity)
   - Handles Jira's special fields that need custom behavior (e.g., "assignee" needs user search)
   - Allows override of generic type handling for specific system fields

2. **Custom type second**
   - Enables plugin field support (e.g., Sprint field from Greenhopper plugin)
   - Provides extension point for third-party integrations

3. **Base type third**
   - Provides sensible defaults for standard Jira types (user, date, datetime)
   - Array handling: Reuses single-item adapters when items type matches registry
   - **Trade-off**: Increased complexity for maximum flexibility

4. **Fallback fourth** (lowest specificity)
   - Prevents runtime errors with graceful degradation
   - Warning logs help identify missing adapter implementations

**Performance Characteristics:**

- O(1) lookup for each strategy (plain object map)
- Early returns minimize checks per resolution
- No async operations - synchronous adapter selection

**Type Safety:**

- Registry uses `Record<string, FieldAdapter<any>>` for flexibility
- Consumers must handle type casting via generics at call sites

Registry storage:

- `adapterRegistry` is a plain object map: `Record<string, FieldAdapter<any>>`
- `registerAdapter(adapter)` stores adapter by `adapter.key`

Important implication:

- For array fields, the registry can reuse single-item adapters by resolving through `schema.items` (for example, `array + user` can resolve to the user adapter).

## 4. Shared Field Context (`src/common/fields/adapters/shared/context.tsx`)

**Pattern: Provider Pattern for Dependency Injection**

The FieldContext provides a type-safe dependency injection mechanism, passing adapter, config, and context down the component tree without prop drilling.

Context shape provided to child components:

- `adapter: FieldAdapter<T>`
- `config: FieldConfig<z.infer<T>>`
- `context: JiraFieldContext`

Implementation details:

- `FieldContextProvider` receives those values plus `children`
- Provider value is memoized with `useMemo(() => restProps, [restProps])`
- `useFieldContext<T>()` reads the context and throws if missing:
  - `Error('useFieldContext must be used in Config / Input component')`

**Design Decisions:**

**Memoization Strategy:**
- `useMemo(() => restProps, [restProps])` prevents unnecessary re-renders
- **Trade-off**: Shallow comparison of `restProps` object - will re-memoize if any prop changes
- **Implication**: Consumers should memoize adapter/config/context objects when possible

**Type Safety via Generics:**
- `FieldContext<T extends FieldValueSchema>` propagates schema type through the tree
- `useFieldContext<T>()` allows consumers to specify expected value type
- Type casting (`as FieldContext<T>`) necessary due to React Context limitations

**Strict Error Handling:**
- Throws if used outside provider scope (fail-fast principle)
- Helps catch misuse during development rather than runtime

**Performance Implications:**
- Context updates trigger re-renders of all consumers
- Memoization at provider level reduces update frequency
- Consider splitting context if performance issues arise (separate adapter/config/context)

Practical requirement:

- Components using `useFieldContext` must render under `FieldContextProvider`.

## 5. Field Options Flow (`src/common/fields/hooks/useFieldOptions.ts`)

**Pattern: Multi-Tier Data Source Strategy**

The hook implements a priority-based data source selection strategy, preferring server-side search, then Jira metadata, then local configuration.

Hook input:

- `adapter`
- `context`
- optional `config`
- optional `query` (default `''`)

### 5.1 Debounce and query trigger

- Search text is debounced with `useDebounce(query, { wait: 300 })`
- `isServerSearch` is true only when:
  - `config?.behavior !== 'restricted'`
  - and `!context.metadata.allowedValues`

**Performance Design - Debouncing:**

**300ms wait time rationale:**
- Balances UX responsiveness (feels instant) vs. server load (reduces API calls)
- User typically pauses 300ms+ when thinking/typing
- Prevents API spam during fast typing
- **Trade-off**: Slight delay vs. reduced server load and API costs

React Query config:

- `queryKey`:
  - `'field-options'`
  - `adapter.key`
  - `context.project?.key`
  - `context.issueType?.id`
  - debounced query
- `queryFn` calls `adapter.fetchOptions(context, debouncedQuery)` when present
- `enabled: isServerSearch && !!adapter.fetchOptions`
- `placeholderData: keepPreviousData`

**Performance Design - Caching Strategy:**

**Cache key granularity:**
- `adapter.key`: Different adapters = different caches (users vs. priorities)
- `project.key + issueType.id`: Context-specific options (assignable users vary by project)
- `debouncedQuery`: Search-specific results
- **Benefit**: Granular invalidation - changing project doesn't invalidate search results for old project

**keepPreviousData strategy:**
- Shows stale results during new search loading
- **Trade-off**: Brief moment of "wrong" data vs. UI flicker/empty state
- **UX improvement**: Smooth transitions, perceived performance boost

### 5.2 Option source precedence

`options` is computed with this precedence:

1. If `isServerSearch` -> use remote query result (`queryResult.data || []`)
2. Else if `context.metadata.allowedValues` exists -> map via `adapter.fromDTO(...)` and filter nulls
3. Else -> use `config?.allowedOptions || []`

**Design Rationale - Precedence Order:**

1. **Server search (highest priority)**
   - When: Non-restricted behavior + no Jira allowedValues
   - **Rationale**: Most up-to-date data (users, projects change frequently)
   - **Performance**: Debounced + cached to minimize server load

2. **Jira metadata allowedValues (middle priority)**
   - When: Jira provides official allowed values for this field
   - **Rationale**: Jira knows best what's valid (priorities, resolutions, statuses)
   - **Performance**: No server calls, one-time DTO transformation
   - **Type safety**: `adapter.fromDTO` ensures correct type mapping

3. **Local config allowedOptions (lowest priority)**
   - When: Template designer pre-configured restricted options
   - **Rationale**: Template-specific constraints (limit to specific priorities)
   - **Performance**: Fully local, but filtering bug prevents full optimization

### 5.3 Current local-filter behavior

For case (3), the hook computes a lowercase search term and runs a `.filter(...)` expression for keyword/display matching, but does not assign or return the filtered result.

Current effective behavior:

- In local `allowedOptions` mode, returned `options` are the full `allowedOptions` list (unfiltered), even when query text is present.

**Known Issue - Design Impact:**

The filtering bug means local restricted mode shows all options regardless of search query. This:
- Degrades UX for large allowedOptions lists
- Defeats the purpose of search input in restricted mode
- Should be fixed by assigning filter result: `const filtered = allowedValues.filter(...)`

### 5.4 Loading state

Returned `isLoading` is:

- `queryResult.isLoading && isServerSearch`

So loading is only surfaced during server-search mode.

**Loading State Design:**
- Only shows loading during server search (not local filtering)
- **Rationale**: Local operations are instant, loading indicators for local data cause flicker
- **Trade-off**: No loading state during DTO transformation (assumed fast)

## 5.5 Design Principles & Patterns

### Core Patterns

**Adapter Pattern**: Unified `FieldAdapter<Schema>` interface abstracts differences between field types (user, date, priority, etc.), enabling polymorphic field handling.

**Strategy Pattern**: Runtime adapter selection via registry allows system to handle unknown field types gracefully with fallback strategy.

**Provider Pattern**: React Context-based dependency injection eliminates prop drilling while maintaining type safety.

### Architectural Principles

**Type Safety First**:
- Generic type propagation: `FieldAdapter<Schema>` → `FieldContext<Schema>` → component props
- Compile-time guarantees that `fromDTO`/`toDTO` match schema
- Zod schema validation ensures runtime type safety

**Performance First**:
- Debouncing reduces API load (300ms)
- React Query caching prevents duplicate requests
- PlaceholderData maintains smooth UX during transitions
- Memoization at context level minimizes re-renders

**Separation of Concerns**:
- Registry: Adapter selection logic
- Context: Dependency injection
- Hooks: Data fetching and state management
- Adapters: Field-specific transformation logic

**Extensibility**:
- Adding new adapter: No changes to core registry/context/hooks
- Closed for modification, open for extension (Open-Closed Principle)
- Plugin-friendly: Custom field types via custom key registration

**Graceful Degradation**:
- FallbackAdapter prevents crashes for unknown fields
- Warning logs aid debugging without breaking UX
- Optional chaining throughout (`project?.key`, `config?.allowedOptions`)

## 6. Design Decisions Summary

**Adapter Matching Priority:**
- Order reflects specificity hierarchy: most specific (system) → least specific (fallback)
- Enables both customization (system overrides) and defaults (type matching)
- Resolution strategy: `system -> custom -> type/items -> fallback`

**Context Wiring:**
- Strict enforcement (throws error) prevents subtle bugs from missing provider
- Fail-fast principle improves developer experience
- Type-safe dependency injection eliminates prop drilling

**Option Loading Strategy:**
- Server-first approach ensures data freshness when possible
- Metadata short-circuits prevent unnecessary API calls
- Local mode provides offline-first capability for templates
- Precedence: server search → Jira `allowedValues` → config `allowedOptions`

**Type Transformation:**
- `fromDTO` centralizes Jira API → app model transformation
- Consistent null filtering prevents runtime errors
- Adapter responsibility ensures field-specific handling

**Current Limitation:**
- Local filtering bug demonstrates incomplete implementation of local search strategy
- Fix required: Assign filter result to enable search in restricted mode
