/**
 * Jira Project Service
 *
 * Thin wrapper around jira.js project/issue-type endpoints.
 * Mirrors the structure of `lib/jira/issues.ts` (service class created by JiraAPI).
 */

import type { AgileClient } from 'jira.js'
import { Board } from 'jira.js/agile/models/board'
import { Sprint } from 'jira.js/agile/models/sprint'

import { isNonNullable } from '@/utils/assert'
import { concatPromises } from '@/utils/promise'

type ClientGetter = () => Promise<AgileClient>

export type AgileSprint = Sprint
export type AgileBoard = Board

export class JiraAgileService {
  constructor(private getClient: ClientGetter) {}

  async getBoards(projectKeyOrId: string) {
    const client = await this.getClient()
    const { values: boards } = await client.board.getAllBoards({
      projectKeyOrId
    })
    return boards
  }

  async getSprints(
    projectIdOrKey: string,
    params?: {
      boardIds?: number[]
      states?: Array<'active' | 'closed' | 'future'>
    }
  ): Promise<Sprint[]> {
    const client = await this.getClient()
    const { states = ['active', 'future'] } = params ?? {}

    let boardIds = params?.boardIds

    if (!boardIds) {
      boardIds = (await this.getBoards(projectIdOrKey))
        .map((board) => board.id)
        .filter(isNonNullable)
    }

    return concatPromises<Sprint>(
      boardIds.map(async (boardId) => {
        const { values: sprints } = await client.board.getAllSprints({
          boardId,
          state: states.join(',')
        })
        return sprints
      })
    )
  }
}
