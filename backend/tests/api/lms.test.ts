import { describe, it, expect } from 'vitest'
import { apiFetch } from './helpers'

describe('LMS API', () => {
    it('should fetch courses', async () => {
        const response = await apiFetch('/api/courses')
        // Depending on access control, this might differ. 
        // Assuming public access or at least reachable endpoint.
        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
    })
})
