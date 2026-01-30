import { Button } from '@internal/ui/components/button'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'
import { Textarea } from '@internal/ui/components/textarea'
import { Link } from 'react-router-dom'

import { useWizardContext } from './context'

export function TemplateWizardBasicsStep() {
  const {
    state: { step, scope, name, descriptionTemplate, saveError, isSaving },
    actions: { goToStep, setName, setDescriptionTemplate, save },
    meta: { canSave }
  } = useWizardContext()

  if (step !== 2) return null

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Basics</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                name="templateName"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bug report…"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <Label>Scope</Label>
              <div className="truncate text-sm text-gray-700">
                {scope.projectKey} • {scope.issueTypeName}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-desc">Description (optional)</Label>
            <Textarea
              id="template-desc"
              name="templateDescription"
              autoComplete="off"
              value={descriptionTemplate}
              onChange={(e) => setDescriptionTemplate(e.target.value)}
              placeholder="Steps to reproduce…"
            />
          </div>

          {saveError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => goToStep(1)}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link to="/templates">Cancel</Link>
          </Button>
          <Button onClick={() => void save()} disabled={!canSave || isSaving}>
            {isSaving ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}
