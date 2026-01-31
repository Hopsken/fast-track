import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createStore, StoreApi } from 'zustand/vanilla'

import { IssueTemplate } from '@/types/template'

export interface CreateIssueDraftState {
  template: IssueTemplate

  values: Record<string, unknown>
  errors: Record<string, string>
  promotedFieldIds: string[]

  setValue: (fieldId: string, value: unknown) => void
  setErrors: (errors: Record<string, string>) => void
  clearError: (fieldId: string) => void
  promoteFields: (fieldIds: string[]) => void
  reset: () => void
}

type IssueDraftStore = StoreApi<CreateIssueDraftState>

const createIssueDraftStore = (template: IssueTemplate) =>
  createStore<CreateIssueDraftState>()(
    devtools(
      (set) => ({
        template,
        values: {},
        errors: {},
        promotedFieldIds: [],

        setValue: (fieldId, value) =>
          set((state) => ({
            values: {
              ...state.values,
              [fieldId]: value
            }
          })),

        setErrors: (errors) => set({ errors }),

        clearError: (fieldId) =>
          set((state) => {
            const next = { ...state.errors }
            delete next[fieldId]
            return { errors: next }
          }),

        promoteFields: (fieldIds) =>
          set((state) => {
            const next = new Set(state.promotedFieldIds)
            for (const id of fieldIds) next.add(id)
            return { promotedFieldIds: Array.from(next) }
          }),

        reset: () =>
          set({
            values: {},
            errors: {},
            promotedFieldIds: []
          })
      }),
      { name: 'create-issue-draft-store' }
    )
  )

const IssueDraftStoreContext = createContext<IssueDraftStore | null>(null)

export const CreateIssueDraftStoreProvider = (
  props: PropsWithChildren<{ template: IssueTemplate }>
) => {
  const store = useMemo(
    () => createIssueDraftStore(props.template),
    [props.template]
  )

  return (
    <IssueDraftStoreContext.Provider value={store}>
      {props.children}
    </IssueDraftStoreContext.Provider>
  )
}

export const useCreateIssueDraftStore = () => {
  const store = useContext(IssueDraftStoreContext)
  if (!store) throw new Error('Missing CreateIssueDraftStoreProvider')
  return useStore(store)
}
