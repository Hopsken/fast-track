const { relative } = require('node:path')

const buildFileList = (files) =>
  files.map((file) => relative(process.cwd(), file)).join(',')
module.exports = {
  '**/*': (files) => {
    const fileList = buildFileList(files)

    return [
      `pnpm exec nx affected --target=format --files=${fileList}`,
      `pnpm exec nx affected --target=lint:fix --files=${fileList}`
    ]
  }
}
