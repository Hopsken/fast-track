import { getJiraApi } from '@/lib/jira'
import { getLogger } from '~/utils/logger'

const log = getLogger('jira-images')

/**
 * Fetches a resource (like an image) with Jira authentication headers
 * and returns it as a Blob URL.
 */
export async function getAuthenticatedImage(
  url: string
): Promise<string | null> {
  try {
    const api = await getJiraApi()
    if (!api) throw new Error('Jira API not initialized')

    const config = api.getConfig()

    let fullUrl = url
    let baseUrl =
      config.type === 'apiKey'
        ? config.host
        : `https://api.atlassian.com/ex/jira/${config.instance_id}`

    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)

    if (url.startsWith('/')) {
      fullUrl = `${baseUrl}${url}`
    }

    const blob = await api.request<Blob>(fullUrl, { responseType: 'blob' })
    return URL.createObjectURL(blob)
  } catch (error) {
    log.warn('Failed to load authenticated image:', error)
    return null
  }
}

/**
 * Helper function to replace string content asynchronously
 */
async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, ...args: any[]) => Promise<string>
) {
  const promises: Promise<string>[] = []
  str.replace(regex, (match, ...args) => {
    promises.push(asyncFn(match, ...args))
    return match
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift() || '')
}

/**
 * Replaces all <img> src attributes in HTML content with authenticated Blob URLs.
 */
export async function processHtmlContent(html: string): Promise<string> {
  // Regex to capture the src attribute value
  const regex = /src="([^"]+)"/g

  return replaceAsync(html, regex, async (match, src) => {
    // Only attempt to authenticate if it looks like an internal Jira URL
    // or relative URL.
    // Jira Cloud attachments often contain 'secure/attachment' or 'wiki/download'.
    // Or if it is relative.
    const isRelative = src.startsWith('/')
    const isJira = src.includes('atlassian.net') || src.includes('jira')

    if (isRelative || isJira) {
      const objectUrl = await getAuthenticatedImage(src)
      if (objectUrl) {
        return `src="${objectUrl}"`
      }
    }
    return match
  })
}
