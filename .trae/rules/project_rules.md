## MCP

Always use context7 when i need code generation, setup or configuration steps, or library / API documentations. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask you to do so.

Use these known libraries in the following:

- Wxt: `/wxt-dev/wxt`
- RxJS: `/reactivex/rxjs`
- Zustand: `/pmndrs/zustand`
- Jira.js: `/mrrefactoring/jira.js`
- WebExt Core: `/aklinker1/webext-core` for messaging and proxy service

## Project rules

Don't run wxt dev command to check build, use wxt build instead.

Don't run any `dev` command, ask the user to run them. To validate implementation, run eslint commands first, then run typescript typecheck making sure everything is correct.
