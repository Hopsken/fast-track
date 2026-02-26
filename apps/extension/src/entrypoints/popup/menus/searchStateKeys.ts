export const POPUP_SEARCH_STATE_KEYS = {
  mainMenu: 'main-menu',
  issueAssignMenu: (ticketKey: string) => `issue-assign:${ticketKey}`
} as const
