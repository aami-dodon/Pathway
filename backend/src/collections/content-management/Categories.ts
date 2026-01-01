import type { CollectionConfig } from 'payload'
import { formatSlug } from '../../hooks'
import { isAdmin, isAdminOrCreator } from '../../access'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        group: 'Content Management',
        useAsTitle: 'name',
        description: 'Content categories for blogs and articles',
        defaultColumns: ['name', 'slug', 'isPublished', 'updatedAt'],
    },
    access: {
        read: () => true,         // Public for filtering
        create: isAdminOrCreator, // Admin or coach/creator
        update: isAdminOrCreator, // Admin or coach/creator
        delete: isAdmin,          // Only admins
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
        {
            name: 'isPublished',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                position: 'sidebar',
                description: 'Whether this category is active and visible',
            },
        },
    ],
}
