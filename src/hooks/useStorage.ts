type StorageItemValue<T extends WxtStorageItem<any, any>> =
  T extends WxtStorageItem<infer P, any> ? P : never

export const useStorage = <T extends WxtStorageItem<any, any>>(
  item: T,
  defaultValue: StorageItemValue<T>
): readonly [StorageItemValue<T>, (newValue: StorageItemValue<T>) => void] => {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    let isSubscribed = true

    item.getValue().then((value) => {
      if (!isSubscribed) return
      setValue(value)
    })

    const unwatch = item.watch((newValue) => {
      if (!isSubscribed) return
      setValue(newValue)
    })

    return () => {
      isSubscribed = false
      unwatch()
    }
  }, [])

  const onChange = useCallback(
    (value: StorageItemValue<T>) => {
      setValue(value)
      item.setValue(value)
    },
    [item]
  )

  return [value, onChange] as const
}
