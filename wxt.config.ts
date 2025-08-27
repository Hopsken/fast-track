import { defineConfig } from "wxt"

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  imports: {
    dirs: ["src/storage"]
  },
  manifest: {
    name: "Jira Boost",
    description: "Quick search and access to your Jira tickets with enhanced board experience",
    host_permissions: ["https://*.atlassian.net/jira*"],
    omnibox: {
      keyword: "jira"
    },
    permissions: ["storage", "tabs"],
    browser_specific_settings: {
      gecko: {
        id: "{df6c8f8c-469a-4c88-8b45-23ff390f1d7d}"
      }
    },
    action: {
      default_title: "Jira Boost - Quick Search",
      default_popup: "popup.html"
    },
    commands: {
      "_execute_action": {
        "suggested_key": {
          "default": "Alt+J",
          "mac": "Alt+J"
        },
        "description": "Open Jira Boost quick search"
      }
    }
  }
})
