# Design Critique: Extension Popup Menu

> Generated 2026-03-19. Resolve items top-to-bottom — priority ordered.

---

## Priority Issues

### [x] 1. Spatial disorientation across navigation depth

All navigation depths (ticket list → issue detail → status picker → priority picker) look structurally identical: search bar + list. The only navigation cue is a tiny ArrowLeft `icon-xs` button. 3 levels deep, users lose context entirely.

**Fix:** Add contextual differentiation between hierarchy levels.

Options (pick one):
- Show a breadcrumb/route title in the search bar area (e.g. `PROJ-123 → Change status…`)
- Use the footer slot to show the current path instead of rotating shortcut hints
- Add a subtle left-border accent on sub-screens to signal depth

**Files:** `ActionSearch.tsx`, `IssueMenu`, navigation sub-menus

---

### [x] 2. Footer is underutilized / distracting

- Logo as settings trigger is non-discoverable — no user clicks a brand logo expecting settings
- Rotating shortcut hints cycle every 4s, causing peripheral visual noise
- When no toast is active (most of the time) the footer communicates almost nothing

**Fix:**
- Replace logo-as-settings with a gear icon or visible keyboard shortcut label (`⌘,`)
- Make hints static or trigger on focus/hover rather than on a timer
- Use the `ActionPanelSlot` portal more aggressively for contextual actions

**Files:** `ActionPanelFooter.tsx`, `FooterShortcutHints.tsx`

---

### [ ] 3. Selection state color breaks the monochrome contract

`[data-selected='true'] { background: #eef2ff }` — light indigo.
`caret-color: #6e5ed2` — purple.

Both introduce chromatic values. The design doc explicitly forbids new hues outside `--destructive`. Since the extension overlays Jira (already blue/purple), these tints visually merge with Jira's own selection colors rather than standing apart.

**Fix:**
- Replace `#eef2ff` → `var(--gray3)` (`#f3f4f6`) or `oklch(0.97 0 0)` (`--muted`)
- Replace `#6e5ed2` caret → `var(--gray12)` or `oklch(0.145 0 0)`
- If the purple caret is a deliberate brand exception, document it in `.impeccable.md`

**Files:** `linear-command.css`

---

### [ ] 4. Empty and loading states provide no recovery guidance

Empty states: plain centered gray text at 13px in a 48px `[cmdk-empty]` box. "No results found", "No templates", etc. give users no direction.

Loading: `<CommandLoading>Loading...</CommandLoading>` — plain text.

**Fix:**
- Add recovery guidance: "No results. Try a different search or press `/` for commands."
- Differentiate between "searching…" (in-flight) and "nothing found" (empty result)
- Use the `<Empty>` compound component from `@internal/ui` for key empty states (currently only used for auth)

**Files:** `ActionList`, `TicketListMenu`, `SearchResultMenu`, `IssueTemplatesMenu`

---

### [ ] 5. Toast colors are jarring in a monochrome UI

`success: emerald-50/emerald-600`, `failure: rose-50/rose-600`, `warning: amber-50/amber-600` — all with gradient backgrounds (`from-[color]-50 via-[color]-50 to-white`).

In an otherwise neutral interface, a sudden amber or emerald gradient feels like a different design system taking over. The design doc allows `--destructive` (red) for errors only.

**Fix:**
- Reduce toast to icon-only color: keep colored icon (emerald ✓, rose ✗, amber △) but use a neutral gray background for the toast bar
- Or: use `oklch` with very low chroma tints that are barely perceptible instead of Tailwind semantic colors

**Files:** `ActionPanelFooter.tsx` (`toastThemes` object)

---

## Minor Issues

### [ ] 6. `will-change` applied statically to all list items

```css
[cmdk-item] {
  will-change: background, color; /* ← promotes every item to compositor layer */
}
```

With 50+ tickets in the list, this promotes every item to its own GPU layer, potentially hurting memory. `will-change` should be applied on hover/focus only.

**Fix:** Move `will-change` to `:hover, :focus` or remove it — the 150ms background transition is fast enough without the hint.

**Files:** `linear-command.css`

---

### [ ] 7. Dark mode defined in CSS but not wired up

`.dark &` selectors exist in `linear-command.css` (dark gradient background) but there's no `prefers-color-scheme` listener or toggle in the popup.

**Fix:** Either wire up dark mode via `prefers-color-scheme: dark` on the root element, or remove the dead CSS until dark mode is properly scoped.

**Files:** `linear-command.css`, `main.tsx` or global CSS

---

### [ ] 8. Group heading ellipsis is dead CSS

```css
[cmdk-group-heading] {
  overflow: hidden;
  text-overflow: ellipsis; /* never triggers — no max-width set */
  white-space: nowrap;
}
```

In a 576px container, group headings will never overflow. Either add a `max-width` or remove the truncation rules.

**Files:** `linear-command.css`
