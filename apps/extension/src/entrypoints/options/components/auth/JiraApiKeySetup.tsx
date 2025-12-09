import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@internal/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@internal/ui/components/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@internal/ui/components/form'
import { Input } from '@internal/ui/components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const jiraApiKeySchema = z.object({
  host: z
    .string()
    .trim()
    .min(1, { message: 'Jira site URL is required' })
    .pipe(z.url({ message: 'Enter a valid Jira site URL' })),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Jira account email is required' })
    .pipe(z.email({ message: 'Enter a valid email address' })),
  apiKey: z.string().trim().min(1, { message: 'API token is required' })
})

type JiraApiKeyFormValues = z.infer<typeof jiraApiKeySchema>

export interface JiraApiKeySetupProps {
  onConnect: (payload: { host: string; email: string; apiKey: string }) => void
  isLoading?: boolean
  defaultValues?: Partial<{ host: string; email: string; apiKey: string }>
  error?: string | null
}

export const JiraApiKeySetup: React.FC<JiraApiKeySetupProps> = ({
  onConnect,
  isLoading = false,
  defaultValues,
  error
}) => {
  const [showKey, setShowKey] = useState(false)

  const form = useForm<JiraApiKeyFormValues>({
    resolver: zodResolver(jiraApiKeySchema),
    defaultValues: {
      host: defaultValues?.host ?? '',
      email: defaultValues?.email ?? '',
      apiKey: defaultValues?.apiKey ?? ''
    }
  })

  useEffect(() => {
    form.reset({
      host: defaultValues?.host ?? '',
      email: defaultValues?.email ?? '',
      apiKey: defaultValues?.apiKey ?? ''
    })
  }, [defaultValues, form])

  const onSubmit = (values: JiraApiKeyFormValues) => {
    onConnect(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connect with API key</CardTitle>
        <CardDescription>
          Use your Atlassian API token when OAuth is not available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jira site URL</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="url"
                      placeholder="https://your-domain.atlassian.net"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jira account email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API token</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        autoComplete="off"
                        placeholder="Paste your Atlassian API token"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowKey((prev) => !prev)}
                        className="min-w-[100px]">
                        {showKey ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Generate a token from your Atlassian account: Account
                    settings &gt; Security &gt; Create and manage API tokens.
                  </FormDescription>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Required scopes: Read &mdash; read:jira-user,
                    read:jira-work. Write &mdash; write:jira-work.
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
