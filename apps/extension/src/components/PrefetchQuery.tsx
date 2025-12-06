import { createContext, PropsWithChildren, useContext } from 'react'
import { QueryObserverOptions } from '@tanstack/react-query'

const Context = createContext<boolean>(false)

export const PrefetchProvider = (props: PropsWithChildren) => {
  const { children } = props
  return <Context.Provider value={true}>{children}</Context.Provider>
}

export const usePrefetchOptionsIfApplicable = () =>
  useContext(Context)
    ? ({ notifyOnChangeProps: [] } satisfies Partial<QueryObserverOptions>)
    : {}
