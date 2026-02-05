import { defineProxyService } from '@webext-core/proxy-service'

import { JiraAPI } from '@/lib/jira'
import { autoBind } from '@/utils/auto-bind'

export type JiraCreatedIssue = {
  id?: string
  key?: string
  self?: string
}

export class JiraService {
  private jira = JiraAPI.getInstance()

  public agile = autoBind(this.jira.agile)
  public issues = autoBind(this.jira.issues)
  public projects = autoBind(this.jira.projects)

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

export const [registerJiraService, getJiraService] = defineProxyService<
  JiraService,
  []
>('JiraService', () => new JiraService())
