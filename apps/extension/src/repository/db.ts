import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb/plugins/core'
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage'
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema'

import {
  IssueCollection,
  issueCollectionMethods
} from './collection/issueCollection'
import { issueDocMethods, issueSchema } from './schema/issueSchema'

export type Database = RxDatabase<{
  issues: IssueCollection
}>

export async function initRxDB(): Promise<Database> {
  if (import.meta.env.NODE_ENV === 'development') {
    await import('rxdb/plugins/dev-mode').then((module) =>
      addRxPlugin(module.RxDBDevModePlugin)
    )
  }

  const database: Database = await createRxDatabase({
    name: 'jira-boost',
    storage: wrappedValidateZSchemaStorage({
      storage: getRxStorageLocalstorage()
    }),
    closeDuplicates: true
  })

  database.addCollections({
    issues: {
      schema: issueSchema,
      methods: issueDocMethods,
      statics: issueCollectionMethods
    }
  })

  return database
}
