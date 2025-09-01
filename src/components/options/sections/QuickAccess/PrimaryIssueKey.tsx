import { InputFormField } from '~/components/ui/forms'
import { useStorage, StorageKey } from '~/storage'

export function PrimaryIssueKey() {
  const [issueKey, setIssueKey] = useStorage(
    StorageKey.PrimaryIssueKeyPrefix,
    ''
  )

  return (
    <InputFormField
      size="lg"
      title="Primary Issue Prefix"
      description="This key will be used when you omit issue prefix by just typing issue number using quick jump."
      value={issueKey}
      onChange={setIssueKey}
      placeholder="TICKET-"
    />
  )
}
