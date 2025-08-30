import { FieldControl } from '~/components/ui/forms'
import { useStorage, StorageKey } from '~/storage'

export function PrimaryIssueKey() {
  const [issueKey, setIssueKey] = useStorage(
    StorageKey.PrimaryIssueKeyPrefix,
    ''
  )

  return (
    <FieldControl
      size="lg"
      title="Primary Issue Prefix"
      description="This key will be used when you omit issue prefix by just typing issue number using quick jump.">
      <input
        type="text"
        placeholder="TICKET-"
        value={issueKey}
        onChange={(e) => setIssueKey(e.target.value)}
        className={`input input-lg input-bordered min-w- w-full`}
      />
    </FieldControl>
  )
}
