import { Storage, type StorageWatchCallback } from "@plasmohq/storage"

export enum StorageKey {
  DarkMode = "dark-mode",
  ColorCard = "color-card"
}

type StorageValueRecord = {
  [StorageKey.DarkMode]: boolean
  [StorageKey.ColorCard]: boolean
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
