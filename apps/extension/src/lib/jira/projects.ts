/**
 * Jira Project Service
 *
 * Thin wrapper around jira.js project/issue-type endpoints.
 * Mirrors the structure of `lib/jira/issues.ts` (service class created by JiraAPI).
 */

import type { Version3Client } from 'jira.js'
import type { PageProject } from 'jira.js/version3/models/pageProject'
import type { Project } from 'jira.js/version3/models/project'

import type { JiraProject, JiraIssueType } from '@/types/jira'

type ClientGetter = () => Promise<Version3Client>

export type JiraProjectPage = Omit<PageProject, 'values'> & {
  values: JiraProject[]
}

const toIssueTypes = (project: Project): JiraIssueType[] => {
  return (project.issueTypes ?? [])
    .filter((it) => it.id && it.name)
    .map((it) => ({
      id: it.id!,
      name: it.name ?? '',
      description: it.description ?? '',
      iconUrl: it.iconUrl ?? '',
      subtask: it.subtask ?? false
    }))
}

const toJiraProject = (project: Project): JiraProject => {
  return {
    id: project.id,
    key: project.key,
    name: project.name,
    issueTypes: toIssueTypes(project),
    avatarUrl: project.avatarUrls?.['16x16']
  }
}

export class JiraProjectService {
  constructor(private getClient: ClientGetter) {}

  /**
   * Search projects visible to the current user.
   * Ensures `issueTypes` is available by requesting `expand: issueTypes`.
   */
  async searchProjects(
    query: string,
    params?: {
      startAt?: number
      maxResults?: number
      keys?: string[]
    }
  ): Promise<JiraProject[]> {
    const client = await this.getClient()

    const page = await client.projects.searchProjects({
      query,
      startAt: params?.startAt,
      maxResults: params?.maxResults ?? 7,
      keys: params?.keys,
      expand: 'issueTypes'
    })

    const mapped: JiraProjectPage = {
      ...page,
      values: (page.values ?? []).map(toJiraProject)
    }

    return mapped.values
  }

  /**
   * Get project by id or key.
   * `issueTypes` is always present in the returned object.
   */
  async getProject(projectIdOrKey: string): Promise<JiraProject> {
    const client = await this.getClient()
    const project = await client.projects.getProject({
      projectIdOrKey,
      expand: 'issueTypes'
    })

    return toJiraProject(project)
  }

  /**
   * Convenience helper for getting issue types without an additional endpoint.
   * This uses `getProject(..., expand: issueTypes)` under the hood.
   */
  async getProjectIssueTypes(projectIdOrKey: string): Promise<JiraIssueType[]> {
    const normalized = String(projectIdOrKey).trim()
    if (!normalized) return []

    const project = await this.getProject(normalized)
    return project.issueTypes ?? []
  }

  async getRecentProjects(): Promise<JiraProject[]> {
    const client = await this.getClient()
    const projects = await client.projects.getRecent({ expand: ['issueTypes'] })
    return projects.map(toJiraProject)
  }
}
