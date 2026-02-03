import { Input } from '@internal/ui/components/input'

interface UserIdInputProps {
  value: unknown
  onChange: (v: unknown) => void
}

export function UserIdInput({ value, onChange }: UserIdInputProps) {
  return (
    <div className="space-y-1">
      <Input
        placeholder="Account ID (e.g. 557058:…)"
        value={
          (value as { accountId?: string } | undefined)?.accountId ??
          (value as string) ??
          ''
        }
        onChange={(e) =>
          onChange(e.target.value ? { accountId: e.target.value } : undefined)
        }
      />
      <p className="text-muted-foreground text-xs">Enter the Jira account ID</p>
    </div>
  )
}
