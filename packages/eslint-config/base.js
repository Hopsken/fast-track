import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import prettier from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'
import turboPlugin from 'eslint-plugin-turbo'
import importX from 'eslint-plugin-import-x'
import sonarjs from 'eslint-plugin-sonarjs'

export const config = defineConfig([
  // Base ESLint recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Import rules
  importX.flatConfigs.recommended,
  {
    ...importX.flatConfigs.typescript,
    settings: {
      ...importX.flatConfigs.typescript.settings,
      'import-x/core-modules': ['#imports']
    },
    rules: {
      ...importX.flatConfigs.typescript.rules,

      'import-x/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          pathGroups: [
            {
              pattern: '#imports',
              group: 'external',
              position: 'before'
            },
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['react'],
          distinctGroup: false,
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ]
    }
  },

  // SonarJS rules
  {
    ...sonarjs.configs.recommended,
    languageOptions: tseslint.configs.base.languageOptions
  },

  // Prettier rules, must be last
  prettier,

  // Test environment globals
  {
    files: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        vitest: 'readonly'
      }
    }
  },

  // Global ignores for performance optimization
  globalIgnores([
    'dist/**',
    '.output/**',
    'coverage/**',
    'tmp/**',
    '**/*.min.js',
    'build/**'
  ]),

  // Global configuration for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
        chrome: 'readonly'
      },
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  },

  {
    plugins: {
      turbo: turboPlugin
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn'
    }
  },

  {
    plugins: {
      onlyWarn
    }
  }
])
