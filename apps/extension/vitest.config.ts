import path from 'node:path'

import { defineProject } from 'vitest/config'

export default defineProject({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
      '#imports': path.resolve(__dirname, 'src/test/mocks/wxt-imports.ts'),
      'webextension-polyfill': path.resolve(
        __dirname,
        'src/test/mocks/wxt-imports.ts'
      )
    }
  },
  test: {
    name: 'extension',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}']
    // server: {
    //   deps: {
    //     inline: ['lodash-es']
    //   }
    // }
  }
})
