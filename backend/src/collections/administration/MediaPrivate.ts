import type { CollectionConfig } from 'payload'
import { populateCreatedBy } from '../../hooks'

export const MediaPrivate: CollectionConfig = {
    slug: 'media-private',
    labels: {
        singular: 'Media Private',
        plural: 'Media Private',
    },
    admin: {
        group: 'Administration',
        description: 'Private media library served via signed URLs',
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
