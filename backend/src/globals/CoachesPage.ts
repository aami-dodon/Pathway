import type { GlobalConfig } from 'payload'

export const CoachesPage: GlobalConfig = {
    slug: 'coaches-page',
    admin: {
        group: 'Globals',
        description: 'Manage the Coaches listing page hero section',
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
                    defaultValue: 'Our Coaches',
                    admin: {
                        description: 'Badge text displayed above the title',
                    },
                },
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                    defaultValue: 'Learn from the Best',
                    admin: {
                        description: 'Main heading for the coaches page',
                    },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                    defaultValue: 'Connect with experienced professionals ready to guide your journey to success.',
                    admin: {
                        description: 'Subtitle/description text',
                    },
                },
            ],
        },
    ],
}
