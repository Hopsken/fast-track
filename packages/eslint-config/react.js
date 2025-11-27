import { defineConfig } from 'eslint/config'
import { config as baseConfig } from './base.js'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

export const config = defineConfig([
  ...baseConfig,

  Object.assign({}, pluginReact.configs.flat.recommended, {
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      // React is no longer required in JSX after 17
      'react/react-in-jsx-scope': 'off'
    }
  }),

  pluginReactHooks.configs.flat.recommended
])
