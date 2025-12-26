import { describe, it, expect } from 'vitest'

const BASE_URL = 'http://localhost:3000'

describe('LMS API', () => {
    it('should fetch courses', async () => {
        const response = await fetch(`${BASE_URL}/api/courses`)
        // Depending on access control, this might differ. 
        // Assuming public access or at least reachable endpoint.
        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
    })
})
