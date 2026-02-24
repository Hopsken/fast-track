import ky from 'ky'

export const BOOST_WEBSITE_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000'
  : 'https://teamusement.com'

export const boostApi = ky.extend({
  prefixUrl: BOOST_WEBSITE_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
