import { defineProxyService } from '@webext-core/proxy-service'

import { Database } from '@/repository'
import { JiraTicket } from '@/types'

class SearchServiceImpl {
  constructor(private database: Database) {}

  async search(query: string): Promise<JiraTicket[]> {
    if (!query) return this.database.issues.find().limit(10).exec()
    return this.database.issues.find().where('summary').regex(query).exec()
  }
}

export const [registerSearchService, getSearchService] = defineProxyService(
  'SearchService',
  (database: Database) => new SearchServiceImpl(database)
)

export type SearchService = InstanceType<typeof SearchServiceImpl>
