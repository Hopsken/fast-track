import js from '@eslint/js'
import globals from 'globals'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importX from 'eslint-plugin-import-x'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import prettier from 'eslint-plugin-prettier/recommended'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

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

  // TypeScript and React configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: ['./tsconfig.json', './apps/*/tsconfig.json']
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import-x': importX,
      sonarjs: sonarjs,
      unicorn: unicorn
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ['./apps/extension/tsconfig.json']
        })
      ],
      'import-x/core-modules': ['#imports']
    },
    rules: {
      // TypeScript ESLint rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',

      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // JSX Accessibility rules
      ...jsxA11y.configs.recommended.rules,

      // Import rules (using import-x)
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
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
      'import-x/no-unresolved': 'error', // Re-enabled with TypeScript resolver
      'import-x/no-unused-modules': 'off',
      'import-x/namespace': 'error', // Re-enabled with TypeScript resolver
      'import-x/no-duplicates': 'error', // Re-enabled with TypeScript resolver

      // SonarJS rules for code quality and cognitive complexity
      // Using cognitive complexity (mental difficulty) instead of cyclomatic complexity (path counting)
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/no-small-switch': 'off',

      // Unicorn rules for best practices
      'unicorn/filename-case': 'off', // Disable to allow PascalCase for React components
      'unicorn/no-null': 'off', // Allow null for React refs and some APIs
      'unicorn/prevent-abbreviations': 'off', // Too strict for existing codebase
      'unicorn/prefer-top-level-await': 'off', // Not supported in all environments
      'unicorn/prefer-module': 'off', // CommonJS is still used in config files
      'unicorn/import-style': 'off', // Allow flexible import styles
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-number-properties': 'error',

      // General code quality rules
      'no-console': 'off', // Allow console for extension debugging
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',
      'no-useless-computed-key': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],

      // Function and complexity rules
      'max-params': ['warn', 3],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3]
      // Note: Using SonarJS cognitive-complexity instead of ESLint's complexity rule
    }
  },

  // Configuration files (allow CommonJS)
  {
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}', '.prettierrc.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'writable',
        exports: 'writable'
      }
    },
    rules: {
      'unicorn/prefer-module': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },

  // Test files configuration
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'sonarjs/no-duplicate-string': 'off',
      'max-params': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },

  // Prettier integration (must be last to override formatting rules)
  prettier
]
