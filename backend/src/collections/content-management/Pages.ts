import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrCreator, isPublishedOrAdmin } from '../../access'
import { formatSlug, setPublishedAt } from '../../hooks'

export const Pages: CollectionConfig = {
    slug: 'pages',
    admin: {
        group: 'Content Management',
        useAsTitle: 'title',
        description: 'Static pages for the website',
        defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    },
    versions: {
        drafts: true,
    },
    access: {
        // Read: Published pages are public, drafts visible to admins/creators
        read: isPublishedOrAdmin,
        // Create: Admin or creator roles
        create: isAdminOrCreator,
        // Update: Admin or creator roles
        update: isAdminOrCreator,
        // Delete: Admin only
        delete: isAdmin,
    },
    hooks: {
        beforeChange: [setPublishedAt],
    },
    fields: [
        {
            name: 'title',
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
                description: 'Will be automatically generated from title if left empty.',
            },
            hooks: {
                beforeValidate: [formatSlug('title')],
            },
        },
        // Author references Coach Profile instead of Users
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'coach-profiles',
            hasMany: false,
            admin: {
                description: 'The coach who authored/maintains this page',
            },
        },
        {
            name: 'content',
            type: 'richText',
            required: true,
        },
        // Publishing
        {
            name: 'status',
            type: 'select',
            defaultValue: 'draft',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                position: 'sidebar',
                description: 'Publication date',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        // SEO
        {
            name: 'seo',
            type: 'group',
            admin: {
                description: 'Search engine optimization settings',
            },
            fields: [
                {
                    name: 'metaTitle',
                    type: 'text',
                    admin: {
                        description: 'Title for search engines (defaults to page title)',
                    },
                },
                {
                    name: 'metaDescription',
                    type: 'textarea',
                    admin: {
                        description: 'Description for search engines',
                    },
                },
                {
                    name: 'ogImage',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Open Graph image for social sharing',
                    },
                },
            ],
        },
    ],
}
