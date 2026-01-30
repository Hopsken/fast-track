# React DevTools for Chrome Extension Development

Since Chrome extensions run in isolated contexts, the regular React DevTools browser extension cannot inspect React components in popup, options, or other extension pages. This guide explains how to use the **standalone version** of React DevTools.

## How It Works

The standalone React DevTools runs as an Electron app that listens on `localhost:8097`. A script tag in the extension's HTML pages connects to this server via WebSocket, allowing the DevTools to inspect React components.

### Configuration Overview

1. **HTML injection**: Each entry point's `index.html` includes `<script src="http://localhost:8097"></script>` as the first script in `<head>`
2. **CSP configuration**: The `wxt.config.ts` adds a Content Security Policy in dev mode to allow loading scripts from `localhost`
3. **Production cleanup**: A build hook removes the devtools script from HTML files during production builds

## Usage

### 1. Start React DevTools Standalone

In one terminal:

```bash
cd apps/extension
pnpm devtools
```

This opens an Electron window waiting for connections.

### 2. Start Extension Development

In another terminal:

```bash
pnpm dev
```

### 3. Open Extension Pages

Open the popup or options page. The DevTools window should automatically connect and display the React component tree.

## Files Modified

### `src/entrypoints/*/index.html`

Each HTML entry point includes the devtools script:

```html
<head>
  <!--
    React DevTools Standalone - DEV ONLY
    This script connects to the standalone React DevTools app.
    Run `pnpm devtools` before `pnpm dev` to use it.
    This tag is automatically removed in production builds by WXT.
  -->
  <script src="http://localhost:8097"></script>
  <!-- ... rest of head -->
</head>
```

### `wxt.config.ts`

Two hooks handle the dev/prod configuration:

```typescript
hooks: {
  // Add CSP for dev mode
  'build:manifestGenerated': (wxt, manifest) => {
    if (isDev) {
      manifest.content_security_policy = {
        extension_pages:
          "script-src 'self' 'wasm-unsafe-eval' http://localhost:* ws://localhost:*; object-src 'self'"
      }
    }
  },
  // Remove devtools script in production
  'build:done': async (wxt) => {
    if (isDev) return
    // Removes the script tag from all HTML files
  }
}
```

### `package.json`

Added convenience script:

```json
{
  "scripts": {
    "devtools": "npx react-devtools"
  }
}
```

## Troubleshooting

### DevTools not connecting

1. Make sure `pnpm devtools` is running **before** opening the extension page
2. Check the browser console for CSP errors
3. Try closing and reopening the popup/options page

### CSP errors

If you see "Refused to load script" errors, ensure:
- The extension was reloaded after `pnpm dev` started (manifest needs to update)
- The CSP in manifest includes `http://localhost:*`

### "hook.sub is not a function" error

This occurs when the React DevTools browser extension conflicts with the standalone version. Disable the React DevTools browser extension for extension pages, or ensure the standalone script loads before any other scripts.

## Production Builds

The devtools script is automatically removed during production builds (`pnpm build`). The `build:done` hook in `wxt.config.ts` strips the script tag and its comment from all HTML files.

You can verify by checking the built HTML files in `.output/chrome-mv3/` - they should not contain any reference to `localhost:8097`.
