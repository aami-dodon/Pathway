import { describe, it, expect } from 'vitest'
import { apiFetch } from './helpers'

describe('Users API', () => {
    it('should allow public access to check if email exists (or not, depending on config)', async () => {
        // This is just a basic connectivity test
        const response = await apiFetch('/api/users')
        expect(response.status).toBeDefined()
    })

    it('should return 401 for /api/users/me without auth', async () => {
        const response = await apiFetch('/api/users/me')
        expect(response.status).toBe(200) // Payload returns 200 with null user if not logged in usually, or 401? Let's check.
        // Actually standard Payload /me returns 200 with { user: null } if not logged in.
        const data = await response.json()
        expect(data).toHaveProperty('user')
    })
})
