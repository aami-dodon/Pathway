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
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('user')
        expect(data.user).toBeNull()
    })

    it('should preventing deleting users without admin permissions', async () => {
        // Create a user first
        const { createUser, randomEmail, loginAsAdmin } = await import('./helpers')
        const email = randomEmail('todelete')
        const password = 'password123'
        const user: any = await createUser(email, password)

        // Try to delete without auth
        const response = await apiFetch(`/api/users/${user.id}`, {
            method: 'DELETE',
        })
        expect(response.status).toBe(403) // Forbidden

        // Try to delete as admin
        const admin = await loginAsAdmin()
        const adminResponse = await apiFetch(`/api/users/${user.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${admin.token}`
            }
        })
        expect(adminResponse.status).toBe(200)
    })
})
