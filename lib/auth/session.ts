import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'admin_session'
const ALG = 'HS256'
const MAX_AGE_SECONDS = 60 * 60 * 24 // 1 día

export type AdminSessionPayload = {
  uid: number
  rid: number
}

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET no está definido')
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ uid: payload.uid, rid: payload.rid })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] })
    if (typeof payload.uid !== 'number' || typeof payload.rid !== 'number') return null
    return { uid: payload.uid, rid: payload.rid }
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

export async function getSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}
