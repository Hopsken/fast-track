import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createStore, StoreApi } from 'zustand/vanilla'

import { IssueTemplate } from '@/types/template'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { buildInitialValues } from './utils'

export interface CreateIssueDraftState {
  template: IssueTemplate

  values: Record<string, unknown>
  errors: Record<string, string>
  promotedFieldIds: string[]

  // Wizard state
  wizardFields: VisibleField[]
  wizardIndex: number

  setValue: (fieldId: string, value: unknown) => void
  setErrors: (errors: Record<string, string>) => void
  clearError: (fieldId: string) => void
  promoteFields: (fieldIds: string[]) => void
  setWizardFields: (fields: VisibleField[]) => void
  setWizardIndex: (index: number) => void
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

        wizardFields: [],
        wizardIndex: 0,

        setValue: (fieldId, value) => {
          set((state) => ({
            values: {
              ...state.values,
              [fieldId]: value
            }
          }))
        },

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

        setWizardFields: (fields) => {
          set((prev) => ({
            wizardFields: fields,
            values: {
              ...buildInitialValues(fields),
              ...prev.values
            }
          }))
        },
        setWizardIndex: (index) => set({ wizardIndex: index }),

        reset: () =>
          set((prev) => ({
            values: buildInitialValues(prev.wizardFields),
            errors: {},
            promotedFieldIds: [],
            wizardFields: [],
            wizardIndex: 0
          }))
      }),
      { name: 'create-issue-draft-store' }
    )
  )

const IssueDraftStoreContext = createContext<IssueDraftStore | null>(null)

export const CreateIssueDraftStoreProvider = (
  props: PropsWithChildren<{ template: IssueTemplate }>
) => {
  const [store] = useState(() => createIssueDraftStore(props.template))

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
