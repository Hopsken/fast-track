declare global {
  type LicenseInfo = {
    instance: {
      id: string
      name: string
    }
    license_key: {
      key: string
      status: string
      activation_usage: number
      activation_limit: number
    }
    meta: {
      customer_email: string
      product_id: number
      store_id: number
    }
  }

  type LicenseState = {
    valid: boolean
    lastChecked: string
  } & LicenseInfo
}

export {}
