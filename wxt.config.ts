import { defineConfig } from "wxt"

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  imports: {
    dirs: ["src/storage"]
  },
  manifest: {
    name: "Jira Boost",
    host_permissions: ["https://*.atlassian.net/jira*"],
    omnibox: {
      keyword: "jira"
    },
    permissions: ["storage"],
    browser_specific_settings: {
      gecko: {
        id: "{df6c8f8c-469a-4c88-8b45-23ff390f1d7d}"
      }
    },
    action: {
      default_title: "Jira Boost"
    }
  }
})
