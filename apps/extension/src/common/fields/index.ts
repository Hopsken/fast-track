import { JiraAssigneeAdapter } from './adapters/assignee'
import { JiraComponentAdapter } from './adapters/component'
import { JiraDescriptionAdapter } from './adapters/description'
import { JiraDueDateAdapter } from './adapters/duedate'
import { JiraEnvironmentAdapter } from './adapters/environment'
import { JiraGroupAdapter } from './adapters/group'
import { JiraLabelAdapter } from './adapters/labels'
import { JiraNumberAdapter } from './adapters/number'
import { JiraOptionAdapter } from './adapters/option'
import { JiraParentAdapter } from './adapters/parent'
import { JiraPriorityAdapter } from './adapters/priority'
import { JiraResolutionAdapter } from './adapters/resolution'
import { JiraSecurityLevelAdapter } from './adapters/securitylevel'
import { JiraDateAdapter, JiraDatetimeAdapter } from './adapters/shared/date'
import { JiraSprintAdapter } from './adapters/sprint'
import { JiraStringAdapter } from './adapters/string'
import { JiraSummaryAdapter } from './adapters/summary'
import { JiraTextAreaAdapter } from './adapters/textarea'
import { JiraUserAdapter } from './adapters/user'
import { JiraVersionAdapter } from './adapters/version'
import { registerAdapter, getFieldAdapter } from './registry'

// system fields
registerAdapter(JiraPriorityAdapter)
registerAdapter(JiraAssigneeAdapter)
registerAdapter(JiraLabelAdapter)
registerAdapter(JiraParentAdapter)
registerAdapter(JiraDueDateAdapter)
registerAdapter(JiraEnvironmentAdapter)
registerAdapter(JiraSummaryAdapter)
registerAdapter(JiraDescriptionAdapter)

// custom fields
registerAdapter(JiraSprintAdapter)

// general fields
registerAdapter(JiraComponentAdapter)
registerAdapter(JiraUserAdapter)
registerAdapter(JiraResolutionAdapter)
registerAdapter(JiraDateAdapter)
registerAdapter(JiraDatetimeAdapter)
registerAdapter(JiraOptionAdapter)
registerAdapter(JiraVersionAdapter)
registerAdapter(JiraGroupAdapter)
registerAdapter(JiraSecurityLevelAdapter)

// type-level adapters for custom fields
registerAdapter(JiraStringAdapter)
registerAdapter(JiraTextAreaAdapter)
registerAdapter(JiraNumberAdapter)

export { getFieldAdapter }
export { useFieldAdapter } from './hooks/useFieldAdapter'
