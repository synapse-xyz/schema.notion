'use server'

import { cookies } from 'next/headers'
import { HARDCODED_USER } from './auth-config'

const SESSION_COOKIE_NAME = 'session'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface User {
  id: string
  email: string
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  // Simple validation against hardcoded user
  if (email === HARDCODED_USER.email && password === HARDCODED_USER.password) {
    // Set session cookie (simple base64 encoded user ID)
    const sessionData = Buffer.from(HARDCODED_USER.id).toString('base64')
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    })

    return { success: true }
  }

  return { success: false, error: 'Invalid email or password' }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)

  if (!session) {
    return null
  }

  try {
    // Decode the base64 session to get user ID
    const userId = Buffer.from(session.value, 'base64').toString('utf-8')
    return userId
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSession()

  if (!userId || userId !== HARDCODED_USER.id) {
    return null
  }

  return {
    id: HARDCODED_USER.id,
    email: HARDCODED_USER.email,
  }
}
