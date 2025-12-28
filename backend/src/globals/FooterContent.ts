import type { GlobalConfig } from 'payload'

export const FooterContent: GlobalConfig = {
    slug: 'footer-content',
    admin: {
        group: 'Globals',
        description: 'Manage the footer content and links',
    },
    access: {
        read: () => true,
        update: () => true,
    },
    fields: [
        {
            name: 'description',
            type: 'textarea',
            label: 'Brand Description',
            required: true,
            admin: {
                description: 'Short description displayed under the logo',
            },
        },
        {
            name: 'companyLinks',
            type: 'array',
            label: 'Company Links',
            required: true,
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                    admin: { width: '50%' },
                },
                {
                    name: 'href',
                    type: 'text',
                    required: true,
                    admin: { width: '50%' },
                },
            ],
        },
        {
            name: 'legalLinks',
            type: 'array',
            label: 'Legal Links',
            required: true,
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                    admin: { width: '50%' },
                },
                {
                    name: 'href',
                    type: 'text',
                    required: true,
                    admin: { width: '50%' },
                },
            ],
        },
    ],
}
