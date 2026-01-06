import path from 'node:path'

import { WxtVitest } from 'wxt/testing'
import { defineProject } from 'vitest/config'

export default defineProject({
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
      '@/services/analytics': path.resolve(
        __dirname,
        'src/test/mocks/analytics.ts'
      )
    }
  },
  test: {
    name: 'extension',
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    server: {
      deps: {
        inline: ['dompurify']
      }
    }
  }
})