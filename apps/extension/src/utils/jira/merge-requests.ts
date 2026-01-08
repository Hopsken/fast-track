import { JiraMergeRequest } from '@/types'
import { isNonNullable } from '@/utils/assert'

export type JiraRemoteLink = {
  id?: number | string
  globalId?: string
  object?: {
    title?: string
    summary?: string
    url?: string
  }
  updated?: string | number
  created?: string | number
}

export function extractMergeRequestsFromRemoteLinks(
  links: JiraRemoteLink[]
): JiraMergeRequest[] {
  return links
    .map((link) => toMergeRequest(link))
    .filter(isNonNullable)
    .sort((left, right) => right.lastUpdatedAt - left.lastUpdatedAt)
}

function toMergeRequest(link: JiraRemoteLink): JiraMergeRequest | null {
  const url = link.object?.url
  if (!url) return null

  const provider = getMergeRequestProvider(url)
  if (!provider || !isMergeRequestLink(link, url)) return null

  return {
    id: String(link.id ?? link.globalId ?? url),
    title: link.object?.title ?? link.object?.summary ?? 'Merge request',
    url,
    lastUpdatedAt: getRemoteLinkUpdatedAt(link),
    provider
  }
}

function isMergeRequestLink(link: JiraRemoteLink, url: string): boolean {
  const normalizedUrl = url.toLowerCase()
  const title = link.object?.title?.toLowerCase() ?? ''

  if (normalizedUrl.includes('github')) {
    return normalizedUrl.includes('/pull/') || title.includes('pull request')
  }

  if (normalizedUrl.includes('gitlab')) {
    return (
      normalizedUrl.includes('/merge_requests/') ||
      title.includes('merge request')
    )
  }

  return false
}

function getMergeRequestProvider(
  url: string
): JiraMergeRequest['provider'] | null {
  const normalizedUrl = url.toLowerCase()
  if (normalizedUrl.includes('github')) return 'github'
  if (normalizedUrl.includes('gitlab')) return 'gitlab'
  return null
}

function getRemoteLinkUpdatedAt(link: JiraRemoteLink): number {
  const updatedValue = link.updated ?? link.created

  if (typeof updatedValue === 'number') {
    return updatedValue
  }

  if (typeof updatedValue === 'string') {
    const parsed = Date.parse(updatedValue)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  if (typeof link.id === 'number') {
    return link.id
  }

  return 0
}
