import { useCurrentJiraHost } from './useCurrentJiraHost'
import { useStorage } from './useStorage'
import { useTemplates } from './useTemplates'

interface FreeLimitStatus {
  /** null while the subscription snapshot is loading */
  isPro: boolean | null
  isAtFreeLimit: boolean
  templateCount: number
}

const FREE_TEMPLATE_LIMIT = 3

export function useFreeLimitStatus(): FreeLimitStatus {
  const { data: currentHost } = useCurrentJiraHost()
  const { data: templates } = useTemplates({ includeOtherHosts: true })
  const [snapshot, , snapshotState] = useStorage('SubscriptionSnapshot')

  const isPro = snapshotState === 'success' ? (snapshot?.isPro ?? false) : null

  // Count only templates for the current Jira host — the limit is per workspace.
  const templateCount =
    templates?.filter((t) => t.scope.baseUrlHost === currentHost).length ?? 0

  const isAtFreeLimit = isPro === false && templateCount >= FREE_TEMPLATE_LIMIT

  return { isPro, isAtFreeLimit, templateCount }
}
