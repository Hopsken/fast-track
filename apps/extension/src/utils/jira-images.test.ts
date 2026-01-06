import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getJiraApi } from '@/lib/jira'

import { getAuthenticatedImage, processHtmlContent } from './jira-images'

vi.mock('@/lib/jira')

describe('jira-images', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
  })

  describe('getAuthenticatedImage', () => {
    it('fetches image with auth headers', async () => {
      const mockApi = {
        getAuthHeaders: vi
          .fn()
          .mockReturnValue({ Authorization: 'Bearer token' }),
        getConfig: vi.fn().mockReturnValue({ type: 'oauth', instance_id: 'id' })
      }
      vi.mocked(getJiraApi).mockResolvedValue(mockApi as any)
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['']))
      } as any)

      const result = await getAuthenticatedImage(
        'https://example.com/image.png'
      )

      expect(result).toBe('blob:test')
      expect(fetch).toHaveBeenCalledWith('https://example.com/image.png', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' }
      })
    })

    it('handles errors gracefully', async () => {
      vi.mocked(getJiraApi).mockResolvedValue({} as any)
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await getAuthenticatedImage('url')

      expect(result).toBeNull()
    })
  })

  describe('processHtmlContent', () => {
    it('replaces src with blob url for jira images', async () => {
      const mockApi = {
        getAuthHeaders: vi.fn().mockReturnValue({}),
        getConfig: vi
          .fn()
          .mockReturnValue({ type: 'apiKey', host: 'https://jira.com' })
      }
      vi.mocked(getJiraApi).mockResolvedValue(mockApi as any)
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['']))
      } as any)

      const html = '<img src="https://jira.com/image.png" />'
      const result = await processHtmlContent(html)

      expect(result).toBe('<img src="blob:test" />')
    })

    it('ignores non-jira images', async () => {
      const html = '<img src="https://google.com/image.png" />'
      const result = await processHtmlContent(html)
      expect(result).toBe(html)
    })
  })
})
