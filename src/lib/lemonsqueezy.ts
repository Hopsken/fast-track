const LemonSqueezyAPIHost = 'https://api.lemonsqueezy.com'
const LemonSqueezyStoreId = 20105
const LemonSqueezyProductId = 89178

function assertProduct(product: { store_id: number; product_id: number }) {
  const isValid =
    product.store_id === LemonSqueezyStoreId &&
    product.product_id === LemonSqueezyProductId
  if (!isValid) throw new Error('invalid license')
}

export async function activateLicense(key: string, instanceName: string) {
  const response = await fetch(`${LemonSqueezyAPIHost}/v1/licenses/activate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json'
    },
    body: `license_key=${key}&instance_name=${encodeURIComponent(instanceName)}`
  })
  const json = (await response.json()) as {
    activated: boolean
    error: string
  } & LicenseInfo
  assertProduct(json.meta)
  return json
}

export async function validateLicense(key: string, instance: string) {
  const response = await fetch(`${LemonSqueezyAPIHost}/v1/licenses/validate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json'
    },
    body: `license_key=${key}&instance_id=${instance}`
  })
  const json = (await response.json()) as {
    valid: boolean
    error: string
  } & LicenseInfo
  assertProduct(json.meta)
  return json
}

export async function deactivateLicense(key: string, instance: string) {
  const response = await fetch(
    `${LemonSqueezyAPIHost}/v1/licenses/deactivate`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json'
      },
      body: `license_key=${key}&instance_id=${instance}`
    }
  )
  const json = (await response.json()) as {
    deactivated: boolean
    error: string
  } & LicenseInfo
  assertProduct(json.meta)
  return json
}
