import { describe, it, expect } from 'vitest'
import { apiFetch } from './helpers'

describe('Email Delivery Integration', () => {
    it('should trigger live emails when a contact form is submitted', async () => {
        const testEmail = process.env.ADMIN_EMAIL || 'test@example.com'

        console.log(`🧪 Triggering live email delivery test to: ${testEmail}`)

        const response = await apiFetch('/api/contact-submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'Delivery',
                email: testEmail,
                message: 'This is an automated test of the live email delivery system.',
            }),
        })

        expect(response.status).toBe(201)
        const data = await response.json()
        expect(data.doc).toBeDefined()
        expect(data.doc.email).toBe(testEmail)

        console.log('✅ Contact submission created, hooks triggered.')
    }, 30000) // 30s timeout for live SMTP
})
