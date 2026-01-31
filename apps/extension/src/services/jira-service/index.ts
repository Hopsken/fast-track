import { defineProxyService } from '@webext-core/proxy-service'

import { getJiraApi } from '@/lib/jira'

export type JiraCreatedIssue = {
  id?: string
  key?: string
  self?: string
}

class JiraServiceImpl {
  private jira = getJiraApi()

  public async autoComplete<T>(url: string, query: string): Promise<T> {
    return this.jira.request<T>({
      url,
      method: 'GET',
      params: { query }
    })
  }

  public async createIssue(input: {
    fields: Record<string, unknown>
  }): Promise<JiraCreatedIssue> {
    return this.jira.request<JiraCreatedIssue>({
      url: '/rest/api/3/issue',
      method: 'POST',
      data: input
    })
  }
}

export type JiraService = InstanceType<typeof JiraServiceImpl>

export const [registerJiraService, getJiraService] = defineProxyService<
  JiraServiceImpl,
  []
>('JiraService', () => new JiraServiceImpl())
