import 'server-only'

import { requiredEnv } from '../env/required'

export interface ExtensionAuthEnv {
  jwtSecret: string
}

export function getExtensionAuthEnv(): ExtensionAuthEnv {
  return {
    jwtSecret: requiredEnv(
      'EXTENSION_JWT_SECRET',
      process.env.EXTENSION_JWT_SECRET
    )
  }
}
