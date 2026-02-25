import { z } from 'zod'

import { createTextFieldAdapter } from './shared/text'
import { TextAreaConfig } from './textarea/TextAreaConfig'
import { TextAreaInput } from './textarea/TextAreaInput'

// Jira built-in custom field type key for multiline text.
export const JIRA_TEXTAREA_CUSTOM_TYPE =
  'com.atlassian.jira.plugin.system.customfieldtypes:textarea'

export const JiraTextAreaAdapter = createTextFieldAdapter(
  JIRA_TEXTAREA_CUSTOM_TYPE,
  z.string(),
  {
    keyOf: (val) => val,
    InputComponent: TextAreaInput,
    ConfigComponent: TextAreaConfig,
    toDTO: (val) => val,
    fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
  }
)
