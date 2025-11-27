# Development Guide

## Development Environment Setup

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **npm**: Version 8 or higher (comes with Node.js)
3. **Git**: For version control
4. **Browser**: Chrome, Firefox, or Edge for extension testing

### Initial Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd fast-track
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Verify setup**:
   ```bash
   turbo --version
   ```

### IDE Configuration

#### VS Code (Recommended)

Install the following extensions:

- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** (`ms-vscode.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Nx Console** (`nrwl.angular-console`)
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
- **Bracket Pair Colorizer** (`coenraads.bracket-pair-colorizer-2`)

#### VS Code Settings

Add to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": ["apps/extension", "apps/website"]
}
```

## Workspace Commands

### Extension Development

```bash
# Start development server with hot reload
pnpm dev

# Browser-specific dev servers
pnpm dev:ff
pnpm dev:edge

# Build for production (use this for validation)
pnpm build

# Create distribution packages
pnpm zip

# Run linting
pnpm turbo run lint --filter=extension

# Run tests
pnpm turbo run test --filter=extension

# Type checking
pnpm turbo run typecheck --filter=extension
```

### Website Development

```bash
# Start Next.js development server
pnpm dev:website

# Build for production
pnpm build:website

# Start production server
pnpm start:website

# Run linting (excludes .next directory)
pnpm turbo run lint --filter=website

# Run tests
pnpm turbo run test --filter=website

# Type checking
pnpm turbo run typecheck --filter=website
```

### Cross-Project Commands

```bash
# Run commands across all projects
pnpm lint
pnpm build
pnpm test
pnpm typecheck
pnpm format:check
```

## Code Quality Tools

### ESLint Configuration

#### Extension ESLint (`apps/extension/eslint.config.mjs`)

- **Base**: workspace `eslint.config.js`
- **TypeScript**: `@typescript-eslint/recommended`
- **React**: `plugin:react/recommended`, `plugin:react-hooks/recommended`
- **WXT**: Custom rules for extension development

#### Website ESLint (`apps/website/eslint.config.mjs`)

- **Base**: workspace `eslint.config.js`
- **Next.js**: `@next/eslint-plugin-next`
- **TypeScript**: `@typescript-eslint/recommended`
- **Ignores**: `.next/**/*`, `node_modules/**/*`

### Running ESLint

```bash
# Lint specific project
pnpm turbo run lint --filter=extension
pnpm turbo run lint --filter=website

# Lint with auto-fix
pnpm turbo run lint:fix --filter=extension
pnpm turbo run lint:fix --filter=website

# Lint specific files
npx eslint apps/extension/src/**/*.ts
npx eslint apps/website/src/**/*.tsx
```

### TypeScript Configuration

#### Strict Mode Settings

All projects use TypeScript strict mode with the following settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### Type Checking

```bash
# Check all projects
pnpm typecheck

# Check specific project
pnpm turbo run typecheck --filter=extension
pnpm turbo run typecheck --filter=website

# Watch mode for development
pnpm turbo run typecheck --filter=extension -- --watch
```

## Testing Procedures

### Unit Testing

```bash
# Run all tests
pnpm test

# Run tests for specific project
pnpm turbo run test --filter=extension
pnpm turbo run test --filter=website

# Run tests in watch mode
pnpm turbo run test --filter=extension -- --watch

# Run tests with coverage
pnpm turbo run test --filter=extension -- --coverage
```

### Extension Testing

#### Manual Testing

1. **Build the extension**:

   ```bash
   pnpm build
   ```

2. **Load in browser**:
   - Chrome: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select `dist/extension`
   - Firefox: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on", select `dist/extension/manifest.json`

3. **Test core functionality**:
   - OAuth authentication flow
   - Ticket search and highlighting
   - Extension-website communication
   - Storage operations

#### Automated Testing

```bash
# Run extension-specific tests
pnpm turbo run test --filter=extension

# Test with different browsers (if configured)
pnpm turbo run test --filter=extension --browsers=chrome,firefox
```

### Website Testing

```bash
# Run website tests
pnpm turbo run test --filter=website

# Run with coverage
pnpm turbo run test --filter=website -- --coverage

# Run specific test file
pnpm turbo run test --filter=website -- --testPathPattern=auth
```

## Build and Deployment Process

### Development Builds

```bash
# Development build with source maps
pnpm build --mode=development
pnpm build:website --mode=development
```

### Production Builds

```bash
# Production build (optimized)
pnpm build
pnpm build:website

# Create extension package
pnpm zip
```

### Build Validation

**Important**: Always use `pnpm build` instead of dev servers for validation:

```bash
# Validate extension build
pnpm build

# Validate website build
pnpm build:website

# Check for TypeScript errors
pnpm typecheck

# Check for linting issues
pnpm turbo run lint --filter=extension
pnpm turbo run lint --filter=website
```

### Deployment Checklist

1. **Pre-deployment validation**:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   pnpm build:website
   ```

2. **Extension deployment**:
   - Create production build: `pnpm build`
   - Create package: `pnpm zip`
   - Upload to Chrome Web Store / Firefox Add-ons

3. **Website deployment**:
   - Create production build: `pnpm build:website`
   - Deploy to hosting platform (Vercel, Netlify, etc.)

## Debugging and Troubleshooting

### Common Issues

#### Build Failures

1. **TypeScript errors**:

   ```bash
   pnpm turbo run typecheck --filter=extension --verbose
   ```

2. **ESLint errors**:

   ```bash
   pnpm turbo run lint --filter=extension --verbose
   ```

3. **Dependency issues**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Extension Issues

1. **Content script not loading**:
   - Check manifest permissions
   - Verify content script matches patterns
   - Check browser console for errors

2. **OAuth flow issues**:
   - Verify redirect URLs in Jira app configuration
   - Check network tab for failed requests
   - Validate token storage and retrieval

3. **Extension-website communication**:
   - Check custom event listeners
   - Verify message passing between components
   - Test in different browser contexts

### Debugging Tools

#### Browser DevTools

1. **Extension debugging**:
   - Background script: `chrome://extensions/` → Inspect views
   - Content script: Regular page DevTools
   - Popup: Right-click popup → Inspect

2. **Network debugging**:
   - Monitor API calls in Network tab
   - Check for CORS issues
   - Validate OAuth token exchanges

#### Logging

```typescript
// Use proper logging instead of console.log
import { logger } from '@/utils/logger'

// Development logging
logger.debug('Search query:', { query, filters })
logger.info('Authentication successful', { userId })
logger.warn('Rate limit approaching', { remaining })
logger.error('API request failed', { error, endpoint })
```

### Performance Monitoring

```bash
# Analyze bundle size
pnpm build --analyze
pnpm build:website --analyze

# Check for unused dependencies
npx depcheck

# Performance profiling
pnpm turbo run test --filter=extension --profile
```

## Git Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: Feature development branches
- **hotfix/\***: Critical bug fixes

### Commit Guidelines

```bash
# Conventional commit format
git commit -m "feat(extension): add OAuth callback handler"
git commit -m "fix(website): resolve authentication token storage"
git commit -m "docs: update development setup guide"
git commit -m "refactor(shared): extract common utilities"
```

### Pre-commit Hooks

```bash
# Install pre-commit hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "pnpm lint"
npx husky add .husky/pre-commit "pnpm test"
```

## Environment Variables

### Extension Environment

```bash
# .env.local (for development)
VITE_JIRA_CLIENT_ID=your_client_id
VITE_OAUTH_REDIRECT_URL=http://localhost:3000/oauth/callback
VITE_API_BASE_URL=http://localhost:3000/api
```

### Website Environment

```bash
# .env.local (for development)
NEXT_PUBLIC_EXTENSION_ID=your_extension_id
JIRA_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### Quality Gates

1. **Linting**: All ESLint rules must pass
2. **Type Checking**: No TypeScript errors
3. **Testing**: All tests must pass with >80% coverage
4. **Build**: All projects must build successfully

## Best Practices Summary

1. **Always run linting before commits**: `pnpm lint`
2. **Use build commands for validation**: `pnpm build` instead of dev servers
3. **Follow SOLID principles**: See CODING_STANDARDS.md
4. **Write meaningful commit messages**: Use conventional commit format
5. **Test thoroughly**: Unit tests, integration tests, manual testing
6. **Document changes**: Update relevant documentation
7. **Review code**: Follow code review guidelines
8. **Monitor performance**: Check bundle sizes and runtime performance

For detailed coding standards and best practices, refer to [CODING_STANDARDS.md](./CODING_STANDARDS.md).
For system architecture details, refer to [ARCHITECTURE.md](./ARCHITECTURE.md).
