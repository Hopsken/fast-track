import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'ahooks'

import {
  Action,
  ActionGroup,
  ActionList,
  ActionPanel,
  useNavigation
} from '@/common/commands'
import { useRouteState } from '@/common/commands/navigation'
import { GeneralIcon } from '@/components'
import { getJiraService } from '@/services/jira-service'
import type { JiraProject } from '@/types/jira'

import { IssueTypePickerMenu } from './IssueTypePickerMenu'

function useProjectSearch(query: string) {
  const debouncedQuery = useDebounce(query, { wait: 300 })
  return useQuery({
    queryKey: ['projects', 'search', debouncedQuery],
    queryFn: () => getJiraService().projects.searchProjects(debouncedQuery),
    staleTime: 30_000
  })
}

function useRecentProjects() {
  return useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: () => getJiraService().projects.getRecentProjects(),
    staleTime: 60_000
  })
}

export function ProjectPickerMenu() {
  const [search, setSearch] = useRouteState('search', '')
  const navigate = useNavigation()

  const isSearching = search.length > 0
  const { data: searchResults, isLoading: isSearchLoading } =
    useProjectSearch(search)
  const { data: recentProjects, isLoading: isRecentLoading } =
    useRecentProjects()

  const onSelect = (project: JiraProject) => {
    navigate.push(<IssueTypePickerMenu project={project} />)
  }

  const isLoading = isSearching ? isSearchLoading : isRecentLoading
  const projects = isSearching ? searchResults : recentProjects

  return (
    <ActionPanel
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      autoSelectSearchOnMount
      searchPlaceholder="Search projects…">
      <ActionList isLoading={isLoading} emptyPlaceholder="No projects found">
        <ActionGroup
          heading={isSearching ? 'Search results' : 'Recent projects'}>
          {projects?.map((project) => (
            <Action
              key={project.id}
              value={project.key}
              keywords={[project.name, project.key]}
              prefix={
                project.avatarUrl ? (
                  <GeneralIcon iconUrl={project.avatarUrl} alt={project.name} />
                ) : undefined
              }
              title={project.name}
              description={project.key}
              onSelect={() => onSelect(project)}
              exitOnSelect={false}
            />
          ))}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
