import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb/plugins/core'
// import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory'
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema'

import {
  IssueCollection,
  issueCollectionMethods
} from './collection/issueCollection'
import { issueDocMethods, issueSchema } from './schema/issueSchema'

export type Database = RxDatabase<{
  issues: IssueCollection
}>

declare global {
  interface Window {
    db: Database
  }
}

let database: Database

export async function initRxDB(): Promise<Database> {
  if (database) return database

  if (import.meta.env.DEV) {
    console.log('RxDB: Development mode enabled')
    await import('rxdb/plugins/dev-mode').then((module) =>
      addRxPlugin(module.RxDBDevModePlugin)
    )
  }

  addRxPlugin(RxDBQueryBuilderPlugin)

  database = await createRxDatabase({
    name: 'jira-boost',
    // storage: wrappedKeyCompressionStorage({
    storage: wrappedValidateZSchemaStorage({
      storage: getRxStorageMemory()
    }),
    // }),
    closeDuplicates: true
  })

  database.addCollections({
    issues: {
      schema: issueSchema,
      methods: issueDocMethods,
      statics: issueCollectionMethods
    }
  })

  if (import.meta.env.DEV) {
    self.db = database
  }

  return database
}
