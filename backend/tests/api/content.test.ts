import { describe, it, expect } from 'vitest'

const BASE_URL = 'http://localhost:3000'

describe('Content API', () => {
    it('should fetch posts publicly', async () => {
        const response = await fetch(`${BASE_URL}/api/posts`)
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
        expect(Array.isArray(data.docs)).toBe(true)
    })

    it('should fetch pages publicly', async () => {
        const response = await fetch(`${BASE_URL}/api/pages`)
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
        expect(Array.isArray(data.docs)).toBe(true)
    })
})
