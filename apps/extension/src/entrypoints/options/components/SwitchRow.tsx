import { Label } from '@internal/ui/components/label'
import { Switch } from '@internal/ui/components/switch'

interface SwitchRowProps {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  footer?: React.ReactNode
}

export function SwitchRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  footer
}: SwitchRowProps) {
  return (
    <div className="border-border border-t p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-foreground text-sm font-medium">{title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
          <Label htmlFor={id} className="text-muted-foreground">
            {checked ? 'On' : 'Off'}
          </Label>
        </div>
      </div>
      {footer}
    </div>
  )
}
