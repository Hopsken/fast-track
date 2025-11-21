const buildFileList = (files) => files.join(',')

module.exports = {
  '*.{js,ts,tsx,jsx,json,css,scss,md}': (files) => `pnpm exec nx format:write --files ${buildFileList(files)}`,
  '**/*.{js,ts,tsx,jsx}': (files) => `pnpm exec nx lint --files ${buildFileList(files)}`,
}
