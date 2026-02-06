import { JiraPriorityAdapter } from './adapters/priority'
import { registerAdapter, getFieldAdapter } from './registry'

registerAdapter(JiraPriorityAdapter)

export { getFieldAdapter }
export { useFieldAdapter } from './hooks/useFieldAdapter'
