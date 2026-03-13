import { useMemoizedFn } from 'ahooks'

import { useNavigation } from '@/common/commands'
import { getJiraService } from '@/services/jira-service'
import { getTemplateService } from '@/services/template-service'
import { showToast } from '@/stores/command/useToastStore'
import type { CreateIssueScope } from '@/types/create-issue'
import { nextTick } from '@/utils/nextTick'
import type { IssueTemplate } from '~/types/template'
import { formatErrorMessage } from '~/utils/formatError'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { extractJiraFieldErrors, buildCreateIssueFields } from './utils'

export interface UseCreateIssueFormOptions {
  scope: CreateIssueScope
  template?: IssueTemplate
}

export function useCreateIssueForm({
  scope,
  template
}: UseCreateIssueFormOptions) {
  const navigate = useNavigation()
  const { values, wizardFields, setErrors, promoteFields, reset } =
    useCreateIssueDraftStore()

  const submit = useMemoizedFn(async () => {
    const fieldValues = buildCreateIssueFields(wizardFields, values)

    const toast = showToast({
      style: 'loading',
      title: 'Creating issue...',
      message: ''
    })

    try {
      const jira = getJiraService()
      const created = await jira.issues.createIssue({
        projectKey: scope.project.key,
        issueTypeId: scope.issueType.id,
        fields: {
          ...fieldValues,
          summary: (values['summary'] ?? '') as string
        }
      })

      const issueKey =
        typeof created?.key === 'string' && created.key.length > 0
          ? created.key
          : 'created'

      if (template) {
        nextTick(() => {
          getTemplateService().markTemplateUsed(template.id)
        })
      }

      toast.update({
        style: 'success',
        title: 'Issue created',
        message: issueKey
      })

      reset()

      if (template) {
        navigate.pop()
      } else {
        navigate.pop(-Infinity)
      }
    } catch (e) {
      const errorsMap = extractJiraFieldErrors(e)

      if (errorsMap) {
        setErrors(errorsMap)
        promoteFields(Object.keys(errorsMap))

        toast.update({
          style: 'failure',
          title: 'Fix fields and retry',
          message: 'Some fields are invalid'
        })
      } else {
        toast.update({
          style: 'failure',
          title: 'Create issue failed',
          message: formatErrorMessage(e)
        })
      }
    }
  })

  return { submit }
}
