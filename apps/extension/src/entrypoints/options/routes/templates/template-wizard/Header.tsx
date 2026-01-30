import { useWizardContext } from './context'

export function TemplateWizardHeader() {
  const {
    state: { step },
    meta: { host }
  } = useWizardContext()

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-500">
        New template • Step {step}/2
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Create template</h2>
      <div className="text-xs text-gray-600">
        Scoped to <span className="break-all font-medium">{host}</span>
      </div>
    </div>
  )
}
