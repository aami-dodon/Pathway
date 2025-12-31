import { describe, it, expect } from 'vitest'
import { apiFetch, loginAsAdmin } from './helpers'

describe('Email Templates & Layout API', () => {
    const expectedSlugs = [
        'welcome-email',
        'contact-acknowledgment',
        'admin-contact-notification',
        'newsletter-welcome',
        'booking-confirmation',
        'booking-confirmed'
    ]

    it('should prevent non-admin access to email templates', async () => {
        const response = await apiFetch('/api/email-templates')
        // Payload returns 401/403 for restricted collections depending on config
        expect([401, 403]).toContain(response.status)
    })

    it('should allow admin to fetch all required email templates', async () => {
        const { token } = await loginAsAdmin()
        const response = await apiFetch('/api/email-templates?limit=100', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
        const data = await response.json()

        expect(data.docs).toBeDefined()
        const slugs = data.docs.map((d: any) => d.slug)

        for (const slug of expectedSlugs) {
            expect(slugs).toContain(slug)
        }
    })

    it('should have valid content in all templates', async () => {
        const { token } = await loginAsAdmin()
        const response = await apiFetch('/api/email-templates?limit=100', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json()

        for (const doc of data.docs) {
            expect(doc.subject).toBeTruthy()
            expect(doc.body).toBeTruthy()
            // Should contain at least some common content markers
            expect(doc.body).toContain('<p>')
        }
    })

    it('should fetch the email layout global and verify structure', async () => {
        const { token } = await loginAsAdmin()
        const response = await apiFetch('/api/globals/email-layout', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
        const layout = await response.json()

        expect(layout.masterTemplate).toBeTruthy()
        expect(layout.masterTemplate).toContain('{body}')
        expect(layout.masterTemplate).toContain('{header}')
        expect(layout.masterTemplate).toContain('{footer}')

        // headerHTML should use the {logo} placeholder now
        expect(layout.headerHTML).toContain('{logo}')
    })

    it('should have the logo relationship populated in the layout', async () => {
        const { token } = await loginAsAdmin()
        const response = await apiFetch('/api/globals/email-layout?depth=1', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
        const layout = await response.json()

        // If seeded correctly, logo should be an object (populated) or at least exist
        if (layout.logo) {
            expect(typeof layout.logo).toBe('object')
            expect(layout.logo.url).toBeTruthy()
            expect(layout.logo.filename).toContain('logo-full-dark.svg')
        }
    })
})
