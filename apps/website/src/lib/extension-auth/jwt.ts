import { SignJWT, jwtVerify } from 'jose'

export const EXTENSION_ACCESS_TOKEN_TTL_S = 24 * 60 * 60
export const EXTENSION_REFRESH_TOKEN_TTL_S = 180 * 24 * 60 * 60

type TokenType = 'access' | 'refresh'

type CreateTokenArgs = {
  secret: string
  userId: string
  now?: Date
}

type VerifyTokenArgs = {
  secret: string
  token: string
  now?: Date
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

async function createToken({
  secret,
  userId,
  now = new Date(),
  tokenType,
  ttlSeconds
}: CreateTokenArgs & {
  tokenType: TokenType
  ttlSeconds: number
}): Promise<string> {
  const iat = Math.floor(now.getTime() / 1000)
  const exp = iat + ttlSeconds

  return new SignJWT({ token_type: tokenType })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secretKey(secret))
}

async function verifyToken({
  secret,
  token,
  now = new Date(),
  expectedType
}: VerifyTokenArgs & {
  expectedType: TokenType
}): Promise<{ userId: string; tokenType: TokenType }> {
  const { payload } = await jwtVerify(token, secretKey(secret), {
    currentDate: now
  })

  const userId = payload.sub
  if (!userId) throw new Error('missing_sub')

  const tokenType = payload.token_type
  if (tokenType !== expectedType) throw new Error('token_type_mismatch')

  return { userId, tokenType: expectedType }
}

export async function createExtensionAccessToken(
  args: CreateTokenArgs
): Promise<string> {
  return createToken({
    ...args,
    tokenType: 'access',
    ttlSeconds: EXTENSION_ACCESS_TOKEN_TTL_S
  })
}

export async function createExtensionRefreshToken(
  args: CreateTokenArgs
): Promise<string> {
  return createToken({
    ...args,
    tokenType: 'refresh',
    ttlSeconds: EXTENSION_REFRESH_TOKEN_TTL_S
  })
}

export async function verifyExtensionAccessToken(
  args: VerifyTokenArgs
): Promise<{ userId: string }> {
  const { userId } = await verifyToken({ ...args, expectedType: 'access' })
  return { userId }
}

export async function verifyExtensionRefreshToken(
  args: VerifyTokenArgs
): Promise<{ userId: string }> {
  const { userId } = await verifyToken({ ...args, expectedType: 'refresh' })
  return { userId }
}
