Monorepo (Turborepo) structure: this repository now uses Turborepo with the browser extension located under `apps/extension`. Future apps (e.g., website) can be added under `apps/` and shared code under `packages/`.

## Development

### Key Turborepo Commands

```bash
# Extension development
pnpm dev                 # Start Chromium development server
pnpm dev:ff              # Start Firefox development server
pnpm dev:edge            # Start Edge development server
pnpm build               # Build extension and supporting packages
pnpm build:chrome        # Build Chrome-only bundle
pnpm build:ff            # Build Firefox bundle
pnpm build:edge          # Build Edge bundle
pnpm zip                 # Create Chrome + Firefox zip outputs

# Website development
pnpm dev:website         # Start Next.js dev server
pnpm build:website       # Build for production
pnpm start:website       # Run production server locally

# Code quality
pnpm lint                # Run ESLint across projects
pnpm test                # Run tests
pnpm typecheck           # TypeScript validation across all projects
pnpm format:check        # Prettier check without writing files
```

### Code Quality & Review Process

1. **ESLint Configuration**: Each project has tailored ESLint rules
   - Extension: Standard WXT/React rules
   - Website: Next.js rules with .next directory exclusion

2. **TypeScript Strict Mode**: Enforced across all projects

3. **Development Workflow**:
   - Run `pnpm lint` before commits
   - Use `pnpm build` instead of dev commands for validation
   - Follow SOLID principles and clean code practices (see CODING_STANDARDS.md)

4. **Authentication Flow**:
   - OAuth 2.0 implementation for secure Jira integration
   - Custom event system for extension-website communication
   - Secure token management and storage

Key commands

- Dev (Chromium): `pnpm dev` → runs `turbo run dev --filter=extension`
- Dev (Firefox): `pnpm dev:ff` → runs `turbo run dev:ff --filter=extension`
- Build (Chromium): `pnpm build` → runs `turbo run build`
- Build (Chrome/Firefox/Edge): `pnpm build:chrome | build:ff | build:edge`
- Zip: `pnpm zip` or `pnpm zip:chrome` / `pnpm zip:firefox`
- Lint/Format/Typecheck: `pnpm lint | format:check | typecheck`

Source code for the extension has moved from `src/` to `apps/extension/src/`.

---

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## Beta Release Process

This project supports both stable and beta releases through the CI/CD pipeline. Beta versions allow testing new features with a limited audience before promoting to production.

### Beta Tag Convention

Beta versions follow semantic versioning with a beta suffix:

**Format**: `v{MAJOR}.{MINOR}.{PATCH}-beta.{INCREMENT}`

**Examples**:
- `v2.5.0-beta.1` - First beta for version 2.5.0
- `v2.5.0-beta.2` - Second iteration
- `v3.0.0-beta.1` - Major version beta

### Creating a Beta Release

1. **Update version in `package.json`**:
   ```json
   {
     "version": "2.5.0-beta.1"
   }
   ```

2. **Commit the version change**:
   ```bash
   git commit -am "chore: bump version to 2.5.0-beta.1"
   ```

3. **Create and push the beta tag**:
   ```bash
   git tag v2.5.0-beta.1
   git push origin v2.5.0-beta.1
   ```

4. **CI/CD automatically**:
   - Runs all quality gates (typecheck, lint, tests, e2e)
   - Builds with "BETA" label in extension name
   - Publishes Chrome version as unlisted (accessible via direct link)
   - Creates GitHub Release marked as pre-release
   - Attaches both Chrome and Firefox artifacts to the release

### Installing Beta Versions

**Chrome**:
- Access the unlisted version via the Chrome Web Store link provided after publishing
- Or download the `.zip` from the GitHub Release and load it as an unpacked extension

**Firefox**:
- Download the `.xpi` file from the GitHub Release
- Open `about:addons` in Firefox
- Click the gear icon → Install Add-on From File
- Select the downloaded `.xpi` file

### Promoting Beta to Stable

1. **Update version in `package.json`** (remove beta suffix):
   ```json
   {
     "version": "2.5.0"
   }
   ```

2. **Commit the version change**:
   ```bash
   git commit -am "chore: release version 2.5.0"
   ```

3. **Create and push the stable tag**:
   ```bash
   git tag v2.5.0
   git push origin v2.5.0
   ```

4. **CI/CD automatically**:
   - Publishes to Chrome Web Store (public)
   - Publishes to Firefox Add-ons (AMO)
   - Creates regular GitHub Release (not pre-release)

### Beta vs Stable Publishing

| Release Type | Chrome | Firefox | GitHub Release |
|--------------|--------|---------|----------------|
| **Stable** (`v2.5.0`) | Public on Chrome Web Store | Public on Firefox AMO | Regular release |
| **Beta** (`v2.5.0-beta.1`) | Unlisted on Chrome Web Store | Manual install from GitHub | Pre-release with artifacts |

### Rollback Plan

If a beta release has critical issues:

1. **Do not promote to stable** - keep stable tag at previous version
2. **Create a new beta** - e.g., `v2.5.0-beta.2` with fixes
3. **Emergency hotfix** - if needed, tag from previous stable commit

## Architecture & Documentation

- **ARCHITECTURE.md**: Comprehensive system architecture and patterns
- **CODING_STANDARDS.md**: Coding best practices and SOLID principles
- **DEVELOPMENT.md**: Development environment setup and procedures

## TODO

- [ ] Re-implement search history feature using browser storage + React Query
- [ ] Enhance OAuth flow error handling and user feedback
- [ ] Implement comprehensive test coverage for authentication components

### Search History Feature
- **Status**: Removed due to bugs
- **Description**: Re-implement search history functionality with proper state management
- **Requirements**:
  - Store user search queries in browser storage
  - Display recent searches in dropdown or sidebar
  - Allow clearing individual searches or entire history
  - Integrate with existing search system without conflicts
  - Add proper error handling and edge case management
- **Files to restore**: Search history storage, UI components, and search integration
- **Priority**: Medium
