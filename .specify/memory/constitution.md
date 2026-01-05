<!-- Sync Impact Report
Version change: N/A (template) -> 1.0.0
Modified principles:
- Principle 1 placeholder -> I. Code Quality Gatekeeping
- Principle 2 placeholder -> II. Test Evidence Required
- Principle 3 placeholder -> III. UX Consistency Across Surfaces
- Principle 4 placeholder -> IV. Performance Budgets and Regression Prevention
Added sections:
- Quality Gates
- Delivery Workflow
Removed sections:
- Principle 5 placeholder
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs:
- TODO(RATIFICATION_DATE): original ratification date unknown
-->

# Jira Boost Constitution

## Core Principles

### I. Code Quality Gatekeeping

- Changes MUST keep `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` clean.
- No new `any`, `@ts-ignore`, or disabled lint rules without documented justification.
- Diffs MUST stay focused; unrelated refactors require explicit approval.
  Rationale: Consistent quality keeps maintenance cost low and reviews reliable.

### II. Test Evidence Required

- New or changed logic MUST include automated tests at the right level.
- Tests MUST be deterministic and colocated as `*.test.ts` or `*.test.tsx`.
- If automated tests are impractical, document the exception and add manual
  verification steps in the spec and tasks.
  Rationale: Testing is the primary evidence of behavior and regression safety.

### III. UX Consistency Across Surfaces

- UI changes MUST reuse shared components from `packages/ui` when available.
- Loading, empty, error states, and keyboard behaviors MUST match existing
  patterns; deviations require a design note and approval.
- User-visible changes MUST be verified in all relevant surfaces
  (popup/options/content/website) and at least one additional browser for the
  extension.
  Rationale: Consistency builds user trust and reduces confusion.

### IV. Performance Budgets and Regression Prevention

- Feature specs MUST declare performance budgets when impact is plausible
  (latency, CPU, memory, bundle size).
- New network or compute-heavy flows MUST include a debounce/cancel/caching
  strategy and measurement notes.
- Performance regressions are release blockers until budgets are restored or an
  exception is approved.
  Rationale: Predictable performance keeps the extension responsive in Jira.

## Quality Gates

- `pnpm lint`, `pnpm typecheck`, and `pnpm test` MUST pass before merge.
- UI changes MUST include manual verification notes covering target browsers
  and surfaces in tasks or PR notes.
- Performance targets declared in specs MUST be verified or explicitly waived.

## Delivery Workflow

- Feature work MUST include spec, plan, and tasks in `/specs/` using templates.
- The plan MUST record a Constitution Check with pass/fail per principle.
- Exceptions MUST be recorded in Complexity Tracking with rationale and risk.

## Governance

- This constitution supersedes other guidance; resolve conflicts by amendment.
- Amendments require a documented rationale, impact assessment, and version bump.
- Versioning follows SemVer: MAJOR (breaking governance), MINOR (new principles
  or material expansions), PATCH (clarifications).
- Reviews MUST verify compliance; violations block merge unless an exception is
  recorded in the spec and plan.

**Version**: 1.0.0 | **Ratified**: 2026-01-05 | **Last Amended**: 2026-01-05
