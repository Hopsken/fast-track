import { Button } from '@internal/ui/components/button'
import { Label } from '@internal/ui/components/label'
import { Link } from 'react-router-dom'

import { InputSearch } from '@/components/ui'

import { useWizardContext } from './context'
import type { IssueTypeOption, ProjectOption } from './types'

export function TemplateWizardScopeStep() {
  const {
    state: { step, projectError, scope },
    actions: {
      selectProject,
      searchProjects,
      getProjectRecommendations,
      selectIssueType,
      searchIssueTypes,
      getIssueTypeRecommendations,
      goToStep
    },
    meta: {
      canProceedToStep2,
      issueTypePlaceholder,
      issueTypeEmptyText,
      isIssueTypeDisabled
    }
  } = useWizardContext()

  if (step !== 1) return null

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-project">Project</Label>
            <InputSearch<ProjectOption>
              id="template-project"
              name="templateProject"
              autoComplete="off"
              placeholder="Search projects…"
              value={scope.projectKey}
              onSelect={(opt) => void selectProject(opt)}
              onSearch={searchProjects}
              getRecommendations={getProjectRecommendations}
              debounceMs={300}
              minSearchLength={1}
              loadingText="Loading…"
              emptyText={projectError ?? 'No projects'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-issue-type">Issue type</Label>
            <InputSearch<IssueTypeOption>
              id="template-issue-type"
              name="templateIssueType"
              autoComplete="off"
              placeholder={issueTypePlaceholder}
              value={scope.issueTypeId}
              onSelect={selectIssueType}
              onSearch={searchIssueTypes}
              getRecommendations={getIssueTypeRecommendations}
              debounceMs={200}
              minSearchLength={1}
              loadingText="Loading…"
              emptyText={issueTypeEmptyText}
              disabled={isIssueTypeDisabled}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="secondary">
          <Link to="/templates">Cancel</Link>
        </Button>
        <Button onClick={() => goToStep(2)} disabled={!canProceedToStep2}>
          Next: Basics
        </Button>
      </div>
    </div>
  )
}
