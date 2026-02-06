import { Badge } from '@internal/ui/components/badge'
import { ArrowUpCircle, Tag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { AssigneeAvatar } from '@/components/ui'
import { JiraIssueDetail, JiraIssue } from '@/types'
import { getStatusDotColor } from '@/utils/ticket-status'

const chipTransition = {
  duration: 0.15,
  ease: 'easeOut'
} as const

export function TicketMetadataChips({
  ticket
}: {
  ticket: Partial<JiraIssue> | JiraIssueDetail
}) {
  const labels = (ticket as JiraIssueDetail).labels || []

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Status */}
      <AnimatePresence mode="wait">
        {ticket.status && (
          <motion.div
            key={ticket.status.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={chipTransition}>
            <Badge variant="outline">
              <div
                className={`size-2 rounded-full ${getStatusDotColor(ticket.status)}`}
              />
              {ticket.status.name}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priority */}
      <AnimatePresence mode="wait">
        {ticket.priority && (
          <motion.div
            key={ticket.priority.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={chipTransition}>
            <Badge variant="outline">
              {ticket.priority.iconUrl ? (
                <img
                  src={ticket.priority.iconUrl}
                  className="size-3.5"
                  alt={ticket.priority.name}
                />
              ) : (
                <ArrowUpCircle className="size-3.5" />
              )}
              {ticket.priority.name}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignee */}
      <AnimatePresence mode="wait">
        {ticket.assignee && (
          <motion.div
            key={ticket.assignee.emailAddress}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={chipTransition}>
            <AssigneeAvatar
              size="1.2rem"
              className="rounded-full border"
              assignee={ticket.assignee}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="ml-1 flex items-center gap-1">
          <Tag className="text-muted-foreground size-3.5 opacity-70" />
          {labels.slice(0, 3).map((label) => (
            <Badge
              key={label}
              variant="outline"
              className="border-border/60 text-muted-foreground h-5 px-1.5 py-0 text-[10px] font-normal">
              {label}
            </Badge>
          ))}
          {labels.length > 3 && (
            <span className="text-muted-foreground text-[10px]">
              +{labels.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
