import { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

export const HomePage: GlobalConfig = {
    slug: 'home-page',
    label: 'Home Page',
    admin: {
        group: 'Globals',
    },
    access: {
        read: () => true,
        update: isAdmin,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Hero Section',
                    fields: [
                        {
                            name: 'hero',
                            type: 'group',
                            fields: [
                                {
                                    name: 'badge',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'title',
                                    type: 'text',
                                    required: true,
                                },
                                {
                                    name: 'highlightedText',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'description',
                                    type: 'textarea',
                                    required: true,
                                },
                                {
                                    name: 'primaryButtonText',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'primaryButtonLink',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'secondaryButtonText',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'secondaryButtonLink',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                            ]
                        }
                    ]
                },
                {
                    label: 'Stats Section',
                    fields: [
                        {
                            name: 'stats',
                            type: 'array',
                            minRows: 1,
                            maxRows: 4,
                            fields: [
                                {
                                    name: 'value',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'label',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                            ]
                        }
                    ]
                },
                {
                    label: 'Features Section',
                    fields: [
                        {
                            name: 'featuresHeader',
                            type: 'group',
                            fields: [
                                {
                                    name: 'badge',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'title',
                                    type: 'text',
                                    required: true,
                                },
                                {
                                    name: 'description',
                                    type: 'textarea',
                                    required: true,
                                },
                            ]
                        },
                        {
                            name: 'features',
                            type: 'array',
                            minRows: 1,
                            fields: [
                                {
                                    name: 'icon',
                                    type: 'select',
                                    options: [
                                        { label: 'BookOpen', value: 'BookOpen' },
                                        { label: 'Users', value: 'Users' },
                                        { label: 'Sparkles', value: 'Sparkles' },
                                        { label: 'GraduationCap', value: 'GraduationCap' },
                                    ],
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'title',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'description',
                                    type: 'textarea',
                                    required: true,
                                },
                            ]
                        }
                    ]
                },
                {
                    label: 'Testimonials Section',
                    fields: [
                        {
                            name: 'testimonialsHeader',
                            type: 'group',
                            fields: [
                                {
                                    name: 'badge',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'title',
                                    type: 'text',
                                    required: true,
                                },
                            ]
                        },
                        {
                            name: 'reviews',
                            type: 'array',
                            minRows: 1,
                            fields: [
                                {
                                    name: 'name',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'role',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'content',
                                    type: 'textarea',
                                    required: true,
                                },
                                {
                                    name: 'avatar',
                                    type: 'text',
                                    label: 'Avatar Initials',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                            ]
                        }
                    ]
                },
                {
                    label: 'CTA Section',
                    fields: [
                        {
                            name: 'cta',
                            type: 'group',
                            fields: [
                                {
                                    name: 'title',
                                    type: 'text',
                                    required: true,
                                },
                                {
                                    name: 'description',
                                    type: 'textarea',
                                    required: true,
                                },
                                {
                                    name: 'buttonText',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'buttonLink',
                                    type: 'text',
                                    required: true,
                                    admin: { width: '50%' }
                                },
                                {
                                    name: 'benefits',
                                    type: 'array',
                                    fields: [
                                        {
                                            name: 'text',
                                            type: 'text',
                                            required: true,
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
