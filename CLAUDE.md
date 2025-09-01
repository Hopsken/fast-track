# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Jira Boost, a browser extension that enhances the Jira experience with features like standup mode, custom themes, dark mode, and card highlighting. Built using WXT framework (modern browser extension development framework) with React and TypeScript.

## Development Commands

### Core Development
**DO NOT USE `pnpm run dev` or any dev commands** - They may cause issues with the extension development
- `pnpm build` - Build production bundle for Chrome (default)
- `pnpm run build:ff` - Build for Firefox
- `pnpm run build:edge` - Build for Edge
- `pnpm run clean` - Clean build directory

### Distribution
- `pnpm run zip:chrome` - Create Chrome extension zip
- `pnpm run zip:firefox` - Create Firefox extension zip

## Architecture

### Entry Points (WXT Framework)
- **Background Script**: `src/entrypoints/background/index.ts` - Handles omnibox integration and installation events
- **Popup**: `src/entrypoints/popup/` - Extension popup interface with React app
- **Options**: `src/entrypoints/options/` - Settings page with React app
- **Content Scripts**: `src/contents/` - Injected scripts for different Jira features

### Key Content Scripts
- `general.ts` - Custom background/theme injection for Jira pages
- `dark-mode.ts` - Dark mode implementation
- `card-highlighter.ts` - Card highlighting functionality
- `standup-btn.tsx` - Standup mode button integration

### Storage System
Central storage management via `src/storage/index.ts` using Plasmo Storage:
- **PersistLayer class** - Unified storage interface
- **StorageKey enum** - Type-safe storage keys
- **StorageValueRecord** - Type definitions for all stored values
- Supports watching for value changes across the extension

### Core Features
- **Custom Backgrounds**: Unsplash integration for Jira theming
- **Dark Mode**: Three modes (always/auto/disable)
- **Card Highlighting**: Visual enhancements for Jira cards
- **Standup Mode**: Enhanced view for daily standups
- **License Management**: LemonSqueezy integration for pro features
- **Ticket Search**: High-performance search with debouncing, caching, and context-aware scoring

### Tech Stack
- **WXT**: Modern browser extension framework (replaces Plasmo)
- **React 18** with TypeScript
- **Tailwind CSS 4** with DaisyUI components
- **ahooks** for React utilities
- **cash-dom** for lightweight DOM manipulation

### Manifest Permissions
- Host permissions: `https://*.atlassian.net/jira*`
- Storage permission for cross-browser data persistence
- Omnibox keyword: "jira" for quick issue access

## Ticket Search Architecture

The ticket search system uses a modern RxJS-based reactive architecture that eliminates race conditions and provides optimal performance:

### Search Components
- **TicketSearchBox**: Input component with loading states and keyboard navigation
- **TicketList**: Results display with visual feedback and interaction handlers
- **TicketItem**: Individual ticket rendering with search term highlighting

### Reactive Architecture (RxJS-based)
1. **Collection**: `ticket-collector.content.ts` extracts ticket keys from Jira DOM
2. **Fetching**: Background service fetches detailed ticket data from Jira API
3. **Storage**: Tickets stored in browser storage with reactive observables
4. **Stream Processing**: RxJS orchestrates search with automatic debouncing and cancellation

### Core RxJS Components
- **`storageToStream`**: Utility converting WXT storage items to RxJS observables
- **`SearchStreamService`**: Pure stream processing with debouncing (150ms) and error handling
- **Search Orchestrator**: External coordination between RxJS streams and Zustand store
- **Simplified Zustand Slice**: Pure state management without complex search logic

### Data Flow
```typescript
User Input → setSearchQuery() → Zustand State → toStream() → RxJS Observable
    ↓
Storage Changes → storageToStream() → Observable → combineLatest()
    ↓
Debounced Search (150ms) → switchMap() → Search Results → Store Update
```

### Race Condition Elimination
- **switchMap operator**: Automatically cancels outdated searches
- **Reactive streams**: All data sources (storage, user input) are observables
- **External orchestration**: No circular dependencies between streams and state
- **Proper subscription management**: Clean setup and teardown

### Performance Optimizations
- **RxJS Debouncing**: 150ms delay with automatic cancellation
- **Stream Sharing**: `shareReplay(1)` prevents duplicate operations
- **Memoized Scoring**: Context scoring cached with 5-minute TTL
- **Result Caching**: Search results cached with 2-minute TTL for repeated queries
- **Smart DOM Observation**: Adaptive throttling in ticket collector

### Search Utilities (`src/utils/search/`)
- **scoring.ts**: Context-aware ticket scoring algorithm with memoization
- **cache.ts**: TTL-based caching system for search results and scores
- **highlight.tsx**: Multi-term text highlighting for search results

### State Management
- **createSearchSlice.ts**: Simplified Zustand slice with pure state management
- **createNavigationSlice.ts**: Keyboard navigation using object map pattern
- **useTicketSearch.ts**: Simplified hook using direct Zustand actions
- **Search Orchestrator**: External RxJS stream coordination

### Navigation Pattern
Uses object map pattern instead of switch statements for cleaner, more maintainable navigation logic.

## Coding Best Practices

### SOLID Principles
- **Single Responsibility**: Each class/function should have one reason to change
  - Keep hooks focused on a single concern (storage, API calls, UI state)
  - Separate business logic from UI components
- **Open-Closed**: Open for extension, closed for modification
  - Use composition and dependency injection
  - Create extensible hook patterns for new storage types
- **Liskov Substitution**: Derived classes must be substitutable for base classes
  - Ensure storage implementations can be swapped without breaking code
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
  - Create focused TypeScript interfaces for specific use cases
- **Dependency Inversion**: Depend on abstractions, not concretions
  - Use generic types and interfaces rather than concrete implementations

### Core Design Principles
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication
  - Create reusable hooks for common storage patterns
  - Extract common logic into utility functions
  - Use TypeScript generics to avoid repetitive type definitions
- **KISS (Keep It Simple, Stupid)**: Favor simplicity over complexity
  - Write clear, readable code over clever solutions
  - Break complex functions into smaller, focused ones
  - Use descriptive names that explain intent
- **YAGNI (You Aren't Gonna Need It)**: Don't over-engineer
  - Implement features when needed, not in anticipation
  - Avoid premature abstractions and generalizations
  - Start simple and refactor when complexity is warranted

### Clean Code Guidelines
- **Naming Conventions**:
  - Use descriptive, searchable names: `useJiraApiConfig` not `useConfig`
  - Boolean variables: `isEnabled`, `hasPermission`, `shouldUpdate`
  - Functions: Use verbs that describe action: `getStorageValue`, `updateTicketData`
- **Function Design**:
  - Keep functions small (ideally < 20 lines)
  - Single level of abstraction per function
  - Minimize parameters (max 3-4, use objects for more)
  - Pure functions when possible (no side effects)
- **Comments and Documentation**:
  - Write self-documenting code that doesn't need comments
  - Use comments to explain "why", not "what"
  - Document complex business logic and API integrations
  - Keep JSDoc comments for public APIs

### TypeScript Best Practices
- **Type Safety**:
  - Use strict TypeScript configuration
  - Avoid `any` type except for gradual migrations
  - Use type assertions sparingly and document why needed
  - Prefer union types over enums for simple constants
- **Generic Usage**:
  - Use generics for reusable components and hooks
  - Add constraints to generics: `<T extends StorageKey>`
  - Provide default types when appropriate
- **Interface Design**:
  - Use interfaces for object shapes
  - Keep interfaces focused and cohesive
  - Use composition over inheritance for complex types

### React/Hook Best Practices
- **Hook Design**:
  - Follow hooks naming convention: `use*`
  - Keep hooks focused on single responsibilities
  - Return consistent data structures from custom hooks
  - Use proper dependency arrays in `useEffect`
- **State Management**:
  - Prefer local state over global when possible
  - Use proper state updates (functional updates for complex state)
  - Minimize re-renders through proper memoization
- **Component Structure**:
  - Keep components small and focused
  - Extract complex logic into custom hooks
  - Use proper prop types and default values

### WXT Extension Best Practices
- **Storage Patterns**:
  - Use type-safe storage keys and value mappings
  - Implement proper error handling for storage operations
  - Watch for storage changes when needed
  - Use appropriate storage areas (local vs sync)
- **Content Script Organization**:
  - Keep content scripts lightweight
  - Use message passing for complex operations
  - Implement proper cleanup for event listeners
- **Background Script Design**:
  - Keep background scripts stateless when possible
  - Use proper lifecycle management
  - Implement error handling and fallbacks

### Code Organization
- **File Structure**:
  - Group related functionality in directories
  - Use index files for clean imports
  - Keep flat directory structures where possible
- **Import/Export**:
  - Use named exports over default exports
  - Group imports by type (external, internal, types)
  - Use barrel exports for cleaner import paths
- **Error Handling**:
  - Implement proper error boundaries
  - Log errors appropriately (not sensitive data)
  - Provide user-friendly error messages
  - Use Result types or error handling patterns consistently

### Service Architecture (Updated September 2025)

#### Proxy Service Pattern
The extension uses `@webext-core/proxy-service` for all cross-context communication:

**Background Script** (`src/entrypoints/background/index.ts`):
```javascript
import { registerTicketService } from '~/services/ticket-service'

// Single line - proxy service handles all inter-context communication
registerTicketService()
```

**Content Scripts/Options** (any context):
```javascript
import { getTicketService } from '~/services/ticket-service'

const ticketService = getTicketService()  // Cross-context proxy
await ticketService.fetchTicketDetails(keys)  // Direct method calls
await ticketService.testConnection()
```

#### Consolidated Services
- **TicketService** (`src/services/ticket-service.ts`) - Single service using proxy pattern
  - API service caching with config change detection
  - Backward compatibility (`JiraHost` || `JiraUrl` fallback)
  - Bulk operations with `getIssues()` method
  - Cross-context communication via proxy service

#### Architecture Cleanup
Removed unused manual message routing infrastructure (~290 lines of dead code):
- Manual MessageRouter class and handlers were never initialized
- Proxy service automatically handles all inter-context communication
- Single, clean service architecture throughout codebase

#### Centralized Messaging Service
All `@webext-core/messaging` communication goes through a single messaging service:

**Centralized Service** (`src/lib/messaging.ts`):
```javascript
export const { sendMessage, onMessage } = defineExtensionMessaging<TicketCollectionProtocol>()
```

**Usage Pattern**:
- Background services: `import { onMessage } from '~/lib/messaging'`
- Content scripts: `import { sendMessage } from '~/lib/messaging'`
- Single `defineExtensionMessaging` call prevents duplicated messaging setup

### Development Notes
- Uses pnpm as package manager
- Content scripts use `PageObserver` utility for dynamic page changes
- Extension auto-opens options page on first install
- **Service Communication**: Always use `getTicketService()` proxy pattern, never manual messaging
- **Messaging**: Always use centralized messaging service from `~/lib/messaging`
- Supports both Chrome and Firefox builds with different configurations