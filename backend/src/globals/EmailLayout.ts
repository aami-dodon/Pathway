import type { GlobalConfig } from 'payload'

export const EmailLayout: GlobalConfig = {
    slug: 'email-layout',
    admin: {
        group: 'Administration',
    },
    access: {
        read: () => true,
        update: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'headerHTML',
            type: 'textarea',
            admin: {
                description: 'HTML/Text for the header of all emails.',
            },
        },
        {
            name: 'footerHTML',
            type: 'textarea',
            admin: {
                description: 'HTML/Text for the footer of all emails. Use {socialLinks} to insert dynamic social links from Site Settings.',
            },
        },
        {
            name: 'masterTemplate',
            type: 'textarea',
            required: true,
            defaultValue: '<html><body>{header}\n{body}\n{footer}</body></html>',
            admin: {
                description: 'The master HTML structure. Must include {body}, and optionally {header} and {footer}.',
            },
        },
        {
            name: 'logo',
            type: 'relationship',
            relationTo: 'media',
            admin: {
                description: 'Brand logo to be used in emails.',
            },
        },
    ],
}
