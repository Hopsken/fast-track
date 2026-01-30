import { Label } from '@internal/ui/components/label'

import { GeneralIcon, InputSearch } from '@/components/ui'
import { JiraIssueType, JiraProject } from '@/types'

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
    meta: { issueTypePlaceholder, issueTypeEmptyText, isIssueTypeDisabled }
  } = useWizardContext()

  const { project, issueType } = scope

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Scope</h3>
        <p className="text-muted-foreground text-xs">
          Target project and issue type for this template
        </p>
      </div>

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
