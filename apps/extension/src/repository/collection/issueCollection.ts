import { escapeRegExp } from 'lodash-es'
import { RxCollection, RxDocument } from 'rxdb'

import { JiraTicket } from '@/types'

import { IssueDocMethods } from '../schema/issueSchema'

export type IssueCollectionMethods = {
  getByKey(key: string): Promise<RxDocument<JiraTicket> | null>

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
  fuzzySearch(
    query: string,
    options?: { limit?: number }
  ): Promise<JiraTicket[]>
}

export type IssueCollection = RxCollection<
  JiraTicket,
  IssueDocMethods,
  IssueCollectionMethods
>

export const issueCollectionMethods: IssueCollectionMethods = {
  async getByKey(this: IssueCollection, key: string) {
    return this.findOne({
      selector: {
        key
      }
    }).exec()
  },

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
  },

  async fuzzySearch(
    this: IssueCollection,
    query: string,
    options?: { limit?: number }
  ) {
    const escaped = escapeRegExp(query)
    const regexSelector = { $regex: escaped, $options: 'i' }

    return this.find({
      selector: {
        $or: [
          { key: regexSelector },
          { summary: regexSelector },
          { 'assignee.displayName': regexSelector },
          { 'status.name': regexSelector },
          { 'issueType.name': regexSelector }
        ]
      }
    })
      .limit(options?.limit ?? 20)
      .exec()
  }
}
