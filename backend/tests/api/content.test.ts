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

        const expectedPages = ['about', 'contact', 'privacy-policy', 'terms-of-service', 'faq']
        const fetchedSlugs = data.docs.map((doc: any) => doc.slug)

        for (const page of expectedPages) {
            expect(fetchedSlugs).toContain(page)
        }

        // Check structure of one page
        const aboutPage = data.docs.find((doc: any) => doc.slug === 'about')
        expect(aboutPage).toHaveProperty('content')
        // Content should be lexical json usually, check if it has root
        expect(aboutPage.content).toHaveProperty('root')
    })
})
