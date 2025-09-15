// Main service (facade pattern)
import { combineLatest, firstValueFrom } from 'rxjs'

import { fromStorage$ } from '../storage'

import { JiraAPI } from './api'

export type { JiraAPI }

export type { JiraApiConfig } from './types'

export async function getJiraApi() {
  const jiraAPIConfig = combineLatest([
    fromStorage$('JiraHost'),
    fromStorage$('JiraUserEmail'),
    fromStorage$('JiraApiToken')
  ])

  const initialConfig = await firstValueFrom(jiraAPIConfig)

  const jiraAPI = new JiraAPI({
    baseUrl: initialConfig[0],
    email: initialConfig[1],
    apiToken: initialConfig[2]
  })

  jiraAPIConfig.subscribe(([baseUrl, email, apiToken]) => {
    jiraAPI.updateConfig({ baseUrl, email, apiToken })
  })

  return jiraAPI
}
