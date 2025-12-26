import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrCreator } from '../../access'

export const Tags: CollectionConfig = {
    slug: 'tags',
    admin: {
        group: 'Content Management',
        useAsTitle: 'name',
        description: 'Tags for content classification and discovery',
    },
    access: {
        // Read: Public - tags are used for filtering
        read: anyone,
        // Create: Admin or creator roles
        create: isAdminOrCreator,
        // Update: Admin or creator roles
        update: isAdminOrCreator,
        // Delete: Admin only (to prevent orphaned content)
        delete: isAdmin,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'URL-friendly identifier for the tag',
            },
        },
    ],
}
