module.exports = {
  '**/*': () => {
    return [
      `pnpm exec nx affected --target=format`,
      `pnpm exec nx affected --target=lint:fix`
    ]
  }
}
