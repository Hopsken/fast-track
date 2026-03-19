import { PropsWithChildren, ReactElement } from 'react'
import { useMemoizedFn } from 'ahooks'

import { useNavigation } from '../navigation'

import { Action, ActionProps } from './Action'

export interface ActionPushProps extends ActionProps {
  target: ReactElement
  /** Breadcrumb label shown in the search bar when this page is active. */
  navTitle?: string

  onPush?: () => void
  onPop?: () => void
}

export function ActionPush(props: PropsWithChildren<ActionPushProps>) {
  const { target, onPop, onPush, navTitle, ...restProps } = props
  const navigate = useNavigation()

  const onSelect = useMemoizedFn(() => {
    onPush?.()
    navigate.push(target, { onPop, title: navTitle })
  })

  return <Action {...restProps} onSelect={onSelect} exitOnSelect={false} />
}
