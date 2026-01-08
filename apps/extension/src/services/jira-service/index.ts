/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineProxyService } from '@webext-core/proxy-service'
import { RequestConfig } from 'jira.js'

import { JiraAPI, getJiraApi } from '@/lib/jira'

type Join<Prefix extends string, Key extends string> = Prefix extends ''
  ? Key
  : `${Prefix}.${Key}`

type MethodPaths<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? Join<Prefix, Extract<K, string>>
    : T[K] extends object
      ? MethodPaths<T[K], Join<Prefix, Extract<K, string>>>
      : never
}[keyof T]

type PathValue<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never

type MethodArgs<T, P extends string> =
  PathValue<T, P> extends (...args: infer A) => any ? A : never

type MethodReturn<T, P extends string> =
  PathValue<T, P> extends (...args: any[]) => infer R ? Awaited<R> : never

class JiraServiceImpl {
  /**
   * Call any Jira API method by path, e.g.:
   * proxyCall('issues.getIssueEditMetadata', issue)
   * proxyCall('issues.searchIssuesByText', 'query')
   * proxyCall('getMyself')
   */
  async proxyCall<P extends MethodPaths<JiraAPI>>(
    methodPath: P,
    ...args: MethodArgs<JiraAPI, P>
  ): Promise<MethodReturn<JiraAPI, P> | null> {
    return this.withJira(async (jira) => {
      const parts = methodPath.split('.').filter(Boolean)
      if (parts.length === 0) {
        throw new Error('JiraService: methodPath is required')
      }

      const methodName = parts.pop() as string
      const context = parts.reduce<any>(
        (target, key) => target?.[key],
        jira as any
      )

      const method = context?.[methodName]
      if (typeof method !== 'function') {
        throw new Error(
          `JiraService: ${methodPath} is not a callable Jira API method`
        )
      }

      return method.apply(context, args)
    }, methodPath)
  }

  public async sendRequest<T>(config: RequestConfig): Promise<T> {
    return this.withJira(async (jira) => {
      return jira.request<T>(config)
    }, 'sendRequest')
  }

  async withJira<T>(
    action: (jira: JiraAPI) => Promise<T>,
    context: string
  ): Promise<T> {
    const jira = await getJiraApi()
    if (!jira) {
      throw new Error(`JiraService: ${context} skipped, not configured`)
    }

    return action(jira)
  }
}

export type JiraService = InstanceType<typeof JiraServiceImpl>

export const [registerJiraService, getJiraService] = defineProxyService<
  JiraServiceImpl,
  []
>('JiraService', () => new JiraServiceImpl())
