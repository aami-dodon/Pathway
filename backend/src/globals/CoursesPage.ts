import type { GlobalConfig } from 'payload'

export const CoursesPage: GlobalConfig = {
    slug: 'courses-page',
    admin: {
        group: 'Globals',
        description: 'Manage the Courses listing page hero section',
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
                    defaultValue: 'Courses',
                    admin: {
                        description: 'Badge text displayed above the title',
                    },
                },
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                    defaultValue: 'Learn New Skills',
                    admin: {
                        description: 'Main heading for the courses page',
                    },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                    defaultValue: 'Explore our catalog of expert-led courses designed to help you grow professionally and personally.',
                    admin: {
                        description: 'Subtitle/description text',
                    },
                },
            ],
        },
    ],
}
