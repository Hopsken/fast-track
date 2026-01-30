import { TemplateWizardBasicsStep } from './BasicsStep'
import { TemplateWizardProvider } from './context'
import { TemplateWizardFieldsStep } from './FieldsStep'
import { TemplateWizardHeader } from './Header'
import { TemplateWizardScopeStep } from './ScopeStep'

export { type WizardScope } from './types'

export const TemplateWizard = {
  Provider: TemplateWizardProvider,
  Header: TemplateWizardHeader,
  ScopeStep: TemplateWizardScopeStep,
  FieldsStep: TemplateWizardFieldsStep,
  BasicsStep: TemplateWizardBasicsStep
}
