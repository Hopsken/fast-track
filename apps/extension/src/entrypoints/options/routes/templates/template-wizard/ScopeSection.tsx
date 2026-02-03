import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'

import { GeneralIcon, InputSearch } from '@/components/ui'
import { JiraIssueType, JiraProject } from '@/repository/schema'

import { useWizardContext } from './context'

export function ScopeSection() {
  const {
    state: {
      scope,
      projectQuery,
      projectOptions,
      isProjectOptionsLoading,
      projectError,
      issueTypeOptions
    },
    actions: { setProjectQuery, selectProject, selectIssueType },
    meta: {
      mode,
      scopeDisplay,
      issueTypePlaceholder,
      issueTypeEmptyText,
      isIssueTypeDisabled
    }
  } = useWizardContext()

  // Edit mode: read-only scope display
  if (mode === 'edit' && scopeDisplay) {
    return (
      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Input value={scopeDisplay.projectKey} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>Issue type</Label>
            <Input value={scopeDisplay.issueTypeName} readOnly />
          </div>
        </div>
      </section>
    )
  }

  // Create mode: interactive scope pickers
  const { project, issueType } = scope

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
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
    </section>
  )
}
