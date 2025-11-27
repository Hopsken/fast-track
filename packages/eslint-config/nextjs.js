import { defineConfig, globalIgnores } from 'eslint/config'
import { config as reactConfig } from './react.js'
import pluginNext from '@next/eslint-plugin-next'

export const config = defineConfig([
  ...reactConfig,

  globalIgnores(['.next/**', 'next-env.d.ts']),

  {
    plugins: {
      '@next/next': pluginNext
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules
    }
  }
])
