import baseConfig from '../../eslint.config.js'
import nx from '@nx/eslint-plugin'

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: await import('jsonc-eslint-parser')
    },
    plugins: {
      '@nx': nx
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}']
        }
      ]
    }
  }
]
