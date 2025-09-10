Monorepo (Nx) structure: this repository now uses Nx with the browser extension located under `apps/extension`. Future apps (e.g., website) can be added under `apps/` and shared code under `packages/`.

Key commands

- Dev (Chromium): `pnpm dev` → runs `nx run extension:dev`
- Dev (Firefox): `pnpm dev:ff` → runs `nx run extension:dev:ff`
- Build (Chromium): `pnpm build` → runs `nx run extension:build`
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

## TODO

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
