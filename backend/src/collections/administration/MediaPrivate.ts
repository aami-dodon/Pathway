import type { CollectionConfig } from 'payload'
import { isAuthenticated, isAdmin, isAdminOrOwner } from '../../access'
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
        // Read: Owner or admin can view private media
        read: isAdminOrOwner('createdBy'),
        // Create: Only authenticated users can upload
        create: isAuthenticated,
        // Update: Owner or admin can update
        update: isAdminOrOwner('createdBy'),
        // Delete: Only admins can delete media
        delete: isAdmin,
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
