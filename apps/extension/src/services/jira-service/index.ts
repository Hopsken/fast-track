import { defineProxyService } from '@webext-core/proxy-service'

import { getJiraApi } from '@/lib/jira'

class JiraServiceImpl {
  private jira = getJiraApi()

  public async autoComplete<T>(url: string, query: string): Promise<T> {
    return this.jira.request<T>({
      url,
      method: 'GET',
      params: { query }
    })
  }
}

export type JiraService = InstanceType<typeof JiraServiceImpl>

export const [registerJiraService, getJiraService] = defineProxyService<
  JiraServiceImpl,
  []
>('JiraService', () => new JiraServiceImpl())
