import type { CollectionConfig } from 'payload'

export const NewsletterSubscribers: CollectionConfig = {
    slug: 'newsletter-subscribers',
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'active', 'createdAt'],
        group: 'Form Submissions',
    },
    access: {
        create: () => true, // Anyone can subscribe
        read: ({ req: { user } }) => !!user, // Only logged-in users (admins) can read
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
    },
    fields: [
        {
            name: 'email',
            type: 'email',
            required: true,
            unique: true,
        },
        {
            name: 'active',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                description: 'Whether this subscriber is actively receiving emails',
            },
        },
    ],
    timestamps: true,
}
