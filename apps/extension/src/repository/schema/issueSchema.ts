import { RxDocument, RxJsonSchema } from 'rxdb'

import { JiraTicket } from '@/types'

export const issueSchema: RxJsonSchema<JiraTicket> = {
  title: 'Issue schema',
  description: 'Jira issue',
  version: 1,
  // keyCompression: true,
  primaryKey: 'key',
  type: 'object',
  properties: {
    id: {
      type: 'string'
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
      },
      required: ['name', 'iconUrl', 'description']
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
          },
          required: ['key', 'colorName', 'name']
        }
      },
      required: ['name', 'description', 'statusCategory']
    },
    assignee: {
      type: ['object', 'null'],
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
      },
      required: ['displayName', 'emailAddress', 'avatarUrls']
    },
    priority: {
      type: ['object', 'null'],
      properties: {
        name: {
          type: 'string'
        },
        iconUrl: {
          type: 'string'
        }
      },
      required: ['name', 'iconUrl']
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
    isInProgress: {
      type: 'boolean',
      default: false
    },
    lastViewed: {
      type: ['string', 'null'],
      format: 'date-time'
    },
    created: {
      type: 'string',
      format: 'date-time',
      maxLength: 64
    },
    updated: {
      type: 'string',
      format: 'date-time',
      maxLength: 64
    }
  },
  required: [
    'id',
    'key',
    'summary',
    'issueType',
    'status',
    'isInProgress',
    'updated'
  ],
  indexes: ['isInProgress', 'updated']
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
