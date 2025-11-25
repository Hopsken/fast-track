import { PropsWithChildren, ReactNode } from 'react'

import { useStorage } from '@/hooks'

type DevOnlyProps = PropsWithChildren<{
  fallback?: ReactNode
}>

export function DevOnly({ children, fallback = null }: DevOnlyProps) {
  const [devMode] = useStorage('DevMode')
  const isDev = import.meta.env.DEV || devMode
  if (!isDev) return <>{fallback}</>
  return <>{children}</>
}
