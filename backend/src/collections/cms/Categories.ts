import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrCreator } from '../../access'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        group: 'Content Management',
        useAsTitle: 'name',
        description: 'Content categories for blogs and articles',
    },
    access: {
        // Read: Public - categories are used for filtering
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
                description: 'URL-friendly identifier for the category',
            },
        },
        {
            name: 'description',
            type: 'textarea',
        },
    ],
}
