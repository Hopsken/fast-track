import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getJiraApi } from '@/lib/jira'

import { getAuthenticatedImage, processHtmlContent } from './jira-images'

vi.mock('@/lib/jira')

describe('jira-images', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
  })

  describe('getAuthenticatedImage', () => {
    it('fetches image with jira client request', async () => {
      const mockApi = {
        getConfig: vi
          .fn()
          .mockReturnValue({ type: 'oauth', instance_id: 'id' }),
        request: vi.fn().mockResolvedValue(new Blob(['']))
      }
      vi.mocked(getJiraApi).mockResolvedValue(mockApi as any)

      const result = await getAuthenticatedImage(
        'https://example.com/image.png'
      )

      expect(result).toBe('blob:test')
      expect(mockApi.request).toHaveBeenCalledWith(
        'https://example.com/image.png',
        { responseType: 'blob' }
      )
    })

    it('handles errors gracefully', async () => {
      vi.mocked(getJiraApi).mockResolvedValue({
        request: vi.fn().mockRejectedValue(new Error('Network error')),
        getConfig: vi.fn().mockReturnValue({ type: 'oauth', instance_id: 'id' })
      } as any)

      const result = await getAuthenticatedImage('url')

      expect(result).toBeNull()
    })
  })

  describe('processHtmlContent', () => {
    it('replaces src with blob url for jira images', async () => {
      const mockApi = {
        request: vi.fn().mockResolvedValue(new Blob([''])),
        getConfig: vi
          .fn()
          .mockReturnValue({ type: 'apiKey', host: 'https://jira.com' })
      }
      vi.mocked(getJiraApi).mockResolvedValue(mockApi as any)

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
