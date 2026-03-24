export const CHROME_WEB_STORE_URL =
  'https://chromewebstore.google.com/detail/jira-boost/cmlkcfgkffidbnpbjmlgplokcacfemhp'

export const freeFeatures = [
  'Search Jira faster',
  'Handle common actions faster',
  '3 issue templates per Jira site'
] as const

export const proFeatures = [
  'Unlimited issue templates for repeat work',
  'Use templates across all of your Jira sites',
  'Get every future Pro feature',
  'Support independent development',
  'Cancel anytime'
] as const

export const pricingPlans = [
  {
    description: 'Core speed improvements, free.',
    features: freeFeatures,
    name: 'Free'
  },
  {
    description:
      'Upgrade when issue templates become part of your everyday Jira routine.',
    features: proFeatures,
    name: 'Pro',
    price: '$29',
    priceSuffix: '/ year'
  }
] as const
