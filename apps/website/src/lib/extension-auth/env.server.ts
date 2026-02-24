import 'server-only'

export interface ExtensionAuthEnv {
  jwtSecret: string
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function getExtensionAuthEnv(): ExtensionAuthEnv {
  return {
    jwtSecret: required(
      'EXTENSION_JWT_SECRET',
      process.env.EXTENSION_JWT_SECRET
    )
  }
}
