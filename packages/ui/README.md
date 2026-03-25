# ui

This library lives inside the Turborepo workspace.

## Adding Shadcn Components

Install new shared components from this package root so generated files land in `packages/ui/src/components`.

`pnpm dlx shadcn@latest add accordion`

## Running unit tests

Run `pnpm turbo run test --filter=@internal/ui` to execute the unit tests via [Vitest](https://vitest.dev/) when tests are available.
