import { Storage, type StorageWatchCallback } from "@plasmohq/storage"

export enum StorageKey {
  DarkMode = "dark-mode",
  ColorCard = "color-card",
  AutoFullScreen = "auto-fullscreen",
  CustomBackground = "custom-background",
  License = "ls-license",
  JiraUrl = "jira-url",
  PrimaryIssueKeyPrefix = "primary-issue-key-prefix"
}

export type StorageValueRecord = {
  [StorageKey.DarkMode]: "always" | "auto" | "disable"
  [StorageKey.ColorCard]: boolean
  [StorageKey.AutoFullScreen]: boolean
  [StorageKey.CustomBackground]:
    | undefined
    | {
        id: string
        url: string
        thumb_url: string
        instance_id: string
      }
  [StorageKey.License]: {
    valid: boolean
    license: string
    lastChecked: string
  }
  [StorageKey.JiraUrl]: string
  [StorageKey.PrimaryIssueKeyPrefix]: string
}

export class PersistLayer {
  private storage: Storage

  constructor() {
    this.storage = new Storage()
  }

  get<T extends StorageKey>(key: T) {
    return this.storage.get<StorageValueRecord[T]>(key)
  }

  set<T extends StorageKey>(key: T, value: StorageValueRecord[T]) {
    return this.storage.set(key, value)
  }

  remove<T extends StorageKey>(key: T) {
    return this.storage.remove(key)
  }

  watch<T extends StorageKey>(key: T, callback: StorageWatchCallback) {
    return this.storage.watch({
      [key]: callback
    })
  }

  unwatch<T extends StorageKey>(key: T, callback: StorageWatchCallback) {
    return this.storage.unwatch({
      [key]: callback
    })
  }
}

export const persistLayer = new PersistLayer()
