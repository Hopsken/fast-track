import { PropsWithChildren, ReactNode } from 'react'

type DevOnlyProps = PropsWithChildren<{
  fallback?: ReactNode
}>

export function DevOnly({ children, fallback = null }: DevOnlyProps) {
  const isDev = import.meta.env.DEV
  if (!isDev) return <>{fallback}</>
  return <>{children}</>
}
