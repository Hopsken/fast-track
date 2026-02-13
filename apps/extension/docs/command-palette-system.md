# Command Palette System

Raycast-style command palette for the browser extension popup.

```
AppWithProviders
  QueryClientProvider > UserContextProvider > AppRouter
    UserPreferencesProvider > HotkeysProvider
      NavigationProvider          ← stack nav; renders top-of-stack or <MainMenu/>
        MainMenu                  ← prefix routing: / + C c → sub-menus
      ActionPanelFooter           ← outside nav tree; portal target for slots + toasts
```

Entry point: `src/entrypoints/popup/App.tsx`

## Core Components

All exported from `src/common/commands/index.ts`.

| Component | Role |
|-----------|------|
| `ActionPanel` | Top-level wrapper around shadcn `<Command>`. Always includes `<ActionSearch>`. |
| `ActionSearch` | Search input + back button. Tri-modal escape: clear → back → close. |
| `ActionList` | Item container. Shows loading / empty state. |
| `ActionPanelFooter` | Fixed footer: toasts or "Fast Track" logo. |
| `ActionPanelSlot` | Portal children into footer from anywhere. |
| `ActionShortcut` | Renders shortcut hint badges. Auto-registers hotkey. |

**Re-exports:** `ActionItem`, `ActionGroup`, `ActionSeparator` (from shadcn CommandItem/Group/Separator)

## Action Types

All in `src/common/commands/actions/`.

| Action | Extra Props | Behavior |
|--------|------------|----------|
| `Action` (base) | `value`, `icon`, `prefix`, `title`, `keywords`, `onSelect`, `hotkeyId`, `exitOnSelect` (default true) | Pops nav after select when `exitOnSelect=true` |
| `ActionPush` | `target` (ReactElement), `onPop` | Pushes target onto nav stack |
| `ActionCopyToClipboard` | `content`, `onCopy` | Copies, shows toast, closes popup |
| `ActionHyperLink` | `url` | Opens in new tab |
| `ActionUser` | `user` (JiraUser) | Renders avatar + name |

## Deep Dives

- **[Navigation](./navigation.md)** — stack-based nav, push/pop, custom back
- **[Hotkeys](./hotkeys.md)** — registry, scopes, priority manager, useHotkey
- **[Menus](./menus.md)** — MainMenu routing, IssueMenu, CreateIssue wizard
