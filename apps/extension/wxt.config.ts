import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

import packageJson from '../../package.json'

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  imports: false,

  vite: () => ({
    plugins: [tailwindcss()]
  }),

  manifest: {
    name: 'Fast Track',
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
