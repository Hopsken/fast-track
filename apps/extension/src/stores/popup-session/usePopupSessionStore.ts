import { create } from 'zustand'

interface PopupSessionState {
  inputValues: Record<string, string>
  setInputValue: (key: string, value: string) => void
  clearInputValue: (key: string) => void
  clearAllInputValues: () => void
}

export const usePopupSessionStore = create<PopupSessionState>((set) => ({
  inputValues: {},
  setInputValue: (key, value) =>
    set((state) => ({
      inputValues: {
        ...state.inputValues,
        [key]: value
      }
    })),
  clearInputValue: (key) =>
    set((state) => {
      if (!(key in state.inputValues)) return state

      const rest = { ...state.inputValues }
      delete rest[key]
      return {
        inputValues: rest
      }
    }),
  clearAllInputValues: () => set({ inputValues: {} })
}))
