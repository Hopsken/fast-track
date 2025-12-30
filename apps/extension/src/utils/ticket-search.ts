import { orderBy, sortedUniq } from 'lodash-es'

export const normalizeProjects = (projects: string[]) => {
  return sortedUniq(
    orderBy(
      projects
        .map((key) => key.trim())
        .filter(Boolean)
        .map((key) => key.toUpperCase())
    )
  )
}
