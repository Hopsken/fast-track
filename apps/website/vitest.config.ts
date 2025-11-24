import { defineProject } from 'vitest/config'

export default defineProject({
  esbuild: {
    jsx: 'automatic'
  },
  test: {
    name: 'website',
    environment: 'jsdom',
    globals: true,
    include: [
      'specs/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}'
    ],
    setupFiles: ['./vitest.setup.ts']
  }
})
