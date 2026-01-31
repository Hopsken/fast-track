import { useMemoizedFn } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import { getJiraService } from '@/services/jira-service'
import { getTemplateService } from '@/services/template-service'
import { useCommandInput } from '@/stores/useCommandInputStore'
import { buildCreateIssueFields } from '~/services/template-service/issue-payload'
import { showToast } from '~/stores/useToastStore'
import type { CachedFieldMetadata, IssueTemplate } from '~/types/template'
import { formatErrorMessage } from '~/utils/formatError'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { extractJiraFieldErrors, pickNonEmptyValues } from './utils'

export interface UseCreateIssueFormOptions {
  templateId: string
  template: IssueTemplate
  cache: CachedFieldMetadata | null | undefined
}

export function useCreateIssueForm({
  templateId,
  template,
  cache
}: UseCreateIssueFormOptions) {
  const { setSearch } = useCommandInput()
  const navigate = useNavigate()
  const { values, setErrors, promoteFields, reset } = useCreateIssueDraftStore()

  const submit = useMemoizedFn(async () => {
    const userInput = pickNonEmptyValues(values)

    const fields = buildCreateIssueFields({
      template,
      cache,
      userInput
    })

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

      await getTemplateService().markTemplateUsed(templateId)

      toast.update({
        style: 'success',
        title: 'Issue created',
        message: issueKey
      })

      reset()

      // Return to main menu and clear the "+" query.
      navigate('/')
      setSearch('')
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
