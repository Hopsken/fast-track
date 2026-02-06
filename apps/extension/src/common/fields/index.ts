import { JiraAssigneeAdapter } from './adapters/assignee'
import { JiraComponentAdapter } from './adapters/component'
import { JiraDateAdapter } from './adapters/date'
import { JiraDateTimeAdapter } from './adapters/datetime'
import { JiraPriorityAdapter } from './adapters/priority'
import { JiraResolutionAdapter } from './adapters/resolution'
import { JiraUserAdapter } from './adapters/user'
import { registerAdapter, getFieldAdapter } from './registry'

// system fields
registerAdapter(JiraPriorityAdapter)
registerAdapter(JiraAssigneeAdapter)

// general fields
registerAdapter(JiraComponentAdapter)
registerAdapter(JiraUserAdapter)
registerAdapter(JiraResolutionAdapter)
registerAdapter(JiraDateAdapter)
registerAdapter(JiraDateTimeAdapter)

export { getFieldAdapter }
export { useFieldAdapter } from './hooks/useFieldAdapter'
