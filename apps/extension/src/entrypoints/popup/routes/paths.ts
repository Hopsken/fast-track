export const CommandRoutes = {
  IssueDef: `ticket/:ticketKey`,
  IssueMenu: (key: string) => `/ticket/${key}`,
  IssueAssign: (key: string) => `/ticket/${key}/assign`,
  IssueDetails: (key: string) => `/ticket/${key}/details`,
  IssueMergeRequests: (key: string) => `/ticket/${key}/merge-requests`,
  IssuePriority: (key: string) => `/ticket/${key}/priority`,
  IssueStatus: (key: string) => `/ticket/${key}/status`,

  CreateIssueFromTemplate: (templateId: string) =>
    `/issue/new?templateId=${templateId}`
}
