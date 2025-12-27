import type { GlobalConfig } from 'payload'

export const BlogPage: GlobalConfig = {
    slug: 'blog-page',
    admin: {
        group: 'Globals',
        description: 'Manage the Blog listing page hero section',
    },
    access: {
        read: () => true,
        update: () => true,
    },
    fields: [
        {
            name: 'hero',
            type: 'group',
            label: 'Hero Section',
            fields: [
                {
                    name: 'badge',
                    type: 'text',
                    required: true,
                    defaultValue: 'Blog',
                    admin: {
                        description: 'Badge text displayed above the title',
                    },
                },
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                    defaultValue: 'Insights from Our Experts',
                    admin: {
                        description: 'Main heading for the blog page',
                    },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                    defaultValue: 'Discover articles, tutorials, and thoughts from our community of coaches and creators.',
                    admin: {
                        description: 'Subtitle/description text',
                    },
                },
            ],
        },
    ],
}
