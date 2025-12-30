import { Button } from '@internal/ui/components/button'
import { CommandList } from '@internal/ui/components/command'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@internal/ui/components/empty'
import { WifiOff } from 'lucide-react'

import { openOptionsPage } from '@/utils'

export function EmptyAuthNotice() {
  const onConnectClick = () => {
    openOptionsPage()
    window.close()
  }

  return (
    <CommandList>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WifiOff />
          </EmptyMedia>
          <EmptyTitle>Connect to Jira</EmptyTitle>
          <EmptyDescription>
            To start using , connect your Jira workspace in the extension
            settings.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={onConnectClick}>Connect</Button>
          </div>
        </EmptyContent>
      </Empty>
    </CommandList>
  )
}
