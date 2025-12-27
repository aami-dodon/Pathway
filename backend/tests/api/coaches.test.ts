import { describe, it, expect } from 'vitest'
import { apiFetch, createCoachProfile, createUser, loginAsAdmin, randomEmail } from './helpers'

describe('Coach Profiles API', () => {
    it('should fetch coach profiles publicly', async () => {
        const response = await apiFetch('/api/coach-profiles')
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
        expect(Array.isArray(data.docs)).toBe(true)
    })

    it('should filter coach profiles by slug', async () => {
        // Create a coach first to ensure we have one
        const admin = await loginAsAdmin()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user: any = await createUser(randomEmail('coach_slug'), 'password123')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coach: any = await createCoachProfile({
            token: admin.token,
            userId: user.id || user._id,
            displayName: 'Slug Test Coach',
            timezone: 'UTC',
            availability: []
        })

        const slug = (coach as any).slug
        expect(slug).toBeDefined()

        const response = await apiFetch(`/api/coach-profiles?where[slug][equals]=${slug}`)
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.docs.length).toBe(1)
        expect(data.docs[0].id).toBe(coach.id || (coach as any)._id)
    })
})
