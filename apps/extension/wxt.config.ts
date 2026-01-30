import { readFile, readdir, writeFile } from 'fs/promises'
import { join } from 'path'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

import packageJson from '../../package.json'

const isDev = process.env.NODE_ENV !== 'production'

/** 递归查找 HTML 文件 */
async function findHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(fullPath)))
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

export default defineConfig({
  srcDir: 'src',
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/auto-icons',
    '@wxt-dev/analytics/module'
  ],
  imports: false,

  vite: () => ({
    plugins: [tailwindcss()]
  }),

  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      // 开发模式下添加 CSP 允许 React DevTools 和 WXT dev server
      if (isDev) {
        manifest.content_security_policy = {
          extension_pages:
            "script-src 'self' 'wasm-unsafe-eval' http://localhost:*; object-src 'self'"
        }
      }
    },
    // 生产构建后移除 React DevTools script
    'build:done': async (wxt) => {
      if (isDev) return

      const htmlFiles = await findHtmlFiles(wxt.config.outDir)
      for (const filePath of htmlFiles) {
        let content = await readFile(filePath, 'utf-8')
        // 移除 React DevTools script 及其注释
        content = content.replace(
          /<!--[\s\S]*?React DevTools[\s\S]*?-->\s*<script src="http:\/\/localhost:8097"><\/script>\s*/gi,
          ''
        )
        await writeFile(filePath, content)
      }
    }
  },

  manifest: {
    name: 'Fast Track for Jira',
    version: packageJson.version,
    description:
      'Quick search and access to your Jira tickets with enhanced board experience',
    host_permissions: ['https://*.atlassian.net/jira*'],
    omnibox: {
      keyword: 'jj'
    },
    permissions: ['storage', 'tabs', 'alarms'],
    browser_specific_settings: {
      gecko: {
        id: '{df6c8f8c-469a-4c88-8b45-23ff390f1d7d}'
      }
    },
    action: {
      default_title: 'Fast Track - Quick Search',
      default_popup: 'popup.html'
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+J',
          mac: 'Alt+J'
        },
        description: 'Open Fast Track quick search'
      }
    }
  }
})
