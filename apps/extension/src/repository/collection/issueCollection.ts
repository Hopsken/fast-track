import { RxCollection } from 'rxdb'

import { JiraTicket } from '@/types'

import { IssueDocMethods } from '../schema/issueSchema'

export type IssueCollectionMethods = {
  listAll(): Promise<JiraTicket[]>
}

export type IssueCollection = RxCollection<
  JiraTicket,
  IssueDocMethods,
  IssueCollectionMethods
>

export const issueCollectionMethods: IssueCollectionMethods = {
  async listAll(this: IssueCollection) {
    return this.find().sort({ isInProgress: 'desc', updated: 'desc' }).exec()
  }
}
