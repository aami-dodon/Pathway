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
     * Fetch template and master layout, render, and send email
     */
    static async send(payload: Payload, options: EmailOptions): Promise<boolean> {
        try {
            // 1. Fetch the specific template
            const templateResult = await payload.find({
                collection: 'email-templates',
                where: {
                    slug: { equals: options.templateSlug },
                },
                limit: 1,
            })

            if (templateResult.docs.length === 0) {
                console.error(`Email template with slug "${options.templateSlug}" not found.`)
                return false
            }

            const template = templateResult.docs[0]

            // 2. Fetch the master layout and site settings
            const [layout, siteSettings] = await Promise.all([
                payload.findGlobal({
                    slug: 'email-layout',
                    depth: 1, // Ensure the logo media is populated
                }),
                payload.findGlobal({
                    slug: 'site-settings',
                })
            ])

            // 3. Render content (subject and body)
            const renderedSubject = options.subject || this.replacePlaceholders(template.subject, options.data)
            const renderedBody = this.replacePlaceholders(template.body, options.data)

            // 4. Handle Social Links Dynamic Rendering
            let socialLinksHTML = ''
            if (siteSettings.socialLinks) {
                const links = []
                const socialPlatforms = [
                    { key: 'facebook', label: 'Facebook', icon: 'facebook-new' },
                    { key: 'instagram', label: 'Instagram', icon: 'instagram-new' },
                    { key: 'twitter', label: 'Twitter', icon: 'twitterx' },
                    { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
                    { key: 'youtube', label: 'YouTube', icon: 'youtube-play' },
                    { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
                    { key: 'threads', label: 'Threads', icon: 'threads' },
                    { key: 'github', label: 'GitHub', icon: 'github' },
                    { key: 'discord', label: 'Discord', icon: 'discord-project' },
                    { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
                    { key: 'telegram', label: 'Telegram', icon: 'telegram-app' },
                ]

                const iconColor = '71717b' // Muted foreground color from theme
                for (const platform of socialPlatforms) {
                    const url = (siteSettings.socialLinks as any)[platform.key]
                    if (url && url !== '#') {
                        const iconUrl = `https://img.icons8.com/ios-filled/24/${iconColor}/${platform.icon}.png`
                        links.push(`<a href="${url}" style="margin: 0 8px; display: inline-block; vertical-align: middle;"><img src="${iconUrl}" alt="${platform.label}" width="24" height="24" style="display: block; border: 0;"></a>`)
                    }
                }

                if (links.length > 0) {
                    socialLinksHTML = `<div style="margin: 16px 0;">${links.join(' ')}</div>`
                }
            }

            // 5. Handle Logo Dynamic Rendering
            let logoHTML = ''
            if (layout.logo && typeof layout.logo === 'object' && 'url' in layout.logo) {
                const logoUrl = layout.logo.url
                const absoluteLogoUrl = logoUrl?.startsWith('http')
                    ? logoUrl
                    : `${process.env.FRONTEND_URL || 'http://localhost:3000'}${logoUrl}`

                logoHTML = `<img src="${absoluteLogoUrl}" alt="Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;">`
            }

            // 6. Wrap body in master layout
            let finalHtml = layout.masterTemplate || '<html><body>{header}\n{body}\n{footer}</body></html>'

            // Replace header/footer first, then custom placeholders
            let headerWithLogo = (layout.headerHTML || '').replace('{logo}', logoHTML)
            // If {logo} wasn't in headerHTML but logo exists, prepend it if headerHTML is empty or doesn't have it
            if (logoHTML && !headerWithLogo.includes(logoHTML) && !layout.headerHTML?.includes('{logo}')) {
                headerWithLogo = logoHTML + headerWithLogo
            }

            let footerWithSocial = (layout.footerHTML || '').replace('{socialLinks}', socialLinksHTML)
            // If {socialLinks} wasn't in footerHTML but links exist, append it if footerHTML is empty or doesn't have it
            if (socialLinksHTML && !footerWithSocial.includes(socialLinksHTML) && !layout.footerHTML?.includes('{socialLinks}')) {
                footerWithSocial = footerWithSocial + socialLinksHTML
            }

            finalHtml = finalHtml.replace('{body}', renderedBody)
            finalHtml = finalHtml.replace('{header}', headerWithLogo)
            finalHtml = finalHtml.replace('{footer}', footerWithSocial)

            // 6. Send via Payload's email adapter
            await payload.sendEmail({
                to: options.to,
                subject: renderedSubject,
                html: finalHtml,
                fromName: options.fromName,
                fromAddress: options.fromAddress || process.env.EMAIL_FROM,
            })

            return true
        } catch (error) {
            console.error('Failed to send email:', error)
            return false
        }
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

