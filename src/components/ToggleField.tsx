import { useStorage } from "@plasmohq/storage/hook"

export type ToggleFieldProps = {
  title: string
  description: string
  storageKey: string
}

export function ToggleField(props: ToggleFieldProps) {
  const [checked, setChecked] = useStorage(props.storageKey, false)
  return (
    <div className="field flex items-center">
      <div className="flex flex-1 flex-col space-y-1">
        <div className="text-sm">{props.title}</div>
        <div className="text-xs text-slate-500">{props.description}</div>
      </div>
      <div className="flex flex-none items-center justify-center">
        <input
          type="checkbox"
          className="toggle toggle-sm"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked)
          }}
        />
      </div>
    </div>
  )
}
