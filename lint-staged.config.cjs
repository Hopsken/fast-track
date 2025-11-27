module.exports = {
  '**/*': () => {
    return ['turbo run typecheck lint:fix']
  }
}
