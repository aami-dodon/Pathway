import type { CollectionConfig } from 'payload'
import { anyone, isAuthenticated, isAdmin, isAdminOrOwner } from '../../access'
import { populateCreatedBy } from '../../hooks'

export const Media: CollectionConfig = {
    slug: 'media',
    admin: {
        group: 'Administration',
        description: 'Media library for images, videos, and documents',
    },
    access: {
        // Read: Public - all media is publicly accessible
        read: anyone,
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
