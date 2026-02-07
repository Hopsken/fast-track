import { JiraAssigneeAdapter } from './adapters/assignee'
import { JiraComponentAdapter } from './adapters/component'
import { JiraDateAdapter } from './adapters/date'
import { JiraDateTimeAdapter } from './adapters/datetime'
import { JiraDueDateAdapter } from './adapters/duedate'
import { JiraEnvironmentAdapter } from './adapters/environment'
import { JiraGroupAdapter } from './adapters/group'
import { JiraLabelAdapter } from './adapters/labels'
import { JiraNumberAdapter } from './adapters/number'
import { JiraOptionAdapter } from './adapters/option'
import { JiraParentAdapter } from './adapters/parent'
import { JiraPriorityAdapter } from './adapters/priority'
import { JiraReporterAdapter } from './adapters/reporter'
import { JiraResolutionAdapter } from './adapters/resolution'
import { JiraSecurityLevelAdapter } from './adapters/securitylevel'
import { JiraSprintAdapter } from './adapters/sprint'
import { JiraStringAdapter } from './adapters/string'
import { JiraUserAdapter } from './adapters/user'
import { JiraVersionAdapter } from './adapters/version'
import { registerAdapter, getFieldAdapter } from './registry'

// system fields
registerAdapter(JiraPriorityAdapter)
registerAdapter(JiraAssigneeAdapter)
registerAdapter(JiraLabelAdapter)
registerAdapter(JiraParentAdapter)
registerAdapter(JiraReporterAdapter)
registerAdapter(JiraDueDateAdapter)
registerAdapter(JiraEnvironmentAdapter)

// custom fields
registerAdapter(JiraSprintAdapter)

// general fields
registerAdapter(JiraComponentAdapter)
registerAdapter(JiraUserAdapter)
registerAdapter(JiraResolutionAdapter)
registerAdapter(JiraDateAdapter)
registerAdapter(JiraDateTimeAdapter)
registerAdapter(JiraOptionAdapter)
registerAdapter(JiraVersionAdapter)
registerAdapter(JiraGroupAdapter)
registerAdapter(JiraSecurityLevelAdapter)

// type-level adapters for custom fields
registerAdapter(JiraStringAdapter)
registerAdapter(JiraNumberAdapter)

export { getFieldAdapter }
export { useFieldAdapter } from './hooks/useFieldAdapter'
