import { RxDocument, RxJsonSchema } from 'rxdb'

import { JiraTicket } from '@/types'

export const issueSchema: RxJsonSchema<JiraTicket> = {
  title: 'Issue schema',
  description: 'Jira issue',
  version: 0,
  keyCompression: true,
  primaryKey: 'key',
  type: 'object',
  properties: {
    id: {
      type: 'number'
    },
    key: {
      type: 'string',
      maxLength: 255,
      minLength: 1
    },
    summary: {
      type: 'string'
    },
    issueType: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        iconUrl: {
          type: 'string'
        },
        description: {
          type: 'string'
        }
      }
    },
    status: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        statusCategory: {
          type: 'object',
          properties: {
            key: {
              type: 'string'
            },
            colorName: {
              type: 'string'
            },
            name: {
              type: 'string'
            }
          }
        }
      }
    },
    assignee: {
      type: 'object',
      properties: {
        displayName: {
          type: 'string'
        },
        emailAddress: {
          type: 'string'
        },
        avatarUrls: {
          type: 'string'
        }
      }
    },
    priority: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        iconUrl: {
          type: 'string'
        }
      }
    },
    projectKey: {
      type: 'string'
    },
    boardName: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    lastViewed: {
      type: 'string'
    }
  },
  required: ['id', 'key', 'summary', 'issueType', 'status']
}

export type IssueDocMethods = {
  assigneeName(): string
}

export const issueDocMethods: IssueDocMethods = {
  assigneeName(this: IssueDocument) {
    return this.assignee?.displayName || ''
  }
}

export type IssueDocument = RxDocument<JiraTicket, IssueDocMethods>
