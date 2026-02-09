import { useMemoizedFn } from 'ahooks'

import { openInNewTab } from '@/utils/extension'

import { Action, ActionProps } from './Action'

export interface ActionHyperLinkProps extends Omit<ActionProps, 'onSelect'> {
  url: string
}

export function ActionHyperLink({ url, ...restProps }: ActionHyperLinkProps) {
  const onSelect = useMemoizedFn(() => openInNewTab(url))

  return <Action {...restProps} onSelect={onSelect} />
}
