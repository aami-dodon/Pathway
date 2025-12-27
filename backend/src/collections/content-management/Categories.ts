import type { CollectionConfig } from 'payload'
import { formatSlug } from '../../hooks'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        group: 'Content Management',
        useAsTitle: 'name',
        description: 'Content categories for blogs and articles',
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
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
