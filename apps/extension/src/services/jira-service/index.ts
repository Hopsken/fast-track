import { defineProxyService } from '@webext-core/proxy-service'

import { getJiraApi } from '@/lib/jira'

export type JiraCreatedIssue = {
  id?: string
  key?: string
  self?: string
}

class JiraServiceImpl {
  private jira = getJiraApi()

  public agile = {
    getBoards: (projectKeyOrId: string) =>
      this.jira.agile.getBoards(projectKeyOrId),
    getSprints: (projectKeyOrId: string) =>
      this.jira.agile.getSprints(projectKeyOrId)
  }

  public async autoComplete<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.jira.request<T>({
      url,
      method: 'GET',
      params
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

  async getLabels() {
    return this.jira.getLabels()
  }

  async searchUserOfProject(projectKey: string, query: string) {
    return this.jira.searchUserOfProject(projectKey, query)
  }
}

export type JiraService = InstanceType<typeof JiraServiceImpl>

export const [registerJiraService, getJiraService] = defineProxyService<
  JiraServiceImpl,
  []
>('JiraService', () => new JiraServiceImpl())
