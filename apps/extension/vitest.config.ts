import path from 'node:path'

import { defineProject } from 'vitest/config'

export default defineProject({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    name: 'extension',
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}']
    // server: {
    //   deps: {
    //     inline: ['lodash-es']
    //   }
    // }
  }
})
