// Response of GET https://api.atlassian.com/oauth/token/accessible-resources
// for any token in e2e. The host matches the API key fixtures, so OAuth and
// API key sign-ins land on the same mocked site.
export const E2E_ACCESSIBLE_RESOURCES = [
  {
    id: 'test-cloud-id',
    url: 'https://test.atlassian.net',
    name: 'test',
    scopes: ['read:jira-user', 'read:jira-work', 'write:jira-work'],
    avatarUrl: ''
  }
]
