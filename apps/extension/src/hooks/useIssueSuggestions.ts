import {
  keepPreviousData,
  replaceEqualDeep,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { uniq } from 'lodash-es'

import { getSuggestionService } from '@/services'
import { IssueSuggestion } from '@/services/suggestion-service'
import { queryKeys } from '@/utils/queryKeys'
import { clearReconcileIds, getReconcileIds } from '@/utils/reconcile-ids'
import { days, minutes } from '@/utils/time'

export function useIssueSuggestions() {
  const queryKey = queryKeys.tickets.suggestions
  const queryClient = useQueryClient()

  const query = useQuery<IssueSuggestion>({
    queryKey,
    queryFn: async () => {
      // Pass cached issue IDs as reconcileIssues so Jira's Enhanced Search
      // returns strong-consistent results for issues we know should be there.
      // Jira's search index has eventual-consistency lag and can return empty
      // arrays for a few seconds after a write; reconcileIssues is the
      // idiomatic fix for this. Capped at 50 (API limit), most-recent first.
      const cached = queryClient.getQueryData<IssueSuggestion>(
        queryKeys.tickets.suggestions
      )
      // Prioritise by relevance: in-progress > upcoming > done > recent history.
      // uniq preserves order so the most actionable issues fill the 50-slot limit.
      const cachedIds = cached
        ? uniq([
            ...(cached.inProgress ?? []),
            ...(cached.todo ?? []),
            ...(cached.done ?? []),
            ...(cached.recommend ?? [])
          ])
            .map((key) => Number(cached.tickets[key]?.id))
            .filter(Boolean)
        : []

      // Pending IDs go first so they fill the 50-slot cap with priority.
      const reconcileIssues = uniq([...getReconcileIds(), ...cachedIds]).slice(
        0,
        50
      )

      const result = await getSuggestionService().getIssueSuggestions(
        reconcileIssues.length ? { reconcileIssues } : undefined
      )

      // Throw on empty so React Query retries — Jira's Enhanced Search index
      // has eventual-consistency lag and recovers within seconds. Throwing
      // keeps retries alive; returning here would mark the query fresh for
      // staleTime (5 min) and suppress subsequent retry attempts, which breaks
      // the mutation flow (invalidateQueries → refetch → empty → no retry).
      if (!Object.keys(result.tickets).length) {
        throw new Error('Empty suggestions — retrying for Jira consistency')
      }

      // Clear pending IDs only on success — persist across retries.
      clearReconcileIds()

      return result
    },
    staleTime: minutes(5),
    gcTime: days(2),
    // Retry twice with 2 s gap to let Jira's search index catch up.
    retry: 2,
    retryDelay: 2000,
    // Show previous data during any loading phase (e.g. hydration gap on
    // extension open before persist layer restores the cache).
    placeholderData: keepPreviousData,
    // Secondary guard: refuse to replace non-empty cached data with an empty
    // result. Catches edge cases where the queryFn guard is bypassed (e.g.
    // query subscriptions, cache hydration). Preserves normy normalization for
    // real updates by delegating to replaceEqualDeep in the normal path.
    structuralSharing: (oldData: unknown, newData: unknown) => {
      const prev = oldData as IssueSuggestion | undefined
      const next = newData as IssueSuggestion
      if (
        prev &&
        Object.keys(prev.tickets).length > 0 &&
        !Object.keys(next.tickets).length
      ) {
        return prev
      }
      return replaceEqualDeep(oldData, newData)
    }
  })

  // When retries exhaust, React Query sets status=error and clears result.data.
  // The internal query cache still holds the last successful data — read it
  // directly to show stale tickets rather than a blank list. Retries remain
  // active and will recover as soon as Jira's index catches up.
  const staleData = query.isError
    ? queryClient.getQueryData<IssueSuggestion>(queryKey)
    : undefined

  return {
    ...query,
    data: query.data ?? staleData
  }
}
