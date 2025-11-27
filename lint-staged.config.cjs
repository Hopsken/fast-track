module.exports = {
  '**/*': () => {
    return [
      'pnpm format',
      'pnpm lint:fix',
      'pnpm typecheck'
    ]
  }
}
