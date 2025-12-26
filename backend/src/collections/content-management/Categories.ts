import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrCreator } from '../../access'
import { formatSlug } from '../../hooks'

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
            required: false,
            unique: true,
            index: true,
            admin: {
                description: 'Will be automatically generated from name if left empty.',
            },
            hooks: {
                beforeValidate: [formatSlug('name')],
            },
        },
        {
            name: 'description',
            type: 'textarea',
        },
    ],
}
