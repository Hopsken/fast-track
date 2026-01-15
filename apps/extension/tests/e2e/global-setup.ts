import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

import type { FullConfig } from '@playwright/test'

const extensionRoot = path.resolve(__dirname, '../..')
const extensionPath = path.join(extensionRoot, '.output/chromium-mv3')

export default async function globalSetup(_config: FullConfig) {
  const buildResult = spawnSync('pnpm', ['exec', 'turbo', 'run', 'build'], {
    cwd: extensionRoot,
    stdio: 'inherit'
  })

  if (buildResult.status !== 0) {
    throw new Error('Failed to build extension before running e2e tests')
  }

  const manifestPath = path.join(extensionPath, 'manifest.json')
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing extension build at ${manifestPath}`)
  }
}
