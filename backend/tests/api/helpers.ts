const rawBaseUrl = (process.env.BASE_URL || '').trim()
const derivedPortBase = process.env.PORT ? `http://localhost:${process.env.PORT}` : null
const fallbackBase = derivedPortBase || 'http://localhost:3000'
const normalizedBase = rawBaseUrl && rawBaseUrl.startsWith('http')
    ? rawBaseUrl
    : fallbackBase

// Normalized base URL for API calls in tests
export const BASE_URL = normalizedBase.endsWith('/')
    ? normalizedBase.slice(0, -1)
    : normalizedBase

export const apiFetch = (path: string, init: RequestInit = {}) =>
    fetch(new URL(path, BASE_URL).toString(), init)

const jsonHeaders = (headers: HeadersInit = {}) => ({
    'Content-Type': 'application/json',
    ...headers,
})

type AuthSession = {
    token: string
    user?: any
    cookie?: string
}

export const requireAdminCredentials = () => {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env for API tests')
    }
    return { email, password }
}

export const loginAsAdmin = async (): Promise<AuthSession> => {
    const { email, password } = requireAdminCredentials()
    const response = await apiFetch('/api/users/login', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
    })

    const data = await safeJson(response)
    if (!response.ok || !data?.token) {
        throw new Error(`Admin login failed (${response.status}): ${JSON.stringify(data)}`)
    }

    return {
        token: data.token as string,
        user: data.user,
        cookie: response.headers.get('set-cookie') || '',
    }
}

export const randomEmail = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`

export const createUser = async (email: string, password: string) => {
    const response = await apiFetch('/api/users', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
    })
    const data = await safeJson(response)
    if (!response.ok) {
        throw new Error(`User creation failed (${response.status}): ${JSON.stringify(data)}`)
    }
    return normalizeDoc(data)
}

export const createCoachProfile = async ({
    token,
    userId,
    timezone,
    availability,
    displayName,
}: {
    token: string
    userId: string
    timezone: string
    availability: Array<{ day: string; startTime: string; endTime: string }>
    displayName: string
}) => {
    const response = await apiFetch('/api/coach-profiles', {
        method: 'POST',
        headers: jsonHeaders({
            Authorization: `Bearer ${token}`,
        }),
        body: JSON.stringify({
            user: userId,
            displayName,
            timezone,
            availability,
        }),
    })
    const data = await safeJson(response)
    if (!response.ok) {
        throw new Error(`Coach profile creation failed (${response.status}): ${JSON.stringify(data)}`)
    }
    return normalizeDoc(data)
}

export const createCoachingSession = async ({
    coachId,
    scheduledAt,
    duration = 30,
    bookerEmail,
    bookerName = 'Test Booker',
    sessionTitle = 'Test Session',
}: {
    coachId: string
    scheduledAt: string
    duration?: number
    bookerEmail: string
    bookerName?: string
    sessionTitle?: string
}) => {
    const response = await apiFetch('/api/coaching-sessions', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
            coach: coachId,
            sessionTitle,
            scheduledAt,
            duration,
            bookerName,
            bookerEmail,
        }),
    })
    const data = await safeJson(response)
    if (!response.ok) {
        throw new Error(`Coaching session creation failed (${response.status}): ${JSON.stringify(data)}`)
    }
    return normalizeDoc(data)
}

export const isoDateOnly = (date: Date) => date.toISOString().slice(0, 10)

const safeJson = async (response: Response) => {
    try {
        return await response.json()
    } catch {
        return null
    }
}

const normalizeDoc = <T>(payloadResponse: any): T =>
    payloadResponse?.doc ?? payloadResponse?.user ?? payloadResponse
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../.env')
loadEnv({ path: envPath })

// Fallback parse in case dotenv didn't populate (Vitest + jsdom can reset env between contexts)
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
        if (!line || line.trim().startsWith('#') || !line.includes('=')) continue
        const [key, ...rest] = line.split('=')
        const value = rest.join('=').trim()
        if (!process.env[key] && value) {
            process.env[key] = value
        }
    }
}
