import iconPNG from "data-base64:~assets/logo.png"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey } from "~storage"

import "~styles/style.css"

import { useMemo } from "react"

import { FieldControl } from "~components/FieldControl"
import { useVersion } from "~hooks/useVersion"

function OptionsPage() {
  const version = useVersion()
  return (
    <div className="min-h-screen py-12 flex text-xl ">
      <div className="container  shadow-2xl rounded mx-auto px-6 py-4">
        <header className="flex items-center space-x-2">
          <img src={iconPNG} className="w-12 h-12" alt="Jira Boost" />
          <h1 className="text-3xl font-medium ">Jira Boost</h1>
          <span>v{version}</span>
        </header>

        <div className="divider" />

        <div className="pl-1 space-y-8">
          <h1 className="font-medium  mb-6">General</h1>
          <JiraHostInput />
          <PrimaryIssueKey />
        </div>
      </div>
    </div>
  )
}

function PrimaryIssueKey() {
  const [issueKey, setIssueKey] = useStorage(
    StorageKey.PrimaryIssueKeyPrefix,
    ""
  )

  return (
    <FieldControl
      size="lg"
      title="Primary Issue Prefix"
      description="This key will be used when you omit issue prefix by just typing issue number using quick jump.">
      <input
        type="text"
        placeholder="TICKET-"
        value={issueKey}
        onChange={(e) => setIssueKey(e.target.value)}
        className={`input input-lg input-bordered w-full min-w-`}
      />
    </FieldControl>
  )
}

function JiraHostInput() {
  const [jiraHost, setJiraHost] = useStorage(StorageKey.JiraUrl, "")

  const isValid = useMemo(() => jiraHost.startsWith("http"), [jiraHost])

  return (
    <div className="flex flex-col space-y-2">
      <div className="field flex items-center">
        <div className="flex flex-1 flex-col space-y-1">
          <div className={"text-lg"}>Jira URL</div>
          <div className={`text-base `}>
            Example: https://acme.atlassian.net
          </div>
        </div>
      </div>
      <input
        type="text"
        placeholder="Example: https://acme.atlassian.net/jira"
        value={jiraHost}
        onChange={(e) => setJiraHost(e.target.value)}
        className={`input input-lg input-bordered w-full ${
          !isValid ? "input-error" : ""
        }`}
      />
    </div>
  )
}

export default OptionsPage
