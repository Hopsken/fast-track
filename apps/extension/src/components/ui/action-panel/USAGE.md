# Action panel usage examples

`ActionPanel` mirrors Raycast's sectioned menu model while keeping items
registered as they render. Use the exports from `~/components/ui` to compose
panels with sections, submenus, and simple actions.

## Basic panel with inline actions

```tsx
import { ActionPanel } from '~/components/ui'

function BasicPanel({
  onCreate,
  onEdit
}: {
  onCreate: () => void
  onEdit: () => void
}) {
  return (
    <ActionPanel
      title="Quick actions"
      description="Navigate with arrows and Enter">
      <ActionPanel.Action
        title="Create issue"
        shortcut={{ key: 'N', modifiers: ['cmd'] }}
        onAction={onCreate}
      />
      <ActionPanel.Action
        title="Edit"
        shortcut={{ key: 'E' }}
        onAction={onEdit}
      />
    </ActionPanel>
  )
}
```

Actions outside a section are collected under an implicit section. Use sections
when you want headers or grouping.

## Grouped sections and submenus

```tsx
import { ActionPanel } from '~/components/ui'

function GroupedPanel({ onDelete }: { onDelete: () => void }) {
  return (
    <ActionPanel title="Issue actions">
      <ActionPanel.Section title="Navigation" subtitle="Move between views">
        <ActionPanel.Action
          title="Open board"
          shortcut={{ key: 'B' }}
          onAction={() => open('/boards')}
        />
        <ActionPanel.Submenu title="Switch status" shortcut={{ key: 'S' }}>
          <ActionPanel.Action
            title="To Do"
            onAction={() => updateStatus('todo')}
          />
          <ActionPanel.Action
            title="In Progress"
            onAction={() => updateStatus('in_progress')}
          />
          <ActionPanel.Action
            title="Done"
            onAction={() => updateStatus('done')}
          />
        </ActionPanel.Submenu>
      </ActionPanel.Section>

      <ActionPanel.Section title="Danger zone">
        <ActionPanel.Action
          title="Delete"
          shortcut={{ key: '⌫', modifiers: ['cmd'] }}
          onAction={onDelete}
        />
      </ActionPanel.Section>
    </ActionPanel>
  )
}
```

Arrow keys move selection; Enter or → opens submenus; ← closes them; Esc jumps
back to the root.

## Custom wrappers stay reactive

Because actions register when they render, you can wrap them without losing
tracking. Stable `id` props keep selection intact when items re-order.

```tsx
import { ReactNode } from 'react'
import { ActionPanel } from '~/components/ui'

function DestructiveAction({
  id,
  title,
  onConfirm,
  children
}: {
  id: string
  title: string
  onConfirm: () => void
  children?: ReactNode
}) {
  return (
    <ActionPanel.Action
      id={id}
      title={title}
      subtitle="Cannot be undone"
      onAction={onConfirm}>
      {children}
    </ActionPanel.Action>
  )
}

function WrappedPanel({ onRevoke }: { onRevoke: () => void }) {
  return (
    <ActionPanel title="Admin">
      <ActionPanel.Section title="Tokens">
        <DestructiveAction
          id="revoke"
          title="Revoke token"
          onConfirm={onRevoke}
        />
      </ActionPanel.Section>
    </ActionPanel>
  )
}
```
