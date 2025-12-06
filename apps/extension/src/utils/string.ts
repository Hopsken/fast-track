export const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    // eslint-disable-next-line sonarjs/slow-regex, sonarjs/anchor-precedence
    .replace(/^-+|-+$/g, '')
