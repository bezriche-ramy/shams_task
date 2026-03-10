import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'

type TokenPayload = {
  email: string
  role: string
  exp: number
}

const PASSWORD_PREFIX = 'scrypt'
const TOKEN_TTL_SECONDS = 60 * 60 * 12

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return Buffer.from(`${normalized}${padding}`, 'base64')
}

function getTokenSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET

  if (!secret) {
    throw new Error('Missing required environment variable: AUTH_TOKEN_SECRET')
  }

  return secret
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64')
  const derivedKey = scryptSync(password, salt, 64).toString('base64')
  return `${PASSWORD_PREFIX}$${salt}$${derivedKey}`
}

export function verifyPassword(password: string, storedValue: string) {
  if (!storedValue.startsWith(`${PASSWORD_PREFIX}$`)) {
    return password === storedValue
  }

  const [, salt, expectedHash] = storedValue.split('$')

  if (!salt || !expectedHash) {
    return false
  }

  const actualHash = scryptSync(password, salt, 64)
  const expectedBuffer = Buffer.from(expectedHash, 'base64')

  if (actualHash.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(actualHash, expectedBuffer)
}

export function signAuthToken(email: string, role: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    } satisfies TokenPayload),
  )
  const signature = createHmac('sha256', getTokenSecret())
    .update(`${header}.${payload}`)
    .digest()

  return `${header}.${payload}.${base64UrlEncode(signature)}`
}

export function verifyAuthToken(token: string) {
  const [header, payload, signature] = token.split('.')

  if (!header || !payload || !signature) {
    return null
  }

  const expectedSignature = createHmac('sha256', getTokenSecret())
    .update(`${header}.${payload}`)
    .digest()
  const providedSignature = base64UrlDecode(signature)

  if (expectedSignature.length !== providedSignature.length) {
    return null
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null
  }

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload).toString('utf8')) as TokenPayload

    if (parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return parsedPayload
  } catch {
    return null
  }
}
