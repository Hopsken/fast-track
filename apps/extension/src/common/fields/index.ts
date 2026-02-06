import { JiraAssigneeAdapter } from './adapters/assignee'
import { JiraPriorityAdapter } from './adapters/priority'
import { registerAdapter, getFieldAdapter } from './registry'

registerAdapter(JiraPriorityAdapter)
registerAdapter(JiraAssigneeAdapter)

export { getFieldAdapter }
export { useFieldAdapter } from './hooks/useFieldAdapter'
