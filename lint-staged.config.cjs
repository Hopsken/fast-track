module.exports = {
  '**/*': () => {
    return ['turbo typecheck', 'turbo lint:fix']
  }
}
