import path from 'node:path'

import { defineProject } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'

export default defineProject({
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src')
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
