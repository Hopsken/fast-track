export const CHROME_WEB_STORE_URL =
  'https://chromewebstore.google.com/detail/jira-boost/cmlkcfgkffidbnpbjmlgplokcacfemhp'

export const freeFeatures = [
  'Search Jira from the address bar',
  'Automate common workflow actions',
  'Up to 3 issue templates per Jira site'
] as const

export const proFeatures = [
  'Unlimited issue templates',
  'Sync (coming soon)',
  'All future Pro features',
  'Support development',
  'Cancel anytime'
] as const

export const pricingPlans = [
  {
    description: 'Use the core Fast Track workflow for free.',
    features: freeFeatures,
    name: 'Free'
  },
  {
    description: 'Remove the template limit and unlock every Pro feature.',
    features: proFeatures,
    name: 'Pro',
    price: '$29',
    priceSuffix: '/ year'
  }
] as const
