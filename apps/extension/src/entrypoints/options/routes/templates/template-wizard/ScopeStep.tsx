import { Button } from '@internal/ui/components/button'
import { Label } from '@internal/ui/components/label'
import { Link } from 'react-router-dom'

import { GeneralIcon, InputSearch } from '@/components/ui'
import { JiraIssueType, JiraProject } from '@/types'

import { useWizardContext } from './context'

export function TemplateWizardScopeStep() {
  const {
    state: {
      step,
      scope,
      projectQuery,
      projectOptions,
      isProjectOptionsLoading,
      projectError,
      issueTypeOptions
    },
    actions: { setProjectQuery, selectProject, selectIssueType, goToStep },
    meta: {
      canProceedToStep2,
      issueTypePlaceholder,
      issueTypeEmptyText,
      isIssueTypeDisabled
    }
  } = useWizardContext()

  const { project, issueType } = scope

  if (step !== 1) return null

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-project">Project</Label>
            <InputSearch<JiraProject>
              id="template-project"
              name="templateProject"
              autoComplete="off"
              placeholder="Search projects…"
              value={project}
              onSelect={selectProject}
              filter={false}
              query={projectQuery}
              onQueryChange={setProjectQuery}
              options={projectOptions}
              isLoading={isProjectOptionsLoading}
              loadingText="Loading…"
              emptyText={projectError ?? 'No projects'}
              renderOptionIcon={(opt) =>
                opt.data.avatarUrl ? (
                  <GeneralIcon alt={opt.label} iconUrl={opt.data.avatarUrl} />
                ) : null
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-issue-type">Issue type</Label>
            <InputSearch<JiraIssueType>
              id="template-issue-type"
              name="templateIssueType"
              autoComplete="off"
              placeholder={issueTypePlaceholder}
              value={issueType}
              onSelect={selectIssueType}
              options={issueTypeOptions}
              filter={true}
              loadingText="Loading…"
              emptyText={issueTypeEmptyText}
              disabled={isIssueTypeDisabled}
              renderOptionIcon={(opt) =>
                opt.data.iconUrl ? (
                  <GeneralIcon alt={opt.label} iconUrl={opt.data.iconUrl} />
                ) : null
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="secondary">
          <Link to="/templates">Cancel</Link>
        </Button>
        <Button onClick={() => goToStep(2)} disabled={!canProceedToStep2}>
          Next: Fields
        </Button>
      </div>
    </div>
  )
}
