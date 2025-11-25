import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb/plugins/core'
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression'
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
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

export async function getDatabase(): Promise<Database> {
  if (database) return database

  if (import.meta.env.DEV) {
    console.log('RxDB: Development mode enabled')
    await import('rxdb/plugins/dev-mode').then((module) =>
      addRxPlugin(module.RxDBDevModePlugin)
    )
  }

  addRxPlugin(RxDBQueryBuilderPlugin)
  addRxPlugin(RxDBMigrationSchemaPlugin)

  database = await createRxDatabase({
    name: 'fast-track',
    storage: wrappedValidateZSchemaStorage({
      storage: wrappedKeyCompressionStorage({
        storage: getRxStorageDexie()
      })
    }),
    /**
     * Avoid multiple service workers holding the same DB handle.
     * Dexie handles multi-tab internally; RxDB closes duplicates.
     */
    closeDuplicates: true
  })

  await database.addCollections({
    issues: {
      schema: issueSchema,
      methods: issueDocMethods,
      autoMigrate: true,
      statics: issueCollectionMethods
    }
  })

  self.db = database
  return database
}
