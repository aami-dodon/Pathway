import type { Field } from 'payload'

/**
 * Reusable SEO fields group for content pages
 */
export const seoFields: Field = {
    name: 'seo',
    type: 'group',
    admin: {
        description: 'Search engine optimization settings',
    },
    fields: [
        {
            name: 'metaTitle',
            type: 'text',
            admin: {
                description: 'Title for search engines (defaults to content title)',
            },
        },
        {
            name: 'metaDescription',
            type: 'textarea',
            admin: {
                description: 'Description for search engines (150-160 characters recommended)',
            },
        },
        {
            name: 'ogImage',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Open Graph image for social sharing (1200x630 recommended)',
            },
        },
    ],
}
