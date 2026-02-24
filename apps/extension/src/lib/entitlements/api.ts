import { boostApi } from '~/lib/api'

export type ExtensionUserDto = {
  id: string
  email: string | null
}

export type ExtensionSubscriptionDto = {
  status: string
  renewsAt: string | null
  endsAt: string | null
  updatedAt: string
}

export type ExchangeLinkCodeResponse = {
  accessToken: string
  refreshToken: string
  user: ExtensionUserDto
  subscription: ExtensionSubscriptionDto | null
  isPro: boolean
}

export type RefreshTokenResponse = {
  accessToken: string
}

export type MeResponse = {
  user: ExtensionUserDto
  subscription: ExtensionSubscriptionDto | null
  isPro: boolean
  checkedAt: string
}

export async function exchangeLinkCode(input: {
  code: string
  extensionId: string
}): Promise<ExchangeLinkCodeResponse> {
  return boostApi
    .post('api/extension/token', {
      json: { code: input.code, extensionId: input.extensionId }
    })
    .json<ExchangeLinkCodeResponse>()
}

export async function refreshAccessToken(input: {
  refreshToken: string
}): Promise<RefreshTokenResponse> {
  return boostApi
    .post('api/extension/token/refresh', {
      json: { refreshToken: input.refreshToken }
    })
    .json<RefreshTokenResponse>()
}

export async function fetchMe(input: {
  accessToken: string
}): Promise<MeResponse> {
  return boostApi
    .get('api/extension/me', {
      headers: { Authorization: `Bearer ${input.accessToken}` }
    })
    .json<MeResponse>()
}
