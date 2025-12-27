import type { CollectionConfig } from 'payload'
import { populateCreatedBy } from '../../hooks'

export const MediaPublic: CollectionConfig = {
    slug: 'media',
    labels: {
        singular: 'Media Public',
        plural: 'Media Public',
    },
    admin: {
        group: 'Administration',
        description: 'Media library for images, videos, and documents',
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    hooks: {
        beforeChange: [populateCreatedBy],
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
            admin: {
                description: 'Alt text for accessibility',
            },
        },
        {
            name: 'createdBy',
            type: 'relationship',
            relationTo: 'users',
            admin: {
                readOnly: true,
                position: 'sidebar',
                description: 'User who uploaded this media',
            },
        },
    ],
    upload: true,
}
