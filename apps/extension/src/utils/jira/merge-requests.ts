import { type RemoteIssueLink } from 'jira.js/version3/models/remoteIssueLink'

import { JiraMergeRequest } from '@/types'
import { isNonNullable } from '@/utils/assert'

export function extractMergeRequestsFromRemoteLinks(
  links: RemoteIssueLink[]
): JiraMergeRequest[] {
  return links.map((link) => toMergeRequest(link)).filter(isNonNullable)
}

function toMergeRequest(link: RemoteIssueLink): JiraMergeRequest | null {
  const url = link.object?.url
  if (!url) return null

  const provider = getMergeRequestProvider(url)
  if (!provider || !isMergeRequestLink(url)) return null

  return {
    id: String(link.id ?? link.globalId ?? url),
    title: link.object?.title ?? link.object?.summary ?? 'Merge request',
    url,
    provider
  }
}

function isMergeRequestLink(url: string): boolean {
  const normalizedUrl = url.toLowerCase()

  if (normalizedUrl.includes('github.com')) {
    return normalizedUrl.includes('/pull/')
  }

  if (normalizedUrl.includes('gitlab.com')) {
    return normalizedUrl.includes('/merge_requests/')
  }

  return false
}

function getMergeRequestProvider(
  url: string
): JiraMergeRequest['provider'] | null {
  const normalizedUrl = url.toLowerCase()
  if (normalizedUrl.includes('github.com')) return 'github'
  if (normalizedUrl.includes('gitlab.com')) return 'gitlab'
  return null
}
