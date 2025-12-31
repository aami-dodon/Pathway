import { Payload } from 'payload'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY)
    }
    return _resend
}


export interface EmailOptions {
    to: string
    subject?: string
    templateSlug: string
    data: Record<string, any>
    fromName?: string
    fromAddress?: string
    attachments?: {
        filename: string
        content?: string | Buffer
        path?: string
        contentType?: string
        encoding?: string
    }[]
}

export class EmailService {
    /**
     * Replace placeholders in a string
     */
    private static replacePlaceholders(text: string, data: Record<string, any>): string {
        return text.replace(/{(\w+)}/g, (match, key) => {
            return data[key] !== undefined ? String(data[key]) : match
        })
    }

    /**
     * Send an email using Resend Transactional Templates
     */
    static async send(payload: Payload, options: {
        to: string
        templateSlug: string
        data: Record<string, any>
        subject?: string // Optional override
        fromName?: string
        fromAddress?: string
        attachments?: any[]
    }): Promise<boolean> {
        try {
            // Prepare Data for Resend - templates now have hardcoded layout
            const templateData = {
                ...options.data,
            }

            // 4. Resolve Template ID from Slug
            const templateId = await this.getTemplateId(options.templateSlug)
            if (!templateId) {
                console.error(`Failed to resolve template ID for slug: ${options.templateSlug}`)
                return false
            }

            const emailPayload = {
                from: options.fromName ? `${options.fromName} <${options.fromAddress || process.env.EMAIL_FROM}>` : `Pathway <${process.env.EMAIL_FROM}>`,
                to: [options.to],
                template: {
                    id: templateId,
                    variables: templateData  // Resend API expects variables INSIDE template object
                },
                subject: options.subject,
                attachments: options.attachments,
            }

            const { data, error } = await getResend().post('/emails', emailPayload) as any

            if (error) {
                console.error('Failed to send email via Resend Template:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Failed to send email:', error)
            return false
        }
    }

    private static _templateCache = new Map<string, string>()

    private static async getTemplateId(slug: string): Promise<string | null> {
        if (this._templateCache.has(slug)) {
            return this._templateCache.get(slug)!
        }

        try {
            // Try increasing limit to ensure we get all templates
            // Note: If resend.get just calls fetch(url), query params work.
            const listResponse = await getResend().get('/templates') as any // potentially add ?limit=100 but verify API support?
            // Actually, Resend uses pagination via cursor (after/before), not limit > 10 always? 
            // Docs say "limit" is allowed.

            let templates: any[] = []
            // Handle response structure inconsistencies
            if (listResponse && listResponse.data && Array.isArray(listResponse.data.data)) {
                templates = listResponse.data.data
            } else if (listResponse && Array.isArray(listResponse.data)) {
                templates = listResponse.data
            } else if (Array.isArray(listResponse)) {
                templates = listResponse
            }

            // Console log the names found for debugging
            // console.log('Resolved Available Templates:', templates.map(t => t.name).join(', '))

            for (const t of templates) {
                // Determine name/slug from the template object
                // We named them using the slug
                if (t.name === slug) {
                    this._templateCache.set(slug, t.id)
                    return t.id
                }
            }

            console.error(`Template "${slug}" not found in list of ${templates.length} templates:`, templates.map((t: any) => t.name).join(', '))
        } catch (error) {
            console.error('Error fetching templates from Resend:', error)
        }
        return null
    }

    /**
     * Send batch emails using Resend SDK directly
     */
    static async sendBatch(emails: { to: string; subject: string; html: string; from?: string }[]): Promise<boolean> {
        try {
            const batch = emails.map(email => ({
                from: email.from || `Anirban <${process.env.EMAIL_FROM}>`,
                to: [email.to],
                subject: email.subject,
                html: email.html,
            }))

            const { data, error } = await getResend().batch.send(batch)

            if (error) {
                console.error('Resend batch send error:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Failed to send batch emails:', error)
            return false
        }
    }
}

