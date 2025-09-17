import baseConfig from '../../eslint.config.js'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      // Next.js specific rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // Override any base rules if needed for Next.js
      'react/react-in-jsx-scope': 'off' // Already handled in base config
    }
  },
  {
    files: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    }
  },
  {
    ignores: ['.next/**/*', 'node_modules/**/*']
  }
]
