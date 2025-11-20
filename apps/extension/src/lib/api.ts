import ky from 'ky'

const baseUrl = import.meta.env.DEV
  ? 'http://localhost:4000'
  : 'https://teamusement.com'

export const boostApi = ky.extend({
  prefixUrl: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
