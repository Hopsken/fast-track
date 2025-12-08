import { RxCollection } from 'rxdb'

import { JiraTicket } from '@/types'

import { IssueDocMethods } from '../schema/issueSchema'

export type IssueCollectionMethods = {
  listAll(): Promise<JiraTicket[]>
  findInProgress(
    emailAddress: string,
    options?: { limit?: number }
  ): Promise<JiraTicket[]>
  findInOpenSprints(
    emailAddress: string,
    options?: { limit?: number }
  ): Promise<JiraTicket[]>
  findRecentlyViewed(options?: { limit?: number }): Promise<JiraTicket[]>
}

export type IssueCollection = RxCollection<
  JiraTicket,
  IssueDocMethods,
  IssueCollectionMethods
>

export const issueCollectionMethods: IssueCollectionMethods = {
  async listAll(this: IssueCollection) {
    return this.find().sort({ isInProgress: 'desc', updated: 'desc' }).exec()
  },

  async findInProgress(
    this: IssueCollection,
    emailAddress: string,
    options?: { limit?: number }
  ) {
    return this.find({
      selector: {
        'status.statusCategory.key': 'indeterminate',
        'assignee.emailAddress': emailAddress
      }
    })
      .limit(options?.limit ?? 20)
      .exec()
  },

  async findInOpenSprints(
    this: IssueCollection,
    emailAddress: string,
    options?: { limit?: number }
  ) {
    return this.find({
      selector: {
        sources: {
          $in: ['sprint']
        },
        'status.statusCategory.key': 'new',
        'assignee.emailAddress': emailAddress
      }
    })
      .limit(options?.limit ?? 20)
      .exec()
  },

  async findRecentlyViewed(
    this: IssueCollection,
    options?: { limit?: number }
  ) {
    return this.find({
      selector: {
        sources: {
          $in: ['history']
        }
      }
    })
      .limit(options?.limit ?? 20)
      .exec()
  }
}
