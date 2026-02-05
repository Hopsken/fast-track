import { defineProxyService } from '@webext-core/proxy-service'
import { compact, countBy, flatMap, orderBy } from 'lodash-es'

import { getStorageItem } from '@/lib/storage'
import { IssueSuggestion } from '@/services/ticket-service'

export type ProjectClickInfo = {
  count: number
  lastSelected: string
}

export type ProjectClicks = Record<string, ProjectClickInfo>

const PROJECT_LIMIT = 5
const CLICK_WEIGHT = 3
const SUGGESTION_WEIGHT = 1
const MIN_SUGGESTION_HITS = 2
const MAX_TRACKED_PROJECTS = 20

const projectClicksStorage = getStorageItem('ProjectClicks')

const normalizeProjectKey = (project: string) => project.trim().toUpperCase()

const pruneClicks = (clicks: ProjectClicks) => {
  const entries = orderBy(
    Object.entries(clicks),
    [([, info]) => info.count, ([, info]) => info.lastSelected],
    ['desc', 'desc']
  ).slice(0, MAX_TRACKED_PROJECTS)

  return Object.fromEntries(entries)
}

const collectSuggestionProjects = (suggestions?: IssueSuggestion) => {
  if (!suggestions) return []

  return compact(
    flatMap(
      [
        suggestions.inProgress,
        suggestions.todo,
        suggestions.done,
        suggestions.recommend
      ],
      (ticketKeys) =>
        ticketKeys.map(
          (ticketKey) => suggestions.tickets[ticketKey]?.projectKey
        )
    )
  )
}

export class SuggestionService {
  private scoreProjects(suggestionProjects: string[], clicks: ProjectClicks) {
    const suggestionCounts = countBy(
      suggestionProjects.map(normalizeProjectKey).filter(Boolean)
    )

    const projects = new Set([
      ...Object.keys(suggestionCounts),
      ...Object.keys(clicks)
    ])

    const scored = Array.from(projects)
      .map((project) => {
        const suggestionCount = suggestionCounts[project] ?? 0
        const clickCount = clicks[project]?.count ?? 0
        const suggestionScore =
          suggestionCount >= MIN_SUGGESTION_HITS
            ? suggestionCount * SUGGESTION_WEIGHT
            : 0
        const clickScore = clickCount * CLICK_WEIGHT
        const score = suggestionScore + clickScore

        return { project, score }
      })
      .filter(({ score }) => score > 0)

    return orderBy(
      scored,
      [({ score }) => score, ({ project }) => project],
      ['desc', 'asc']
    )
      .slice(0, PROJECT_LIMIT)
      .map(({ project }) => project)
  }

  async recordProjectClick(projectKey: string): Promise<void> {
    const normalized = normalizeProjectKey(projectKey)
    if (!normalized) return

    const now = new Date().toISOString()
    const clicks = (await projectClicksStorage.getValue()) ?? {}

    const next: ProjectClicks = {
      ...clicks,
      [normalized]: {
        count: (clicks[normalized]?.count ?? 0) + 1,
        lastSelected: now
      }
    }

    const pruned = pruneClicks(next)
    await projectClicksStorage.setValue(pruned)
  }

  async getFrequentProjectKeys(suggestions?: IssueSuggestion) {
    const [clicks, suggestionProjects] = await Promise.all([
      projectClicksStorage.getValue(),
      Promise.resolve(collectSuggestionProjects(suggestions))
    ])

    return this.scoreProjects(suggestionProjects, clicks ?? {})
  }
}

export const [registerSuggestionService, getSuggestionService] =
  defineProxyService<SuggestionService, []>(
    'SuggestionService',
    () => new SuggestionService()
  )
