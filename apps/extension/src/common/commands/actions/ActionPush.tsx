import { PropsWithChildren, ReactElement } from 'react'
import { useMemoizedFn } from 'ahooks'

import { useNavigation } from '../navigation'

import { Action, ActionProps } from './Action'

export interface ActionPushProps extends ActionProps {
  target: ReactElement

  onPush?: () => void
  onPop?: () => void
}

export function ActionPush(props: PropsWithChildren<ActionPushProps>) {
  const { target, onPop, onPush, ...restProps } = props
  const navigate = useNavigation()

  const onSelect = useMemoizedFn(() => {
    onPush?.()
    navigate.push(target, onPop)
  })

  return <Action {...restProps} onSelect={onSelect} exitOnSelect={false} />
}
