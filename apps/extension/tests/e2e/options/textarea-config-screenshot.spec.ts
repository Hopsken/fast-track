import { test } from '../fixtures'

import fs from 'node:fs'
import path from 'node:path'

test.describe('Options - Textarea Config Screenshot', () => {
  test('capture textarea config component in template wizard', async ({ context, extensionId, openExtensionPage }) => {
    // Seed storage: auth + a template containing a textarea field preset config.
    const serviceWorker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker', { timeout: 30_000 }))

    await serviceWorker.evaluate(async () => {
      const auth = {
        type: 'apiKey',
        host: 'https://test.atlassian.net',
        userInfo: {
          accountId: 'test-account-id',
          email: 'test@example.com',
          name: 'Test User'
        },
        oauth: null,
        apiKey: {
          email: 'test@example.com',
          apiKey: 'test-api-key'
        }
      }

      const template = {
        id: 't-textarea',
        name: 'Textarea template',
        description: 'For screenshot',
        icon: undefined,
        scope: {
          baseUrlHost: 'test.atlassian.net',
          project: {
            id: '1',
            key: 'PROJ',
            name: 'Project',
            issueTypes: [
              {
                id: '10000',
                name: 'Task',
                iconUrl: '',
                description: '',
                subtask: false
              }
            ]
          },
          issueType: {
            id: '10000',
            name: 'Task',
            iconUrl: '',
            description: '',
            subtask: false
          }
        },
        fields: [
          {
            fieldId: 'customfield_10000',
            behavior: 'preset',
            presetValue: 'Line 1\nLine 2\nLine 3'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await new Promise<void>((resolve) => {
        chrome.storage.local.set(
          {
            AuthCredentials: auth,
            IssueTemplates: [template]
          },
          () => resolve()
        )
      })
    })

    const page = await openExtensionPage(`options.html#/templates/t-textarea`)
    await page.setViewportSize({ width: 1200, height: 900 })

    // Wait for field row to render
    await page.getByText('Custom notes (textarea)').waitFor({ timeout: 30_000 })

    const outDir = path.resolve(__dirname, '../artifacts')
    fs.mkdirSync(outDir, { recursive: true })

    const outPath = path.join(outDir, 'textarea-config.png')
    await page.screenshot({ path: outPath, fullPage: true })
  })
})
