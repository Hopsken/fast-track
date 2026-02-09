import { useMemoizedFn } from 'ahooks'

import { useNavigation } from '@/common/commands'
import { getJiraService } from '@/services/jira-service'
import { getTemplateService } from '@/services/template-service'
import { showToast } from '@/stores/command/useToastStore'
import { nextTick } from '@/utils/nextTick'
import type { IssueTemplate } from '~/types/template'
import { formatErrorMessage } from '~/utils/formatError'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { extractJiraFieldErrors, buildCreateIssueFields } from './utils'

export interface UseCreateIssueFormOptions {
  template: IssueTemplate
}

export function useCreateIssueForm({ template }: UseCreateIssueFormOptions) {
  const navigate = useNavigation()
  const { values, wizardFields, setErrors, promoteFields, reset } =
    useCreateIssueDraftStore()

  const submit = useMemoizedFn(async () => {
    const fields = buildCreateIssueFields(template, wizardFields, values)

    const toast = showToast({
      style: 'loading',
      title: 'Creating issue...',
      message: ''
    })

    try {
      const jira = getJiraService()
      const created = await jira.createIssue({ fields })

      const issueKey =
        typeof created?.key === 'string' && created.key.length > 0
          ? created.key
          : 'created'

      nextTick(() => {
        getTemplateService().markTemplateUsed(template.id)
      })

      toast.update({
        style: 'success',
        title: 'Issue created',
        message: issueKey
      })

      reset()

      navigate.pop()
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
