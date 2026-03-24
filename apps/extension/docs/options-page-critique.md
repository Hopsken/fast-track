# Options Page Design Critique — Handoff Doc

> **Date:** 2026-03-20
> **Branch:** `feat/navigation-breadcrumbs`
> **Scope:** `apps/extension/src/entrypoints/options/`

---

## TL;DR

The options page is functional but visually generic — it breaks the project's monochrome design system with 7+ chromatic hues, uses raw Tailwind colors instead of OKLCH semantic tokens, has flat visual hierarchy, zero motion, and an AI-slop OAuth feature layout. The template editor is the one surface that nails the brand voice.

---

## Priority Fixes (in order)

### 1. Normalize Color System — `/normalize`

**Problem:** ~95% of color usage is raw Tailwind (`gray-50`, `blue-500`, `green-100`, etc.) instead of semantic tokens (`bg-background`, `text-foreground`, `border-border`). 7+ chromatic hues (blue, green, emerald, purple, orange, amber, red) in a design system that allows zero.

**Files to touch:**
- `components/TabNavigation.tsx` — blue active tab → `border-foreground text-foreground`
- `components/OptionsHeader.tsx` — `bg-gray-50`, `text-gray-900`, `border-gray-200` → semantic tokens; red sign-out → `text-destructive`
- `components/auth/JiraConnectionCard.tsx` — green connected badge → monochrome; orange avatar → `from-gray-900 to-gray-600`; red disconnect → `text-destructive`
- `components/auth/JiraOAuthSetup.tsx` — emerald/blue/purple icon circles → `bg-muted text-muted-foreground`
- `components/tabs/GeneralTab.tsx` — all `gray-*` → semantic tokens
- `components/sections/AboutSection.tsx` — blue bullets → `text-muted-foreground`
- `routes/templates/TemplatesIndexPage.tsx` — amber warning → `bg-muted border-border`
- All other files under `options/` — grep for raw color classes

**Verification:**
```bash
grep -rn "gray-\|blue-\|green-\|amber-\|orange-\|purple-\|emerald-" apps/extension/src/entrypoints/options/
# Target: zero results (only semantic tokens remain; `text-destructive` for red)
```

**Follow-up command:** `/normalize`

---

### 2. Fix Visual Hierarchy in GeneralTab — `/arrange`

**Problem:** 4 sections (Jira Connection, Quick Access, Workflow, Privacy) all at `space-y-8` with identical heading sizes and bordered cards. Everything competes — Jira connection (critical first-run) has same weight as analytics toggle (set-and-forget).

**Approach:**
- Make Jira connection visually dominant (larger, possibly with logo when disconnected)
- Merge Workflow's 3 switch cards into 1 grouped card with internal `divide-y`
- Section headings: `text-sm font-medium text-muted-foreground uppercase tracking-wider` (quiet labels, not `text-lg font-semibold` that competes with content)

**Files:** `components/tabs/GeneralTab.tsx`

**Follow-up command:** `/arrange`

---

### 3. Distill OAuth Setup — `/distill`

**Problem:** Three colored icon circles (Secure login / Quick setup / Stay synced) with emerald/blue/purple backgrounds — textbook AI-generated feature card layout.

**Approach:** Remove the 3-feature row entirely. Replace with a single muted trust line: "Secure OAuth 2.0 — no passwords stored." Or keep icons but make monochrome `bg-muted`.

**Files:** `components/auth/JiraOAuthSetup.tsx`

**Follow-up command:** `/distill`

---

### 4. Add Motion — `/animate`

**Problem:** Zero animation in a design system that specifies motion v12 with spring physics and "one hero moment per surface." The popup feels alive; the options page feels dead.

**Approach:**
- One hero moment: spring-based fade+translateY on route content transitions
- Micro-interaction on Switch toggles (spring scale)
- Gate with `useReducedMotion()`
- Use canonical spring: `{ stiffness: 340, damping: 30, mass: 0.4 }`

**Files:** `App.tsx` (route wrapper), `components/tabs/GeneralTab.tsx` (switch interactions)

**Follow-up command:** `/animate`

---

### 5. Improve Tab Navigation — `/normalize`

**Problem:** Blue underline active state is the most generic "settings page" pattern. Linear/Raycast (stated references) use weight/opacity, not color.

**Approach:** `border-foreground text-foreground font-semibold` for active. Or replace underline with `bg-muted rounded-md` background highlight.

**Files:** `components/TabNavigation.tsx`

**Follow-up command:** Part of the `/normalize` pass above

---

## Bugs to Fix Along the Way

| Bug | File | Line | Fix |
|-----|------|------|-----|
| "Jira Boost" branding | `GeneralTab.tsx` | ~166 | Change to "Fast Track" |
| No Inter font import | `index.html` | — | Add `<link>` for Inter or ensure `@font-face` in CSS |
| LicenseTab dead code | `components/index.ts` | — | Remove export or wire up routing |
| Hand-rolled tooltip | `JiraConnectionCard.tsx` | ~69 | Replace with proper Tooltip component |
| Mixed spinner impls | `LicenseManagement/*.tsx` | — | Use `Spinner` from `@internal/ui` |
| Orange avatar gradient | `JiraConnectionCard.tsx` | ~32 | `from-gray-900 to-gray-600` (match header) |

---

## What NOT to Touch

- **Template editor** (`routes/templates/TemplateWizardPage.tsx`, `TemplateEditor.tsx`) — this is the best-designed surface. Linear-style inline inputs, transparent backgrounds. Don't regress it.
- **Empty state usage** — already using `<Empty>` compound component correctly.
- **Account popover** — clean and on-brand.

---

## Design References

- `.impeccable.md` — full design context (palette, motion, anti-patterns)
- `packages/tailwind-config/styles.css` — OKLCH token definitions
- `packages/ui/src/components/` — shared component library (21 components)

---

## Suggested Session Sequence

1. **Session 1:** `/normalize` — token migration + color fixes (biggest bang, touches all files)
2. **Session 2:** `/arrange` + `/distill` — hierarchy + OAuth cleanup (GeneralTab focus)
3. **Session 3:** `/animate` — motion pass (route transitions + micro-interactions)
4. **Session 4:** `/polish` — bugs, font import, dead code cleanup, final review
