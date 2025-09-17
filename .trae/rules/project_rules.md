## MCP

Always use context7 when i need code generation, setup or configuration steps, or library / API documentations. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask you to do so.

Use these known libraries in the following:

- Wxt: `/wxt-dev/wxt`
- RxJS: `/reactivex/rxjs`
- Zustand: `/pmndrs/zustand`
- Jira.js: `/mrrefactoring/jira.js`
- WebExt Core: `/aklinker1/webext-core` for messaging and proxy service

## Project rules

Don't run wxt dev command to check build, use wxt build instead.

Don't run any `dev` command, ask the user to run them. To validate implementation, run eslint commands first, then run typescript typecheck making sure everything is correct.

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
  - Prefer early returns to reduce nesting and improve readability
- **Comments and Documentation**:
  - Write self-documenting code that doesn't need comments
  - Use comments to explain "why", not "what"
  - Document complex business logic and API integrations
  - Keep JSDoc comments for public APIs
- **Logging Practices**:
  - Avoid `console.log` statements unless explicitly requested by the user
  - Use proper logging libraries or debugging tools when debugging is needed
  - Remove debugging statements before committing code
- **Error Handling Practices**:
  - Avoid extensive try-catch blocks that might swallow errors
  - Let meaningful errors bubble up to be handled at appropriate levels
  - Use specific error handling only where recovery or user feedback is needed
  - Prefer explicit error return values or Result types over silent error swallowing

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
