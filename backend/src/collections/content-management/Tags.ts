import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isAdminOrCreator } from '../../access'
import { formatSlug } from '../../hooks'

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
    ],
}
