# Fast Track for Jira

A browser extension that gets you to the right Jira issue fast. Search issues from the popup, act on them without opening Jira, and turn repeat tickets into one-step templates.

Fast Track is free. [Install it from the Chrome Web Store](https://chromewebstore.google.com/detail/fast-track-for-jira/cmlkcfgkffidbnpbjmlgplokcacfemhp) or learn more at [fast-track.work](https://fast-track.work).

## Repository layout

This is a Turborepo + pnpm monorepo.

| Path             | What it is                                                         |
| ---------------- | ------------------------------------------------------------------ |
| `apps/extension` | The browser extension (WXT, React)                                 |
| `apps/website`   | fast-track.work (Next.js): landing page and the Jira OAuth relay   |
| `packages/ui`    | Shared shadcn/ui components                                        |
| `packages/*`     | Shared ESLint, TypeScript and Tailwind configs, and a small logger |

The website keeps no database and no user accounts. Its only server code is the Jira OAuth relay, which holds the OAuth client secret that Jira requires for the token exchange.

## Development

Requires Node.js 22 and pnpm 9.

```bash
pnpm install
pnpm dev:extension   # Extension dev build (Chromium)
pnpm dev:website     # Website on http://localhost:4000
```

To sign in with Jira OAuth in development, create an OAuth 2.0 (3LO) app in the [Atlassian developer console](https://developer.atlassian.com/console/myapps/), set its callback URL to `http://localhost:4000/auth/jira/callback`, and copy `apps/website/.env.example` to `apps/website/.env.local` with your app's credentials. Signing in with a Jira API token works without the website.

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Contributing

Bug reports and feature requests are welcome in [Issues](https://github.com/Hopsken/fast-track/issues). Pull requests are not accepted at this time.

## License

Fast Track is source-available under the [Functional Source License, Version 1.1, MIT Future License](LICENSE) (FSL-1.1-MIT).

In short: you can read, modify, and use the code for any purpose except offering a product or service that competes with Fast Track. Each release becomes available under the MIT license two years after it is published.

The license covers the code only. The Fast Track name, logo, and icons are not licensed for use in your own products or store listings.

Third-party agent skills under `.agents/skills/` remain under their original authors' licenses.
