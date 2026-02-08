# Test Plan: Issue Template Field Adapters (Jira Cloud)

Owner: Sean

This plan is based on:

- `apps/extension/docs/issue-templates-architecture.md` (adapter registry + options flow)
- Current adapter registration in `apps/extension/src/common/fields/index.ts`

## 0) What “supported fields” means here

A field is considered **supported** if there is a registered adapter in `src/common/fields/index.ts`, i.e. it can be:

- configured in the Template Wizard (Fill/Preset or Limit/Restricted)
- rendered in the Create Issue popup flow
- serialized to Jira’s Create Issue payload via `adapter.toDTO()`

### Adapter inventory (source of truth: `src/common/fields/index.ts`)

| Adapter | Adapter key (registry key) | Jira schema match path | Typical Jira fields covered |
|---|---|---|---|
| JiraSummaryAdapter | `summary` | `schema.system === 'summary'` | Summary (system) |
| JiraDescriptionAdapter | `description` | `schema.system === 'description'` | Description (system) |
| JiraEnvironmentAdapter | `environment` | `schema.system === 'environment'` | Environment (system) |
| JiraDueDateAdapter | `duedate` | `schema.system === 'duedate'` | Due date (system) |
| JiraPriorityAdapter | `priority` | `schema.system === 'priority'` OR `schema.type === 'priority'` | Priority (system) |
| JiraAssigneeAdapter | `assignee` | `schema.system === 'assignee'` | Assignee (system) |
| JiraReporterAdapter | `reporter` | `schema.system === 'reporter'` | Reporter (system) |
| JiraLabelAdapter | `labels` | `schema.system === 'labels'` | Labels (system, array-of-string) |
| JiraParentAdapter | `parent` | `schema.system === 'parent'` | Parent (system) |
| JiraResolutionAdapter | `resolution` | `schema.system === 'resolution'` OR `schema.type === 'resolution'` | Resolution (system) |
| JiraSecurityLevelAdapter | `securitylevel` | `schema.type === 'securitylevel'` | Issue security (system field `security`) |
| JiraSprintAdapter | `com.pyxis.greenhopper.jira:gh-sprint` | `schema.custom === ...` | Sprint custom field (Jira Software) |
| JiraComponentAdapter | `component` | `schema.type === 'component'` OR `schema.items === 'component'` | Components (system is `components`, array-of-component) + custom component picker |
| JiraVersionAdapter | `version` | `schema.type === 'version'` OR `schema.items === 'version'` | Fix versions (`fixVersions`) + Affects versions (`versions`) |
| JiraUserAdapter | `user` | `schema.type === 'user'` OR `schema.items === 'user'` | Custom user picker (single/multi) |
| JiraGroupAdapter | `group` | `schema.type === 'group'` OR `schema.items === 'group'` | Custom group picker (single/multi) |
| JiraOptionAdapter | `option` | `schema.type === 'option'` OR `schema.items === 'option'` | Custom select list / radio / checkbox / multi-select |
| JiraDateAdapter | `date` | `schema.type === 'date'` | Custom date picker |
| JiraDateTimeAdapter | `datetime` | `schema.type === 'datetime'` | Custom date-time picker |
| JiraStringAdapter | `string` | `schema.type === 'string'` | Custom text fields |
| JiraNumberAdapter | `number` | `schema.type === 'number'` | Custom number fields |

Notes:

- `components`, `fixVersions`, `versions` are **not** registered by system key; they resolve via `schema.type/items` strategy in `src/common/fields/registry.ts`.
- `security` resolves via `schema.type === 'securitylevel'`.

## 1) Jira Cloud fixture setup (covers all adapters)

Goal: a Jira Cloud site with enough data + configuration such that CreateMeta exposes every supported field and each adapter can be exercised.

### 1.1 Create a Jira Cloud site

1. Create an Atlassian account.
2. Create a Jira Cloud site (e.g. `jira-boost-field-tests.atlassian.net`).
3. Ensure **Jira Software** is enabled on the site (needed for Sprint field + boards).

### 1.2 Users + groups (needed for user/group pickers)

Create (or invite) at least 3 users:

- `Admin` (site + Jira admin)
- `Alice` (standard user)
- `Bob` (standard user)

Create a group:

- `jb-field-testers`

Add `Alice` and `Bob` to `jb-field-testers`.

### 1.3 Projects

Create **two** projects to avoid Jira project-type feature gaps:

1) **JB-CM**: Jira Software **Company-managed** Scrum project

- Key: `JBCM`
- Use for: Sprint, Versions, Components, Issue Security, most custom fields

2) **JB-TM**: Jira Software **Team-managed** project

- Key: `JBTM`
- Use for: validating `parent` field availability on standard issue types (team-managed tends to expose `parent` more consistently).

If `parent` is available in CreateMeta for your company-managed project’s standard issues, you can skip `JB-TM`. Otherwise keep both.

### 1.4 Seed data (so option pickers have content)

In **JB-CM**:

- Components: create `API`, `UI` (Project settings → Components)
- Versions/Releases: create `1.0`, `2.0` (Project settings → Releases)
- Sprint data:
  - Create a Scrum board (default)
  - Create at least 2 sprints: `Sprint A` (future), `Sprint B` (active or future)
- Create issues:
  - 2 Epics: `EPIC A`, `EPIC B`
  - 2 Tasks: `Task 1`, `Task 2`
  - 1 Sub-task under `Task 1`
  - Add some labels on issues: `alpha`, `beta` (optional; adapter allows creating labels locally regardless)

### 1.5 Issue Security levels (for `securitylevel` adapter)

In **JB-CM** (company-managed):

1. Jira settings → Issues → **Issue security schemes** → Create scheme `JB Security Scheme`.
2. Add at least two levels:
   - `Internal` (viewers: `jb-field-testers`)
   - `Public` (viewers: `Anyone on the project`)
3. Associate the scheme with project `JB-CM`.
4. Ensure the “Security Level” field is on the **Create Issue** screen for the tested issue type.

If your Jira plan does not allow issue security, mark `securitylevel` coverage as *blocked by plan limitations*.

### 1.6 Custom fields (to hit `string`, `number`, `date`, `datetime`, `option`, `user`, `group`)

Create these custom fields (Jira settings → Issues → Custom fields → Create custom field):

| Custom field name | Jira field type | Expected Jira schema | Adapter |
|---|---|---|---|
| `JB Text` | Text (single line) | `type: 'string'` | JiraStringAdapter |
| `JB Number` | Number field | `type: 'number'` | JiraNumberAdapter |
| `JB Date` | Date picker | `type: 'date'` | JiraDateAdapter |
| `JB DateTime` | Date Time picker | `type: 'datetime'` | JiraDateTimeAdapter |
| `JB Select (single)` | Select list (single choice) | `type: 'option'` | JiraOptionAdapter |
| `JB Select (multi)` | Select list (multiple choices) / Checkboxes | `type: 'array', items: 'option'` | JiraOptionAdapter (via `items`) |
| `JB User (single)` | User picker (single user) | `type: 'user'` | JiraUserAdapter |
| `JB User (multi)` | User picker (multiple users) | `type: 'array', items: 'user'` | JiraUserAdapter (via `items`) |
| `JB Group (single)` | Group picker (single group) | `type: 'group'` | JiraGroupAdapter |

Populate options:

- `JB Select (single)`: `One`, `Two`, `Three`
- `JB Select (multi)`: `Red`, `Green`, `Blue`

Add these custom fields to the **Create Issue screen** for the issue types you’ll test (Task + Sub-task at minimum).

Also add (system fields) to Create screen if not present:

- Environment
- Due date
- Components
- Fix versions + Affects versions
- Labels
- Security level (if using issue security)
- Sprint (the Jira Software Sprint custom field)

## 2) Extension setup (test harness)

1. Build/run extension locally (`pnpm -C apps/extension dev`), install in Chrome.
2. Connect extension to the Jira site (host only: `jira-boost-field-tests.atlassian.net`).
3. Ensure the Template Wizard can load field metadata for:
   - Project `JBCM` + issue type `Task`
   - Project `JBCM` + issue type `Sub-task`
   - (Optional) Project `JBTM` + issue type `Task`

## 3) Test matrix (manual end-to-end)

For each field below:

- **Wizard config**: verify Fill (preset) and/or Limit (restricted) can be configured and saved.
- **Popup create**: create an issue from the template.
- **Jira verify**: open created issue in Jira UI and confirm field values.
- **Payload verify (optional but high-signal)**: inspect the request payload sent to Jira Create Issue (DevTools → Network) and confirm `buildCreateIssueFields()` output shape matches adapter `toDTO()`.

### 3.1 Summary + Description (preset-only)

Adapters: `summary`, `description`

Test cases:

1. Template Wizard: confirm mode toggle only shows **Fill** (no Limit).
2. Set Summary preset = `JB smoke summary`.
3. Set Description preset = `JB smoke description`.
4. Create issue → verify Summary/Description match.

### 3.2 Environment (string)

Adapter: `environment`

- Fill: preset to `Chrome / macOS`.
- Limit: restrict to `Chrome / macOS`, `Firefox / Windows` (verify you can add both values; this is a creatable text field).

Verify:

- Fill creates exact string.
- Limit mode: popup input only allows values from restricted list (and search works; note local filtering bug in §6).

### 3.3 Due date + Date + DateTime

Adapters: `duedate` (system), plus custom `date`, `datetime`.

Test cases:

- Due date Fill: preset `2030-01-02` → create issue → Jira shows Due date `2/Jan/2030` (local formatting ok).
- `JB Date` Fill: preset `2030-02-03` → stored as `YYYY-MM-DD`.
- `JB DateTime` Fill: preset via picker `2030-03-04T10:30` → ensure stored string is Jira ISO-with-offset style (adapter converts to `... .000+0000`).

Negative:

- Enter invalid date string in config (comma mode / manual) → should coerce to null / not allow invalid preset.

### 3.4 Priority

Adapter: `priority`

Test cases:

- Fill: preset = Highest/High.
- Limit: restrict to just one priority.

Verify:

- UI shows icons + names.
- Payload uses `{ id }`.

### 3.5 Assignee + Reporter

Adapters: `assignee`, `reporter`

Test cases:

- Fill: preset `Alice`.
- Popup create: verify issue assignee/reporter are set.

Options behavior coverage:

- With CreateMeta having **no `allowedValues`** but `autoCompleteUrl`, typing in selector should trigger server search (debounced 300ms) and show matching users.

Limit mode caveat:

- If Jira does not provide `allowedValues` for assignee/reporter, Limit mode will start empty and may not be able to add values (depends on CreateMeta behavior). Treat as a *must-verify*; if blocked, log bug: “restricted mode should still allow server search for autocomplete fields.”

### 3.6 Parent (Epic-only vs non-Epic depending on issue type)

Adapter: `parent`

Test cases:

1) For **Task** issue type:

- Fill: set Parent preset to `EPIC A`.
- Verify picker suggestions only show Epics (adapter applies `currentJQL: 'issuetype = Epic'`).
- Create issue → verify parent is EPIC A.

2) For **Sub-task** issue type:

- Fill: set Parent preset to `Task 1`.
- Verify picker suggestions exclude Epics (`currentJQL: 'issuetype != Epic'`).

Payload:

- Uses `{ key: 'JBCM-123' }`.

### 3.7 Labels (multi string)

Adapter: `labels` (system array)

Test cases:

- Fill: preset `[alpha, beta]`.
- Limit: restrict to `[alpha, beta, gamma]`, then in popup ensure only those are selectable.
- Verify create payload is an array of strings.

### 3.8 Components (multi component)

Adapter: `component` (via `items: 'component'`)

Test cases:

- Fill: preset `[API, UI]`.
- Limit: restrict to `[API]`.

Verify:

- Multi-select UI is used (CommandMultiSelect).
- Payload uses `[{ id: '...' }, ...]`.

### 3.9 Versions / Fix Versions (multi version)

Adapter: `version` (via `items: 'version'`)

Test cases:

- Fill: preset `Affects versions = [1.0]`, `Fix versions = [2.0]`.
- Limit: restrict to a single version.

Verify:

- Payload uses `[{ id }]`.

### 3.10 Sprint

Adapter: `com.pyxis.greenhopper.jira:gh-sprint`

Test cases:

- Fill: preset `Sprint A`.
- Limit: restrict to `[Sprint A]`.

Verify:

- Options are fetched from Agile boards for project (`agile.getSprints(projectKeyOrId)`).
- Payload uses `{ id: <number> }`.

### 3.11 Resolution

Adapter: `resolution`

Setup:

- Ensure Resolution field is on Create Issue screen (may be hidden by default).

Test cases:

- Fill: preset `Done`/`Fixed`.

Expected outcome:

- If Jira rejects setting Resolution on create (workflow rules), record as **Jira limitation** and verify extension error handling is reasonable (shows Jira field error mapping).

### 3.12 Security Level

Adapter: `securitylevel` (system `security`)

Test cases:

- Fill: preset `Internal`.
- Limit: restrict to `[Internal]`.

Verify:

- Options come from CreateMeta `allowedValues`.
- Payload uses `{ id }`.

### 3.13 Custom option fields (single + multi)

Adapter: `option`

Test cases:

- `JB Select (single)` Fill: preset `Two`.
- `JB Select (multi)` Fill: preset `[Red, Blue]`.
- Limit: restrict each to a subset, verify selection is limited.

Payload:

- Single: `{ id }`
- Multi: `[{ id }, ...]`

### 3.14 Custom string + number

Adapters: `string`, `number`

Test cases:

- `JB Text` Fill: preset `hello`.
- `JB Number` Fill: preset `42`.

Limit mode:

- For `JB Text` Limit: allowedOptions `["prod", "staging"]` (added via input in builder).
- For `JB Number` Limit: allowedOptions `[1, 2, 3]`.

Verify:

- Popup input switches to select UI when restricted.
- Payload sends raw value (`"..."` or number).

### 3.15 Custom user + group

Adapters: `user`, `group`

Test cases:

- `JB User (single)` Fill: preset `Alice`.
- `JB User (multi)` Fill: preset `[Alice, Bob]`.
- `JB Group (single)` Fill: preset `jb-field-testers`.

Limit mode caveat:

- Same caveat as Assignee/Reporter: if CreateMeta only provides `autoCompleteUrl` and no `allowedValues`, the restricted-value builder may not be able to add values.

Payload:

- User: `{ id: accountId }` (note: adapter uses `id`, not `accountId`)
- Group: `{ name }`

## 4) Cross-cutting behavioral tests

### 4.1 Adapter resolution priority

Verify that these resolve correctly (registry order: system → custom → items → type → fallback):

- `schema.system = 'labels'` uses labels adapter (not string adapter)
- `schema.system = 'fixVersions'` with `type=array, items=version` uses version adapter
- `schema.system = 'components'` with `items=component` uses component adapter
- `schema.custom = 'com.pyxis.greenhopper.jira:gh-sprint'` uses sprint adapter

### 4.2 Options source precedence (`useFieldOptions`)

Confirm all 3 data sources are hit at least once:

1) **Server search**: `allowedValues` absent, behavior not restricted

- Assignee / Reporter / Component / Version / Group (often autocomplete)

2) **CreateMeta allowedValues**

- Priority / Security level / some option fields

3) **Local config allowedOptions** (restricted)

- Text/Number restricted lists

### 4.3 Multi-select correctness

For any field where `schema.type === 'array'`:

- Config UI allows multiple preset values
- Popup UI uses multi-select
- Create payload maps each entry with `adapter.toDTO()`

### 4.4 Error surfacing

Intentionally break one field and verify error mapping:

- Remove a required field from screen → CreateMeta should stop exposing it → template should show conflicts (gap-analysis)
- Pick an invalid option (delete an option from Jira) → template should detect `restricted_option_invalid` or `preset_invalid`

## 5) Automated test recommendations (unit/integration)

These can run without a Jira instance (pure JS tests):

1) **Registry resolution tests** (`src/common/fields/registry.ts`)

- system match
- custom match
- array+items match
- type match
- fallback

2) **Adapter DTO contract tests** (each adapter)

- `fromDTO()` accepts Jira shapes (safeParse)
- `toDTO()` emits Jira create payload shape

3) **Create payload mapping** (`entrypoints/popup/menus/CreateIssue/utils.tsx`)

- `buildCreateIssueFields()` maps arrays vs scalars properly

4) **Options precedence tests** (`useFieldOptions`)

- server search enabled/disabled depending on `behavior` and `allowedValues`

## 6) Known implementation risks to explicitly verify

These are inferred from current code; treat them as expected “watch items” during testing:

1) `useFieldOptions` restricted-mode local search bug

- In local restricted mode, code calls `.filter(...)` but doesn’t use the result.
- Symptom: searching in restricted-mode option lists won’t narrow results.

2) Restricted-mode builder vs autocomplete-only fields

- `RestrictedValueBuilder` uses `SelectorComponent`, which ultimately uses `useFieldOptions`.
- `useFieldOptions` disables server search when `behavior === 'restricted'`.
- If Jira does not provide `allowedValues` for a field (only `autoCompleteUrl`), the restricted builder can become unusable (can’t add any values).

3) Resolution on create

- Jira may reject setting `resolution` at create time depending on workflow; if so, adapter is fine but the Jira behavior blocks it.

---

If you want, I can turn §5 into actual Vitest test skeletons (`apps/extension/src/common/fields/**/*.test.ts`) so we have a repeatable adapter contract suite.
