import { describe, it, expect } from 'vitest'
import { apiFetch } from './helpers'

describe('Content API', () => {
    it('should fetch posts publicly', async () => {
        const response = await apiFetch('/api/posts')
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
        expect(Array.isArray(data.docs)).toBe(true)
    })

    it('should fetch pages publicly', async () => {
        const response = await apiFetch('/api/pages')
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data).toHaveProperty('docs')
        expect(Array.isArray(data.docs)).toBe(true)
    })
})
