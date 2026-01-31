import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface CreateIssueDraftState {
  templateId: string | null
  values: Record<string, unknown>
  errors: Record<string, string>
  promotedFieldIds: string[]

  initDraft: (
    templateId: string,
    initialValues: Record<string, unknown>
  ) => void
  setValue: (fieldId: string, value: unknown) => void
  setErrors: (errors: Record<string, string>) => void
  clearError: (fieldId: string) => void
  promoteFields: (fieldIds: string[]) => void
  reset: () => void
}

export const useCreateIssueDraftStore = create<CreateIssueDraftState>()(
  devtools(
    (set) => ({
      templateId: null,
      values: {},
      errors: {},
      promotedFieldIds: [],

      initDraft: (templateId, initialValues) =>
        set({
          templateId,
          values: initialValues,
          errors: {},
          promotedFieldIds: []
        }),

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
        set({ templateId: null, values: {}, errors: {}, promotedFieldIds: [] })
    }),
    { name: 'create-issue-draft-store' }
  )
)
