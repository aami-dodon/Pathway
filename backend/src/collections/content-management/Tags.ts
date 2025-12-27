import type { CollectionConfig } from 'payload'
import { formatSlug } from '../../hooks'

export const Tags: CollectionConfig = {
    slug: 'tags',
    admin: {
        group: 'Content Management',
        useAsTitle: 'name',
        description: 'Tags for content classification and discovery',
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
    ],
}
