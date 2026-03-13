import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSetupWizard } from './useSetupWizard'

const mockUseCreateIssueDraftStore = vi.fn()
const mockUseIssueCreateMeta = vi.fn()
const mockComputeVisibleFields = vi.fn()
const mockComputeVisibleFieldsFromMeta = vi.fn()
const mockComputePromotedFields = vi.fn()
const mockComputeWizardSequence = vi.fn()

vi.mock('./useCreateIssueDraftStore', () => ({
  useCreateIssueDraftStore: () => mockUseCreateIssueDraftStore()
}))

vi.mock('@/hooks/useIssueCreateMeta', () => ({
  useIssueCreateMeta: () => mockUseIssueCreateMeta()
}))

vi.mock('@/services/template-service/gap-analysis', () => ({
  computeVisibleFields: (...args: unknown[]) =>
    mockComputeVisibleFields(...args),
  computeVisibleFieldsFromMeta: (...args: unknown[]) =>
    mockComputeVisibleFieldsFromMeta(...args)
}))

vi.mock('./utils', () => ({
  computePromotedFields: (...args: unknown[]) =>
    mockComputePromotedFields(...args),
  computeWizardSequence: (...args: unknown[]) =>
    mockComputeWizardSequence(...args)
}))

describe('useSetupWizard', () => {
  it('does not derive quick-create fields before metadata has loaded', () => {
    const setWizardFields = vi.fn()

    mockUseCreateIssueDraftStore.mockReturnValue({
      scope: { project: { key: 'ABC' }, issueType: { id: '10001' } },
      template: undefined,
      promotedFieldIds: [],
      setWizardFields
    })
    mockUseIssueCreateMeta.mockReturnValue({
      data: undefined,
      isSuccess: false
    })
    mockComputeVisibleFieldsFromMeta.mockReturnValue([{ fieldId: 'summary' }])
    mockComputePromotedFields.mockReturnValue([])
    mockComputeWizardSequence.mockImplementation((fields) => fields)

    renderHook(() => useSetupWizard())

    expect(mockComputeVisibleFieldsFromMeta).not.toHaveBeenCalled()
    expect(setWizardFields).not.toHaveBeenCalled()
  })

  it('sets quick-create wizard fields after metadata loads', () => {
    const setWizardFields = vi.fn()
    const metadata = [{ key: 'summary' }]
    const visibleFields = [{ fieldId: 'summary', required: true }]

    mockUseCreateIssueDraftStore.mockReturnValue({
      scope: { project: { key: 'ABC' }, issueType: { id: '10001' } },
      template: undefined,
      promotedFieldIds: [],
      setWizardFields
    })
    mockUseIssueCreateMeta.mockReturnValue({ data: metadata, isSuccess: true })
    mockComputeVisibleFieldsFromMeta.mockReturnValue(visibleFields)
    mockComputePromotedFields.mockReturnValue([])
    mockComputeWizardSequence.mockImplementation((fields) => fields)

    renderHook(() => useSetupWizard())

    expect(mockComputeVisibleFieldsFromMeta).toHaveBeenCalledWith(metadata)
    expect(setWizardFields).toHaveBeenCalledWith(visibleFields)
  })
})
