import type { CollectionConfig } from 'payload'

export const EmailTemplates: CollectionConfig = {
    slug: 'email-templates',
    admin: {
        useAsTitle: 'name',
        group: 'Administration',
        defaultColumns: ['name', 'slug', 'subject', 'updatedAt'],
    },
    access: {
        read: ({ req: { user } }) => !!user,
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
        delete: ({ req: { user } }) => user?.role === 'admin',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            admin: {
                description: 'Descriptive name for the notification',
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                description: 'Unique identifier used in code (e.g., booking-confirmation)',
            },
        },
        {
            name: 'subject',
            type: 'text',
            required: true,
            admin: {
                description: 'Email subject line. Can use placeholders like {name}',
            },
        },
        {
            name: 'body',
            type: 'textarea',
            required: true,
            admin: {
                description: 'Email body content. Use {body} in the master template to place this. Can use placeholders.',
            },
        },
        {
            name: 'placeholders',
            type: 'array',
            admin: {
                description: 'Reference list of placeholders available for this template',
                readOnly: true,
            },
            fields: [
                {
                    name: 'key',
                    type: 'text',
                },
                {
                    name: 'description',
                    type: 'text',
                }
            ]
        }
    ],
}
