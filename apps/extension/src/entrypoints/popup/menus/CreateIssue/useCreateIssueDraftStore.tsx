import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { useStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createStore, StoreApi } from 'zustand/vanilla'

import type { CreateIssueScope } from '@/types/create-issue'
import { IssueTemplate } from '@/types/template'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { buildInitialValues } from './utils'

export interface CreateIssueDraftState {
  scope: CreateIssueScope
  template?: IssueTemplate

  values: Record<string, unknown>
  errors: Record<string, string>
  promotedFieldIds: string[]

  // Wizard state
  wizardFields: VisibleField[]
  wizardIndex: number
  lastVisitedFieldId: string | null

  setValue: (fieldId: string, value: unknown) => void
  setErrors: (errors: Record<string, string>) => void
  clearError: (fieldId: string) => void
  promoteFields: (fieldIds: string[]) => void
  setWizardFields: (fields: VisibleField[]) => void
  setWizardIndex: (index: number) => void
  reset: () => void
}

type IssueDraftStore = StoreApi<CreateIssueDraftState>

export const createIssueDraftStore = (
  scope: CreateIssueScope,
  template?: IssueTemplate
) =>
  createStore<CreateIssueDraftState>()(
    devtools(
      (set) => ({
        scope,
        template,
        values: {},
        errors: {},
        promotedFieldIds: [],

        wizardFields: [],
        wizardIndex: -1,
        lastVisitedFieldId: null,

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
            lastVisitedFieldId: fields.some(
              (field) => field.fieldId === prev.lastVisitedFieldId
            )
              ? prev.lastVisitedFieldId
              : null,
            values: {
              ...buildInitialValues(fields),
              ...prev.values
            }
          }))
        },
        setWizardIndex: (index) => {
          set((state) => ({
            wizardIndex: index,
            lastVisitedFieldId:
              index >= 0
                ? (state.wizardFields[index]?.fieldId ?? null)
                : state.lastVisitedFieldId
          }))
        },

        reset: () =>
          set((prev) => ({
            values: buildInitialValues(prev.wizardFields),
            errors: {},
            promotedFieldIds: [],
            wizardFields: [],
            wizardIndex: -1,
            lastVisitedFieldId: null
          }))
      }),
      { name: 'create-issue-draft-store' }
    )
  )

const IssueDraftStoreContext = createContext<IssueDraftStore | null>(null)

export const CreateIssueDraftStoreProvider = (
  props: PropsWithChildren<{
    scope: CreateIssueScope
    template?: IssueTemplate
  }>
) => {
  const [store] = useState(() =>
    createIssueDraftStore(props.scope, props.template)
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
