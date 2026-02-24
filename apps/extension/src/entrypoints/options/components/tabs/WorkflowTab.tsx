import { useEffect, useMemo, useRef } from 'react'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'
import { Switch } from '@internal/ui/components/switch'
import { useLocation } from 'react-router-dom'

import { JiraIssue } from '@/types'
import { generateBranchName } from '@/utils/jira/issues'
import { useUserPreferences } from '~/stores/useUserPreferences'

import { TemplatesIndexPage } from '../../routes/templates/TemplatesIndexPage'

export function WorkflowTab() {
  const [preferences, setPreference] = useUserPreferences()
  const { pathname } = useLocation()

  const templatesRef = useRef<HTMLDivElement | null>(null)

  const branchPreview = useMemo(() => {
    return generateBranchName(
      {
        key: 'JIRA-123',
        summary: 'Big feature'
      } as JiraIssue,
      preferences.branchNameFormat
    )
  }, [preferences.branchNameFormat])

  useEffect(() => {
    if (pathname !== '/workflow/templates') return

    // Allow layout to paint first, then scroll.
    const id = window.setTimeout(() => {
      templatesRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)

    return () => {
      window.clearTimeout(id)
    }
  }, [pathname])

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Workflow</h2>
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-900"
                htmlFor="branch-name-format">
                Branch name format
              </label>
              <p className="text-xs text-gray-500">
                Copy a git branch name for issues using the{' '}
                {'Copy git branch name'} action. Formats:{' '}
                {`{key}, {summary}, {summaryShort}`}.
              </p>
              <Input
                name="branch-name-format"
                type="text"
                value={preferences.branchNameFormat}
                onChange={(event) =>
                  setPreference('branchNameFormat', event.target.value)
                }
                placeholder="{key}-{summary}"
              />
              <p className="text-xs text-gray-500">Preview: {branchPreview}.</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  On move to In Progress, copy git branch name
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Automatically copy the git branch name when moving a ticket
                  from To Do to In Progress.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="auto-copy-branch-name"
                  checked={preferences.autoCopyBranchNameOnTransition}
                  onCheckedChange={(checked) =>
                    setPreference('autoCopyBranchNameOnTransition', checked)
                  }
                />
                <Label
                  htmlFor="auto-copy-branch-name"
                  className="text-gray-700">
                  {preferences.autoCopyBranchNameOnTransition ? 'On' : 'Off'}
                </Label>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  On move to In Progress, assign to yourself
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Automatically assign yourself when moving an unassigned ticket
                  from To Do to In Progress.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="auto-assign-on-in-progress"
                  checked={preferences.autoAssignOnInProgress}
                  onCheckedChange={(checked) =>
                    setPreference('autoAssignOnInProgress', checked)
                  }
                />
                <Label
                  htmlFor="auto-assign-on-in-progress"
                  className="text-gray-700">
                  {preferences.autoAssignOnInProgress ? 'On' : 'Off'}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div ref={templatesRef} id="templates" className="scroll-mt-24">
        <TemplatesIndexPage />
      </div>
    </div>
  )
}
