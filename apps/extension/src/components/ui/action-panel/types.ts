import { type ReactNode } from 'react'

export type ShortcutModifier = 'cmd' | 'ctrl' | 'opt' | 'shift'

export interface ActionShortcut {
  modifiers?: ShortcutModifier[]
  key: string
}

export interface ActionBase {
  id?: string
  title: string
  subtitle?: string
  shortcut?: ActionShortcut
  icon?: ReactNode
  order?: number
}

export type ActionNodeAction = ActionBase & {
  type: 'action'
  onAction: () => void
}

export type ActionNodeSubmenu = ActionBase & {
  type: 'submenu'
}

export type ActionNode = ActionNodeAction | ActionNodeSubmenu

export interface ActionSectionState {
  id: string
  title?: string
  subtitle?: string
  order: number
  items: ActionNode[]
}

export type MenuKey = string

export interface MenuState {
  key: MenuKey
  sections: ActionSectionState[]
}
