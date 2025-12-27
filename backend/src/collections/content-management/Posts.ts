import type { CollectionConfig } from 'payload'
import { formatSlug, setPublishedAt } from '../../hooks'

export const Posts: CollectionConfig = {
    slug: 'posts',
    admin: {
        group: 'Content Management',
        useAsTitle: 'title',
        description: 'Blog posts and articles',
        defaultColumns: ['title', 'author', 'isPublished', 'accessLevel', 'updatedAt'],
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
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
            required: true,
            hasMany: false,
            admin: {
                description: 'The coach who authored this post',
            },
        },
        // Featured image - uses public or private media based on access level
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Featured image for the post (public media)',
                condition: (data) => data?.accessLevel !== 'subscribers',
            },
        },
        {
            name: 'featuredImagePrivate',
            type: 'upload',
            relationTo: 'media-private',
            admin: {
                description: 'Featured image for the post (private media for subscribers)',
                condition: (data) => data?.accessLevel === 'subscribers',
            },
        },
        {
            name: 'excerpt',
            type: 'textarea',
            admin: {
                description: 'Short summary shown in post listings',
            },
        },
        {
            name: 'content',
            type: 'richText',
            required: true,
            access: {
                read: () => true,
            },
        },
        // Categorization
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: false,
        },
        {
            name: 'tags',
            type: 'relationship',
            relationTo: 'tags',
            hasMany: true,
        },
        // Access Control
        {
            name: 'accessLevel',
            type: 'select',
            required: true,
            defaultValue: 'public',
            options: [
                { label: 'Free / Public', value: 'public' },
                { label: 'Subscribers Only', value: 'subscribers' },
            ],
            admin: {
                position: 'sidebar',
                description: 'Who can view this content',
            },
        },
        // Publishing
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                position: 'sidebar',
                description: 'Publication date for the post',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'isPublished',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Whether this post is visible to the public (or subscribers if set)',
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
                        description: 'Title for search engines (defaults to post title)',
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
                        description: 'Open Graph image for social sharing (public)',
                        condition: (data) => data?.accessLevel !== 'subscribers',
                    },
                },
                {
                    name: 'ogImagePrivate',
                    type: 'upload',
                    relationTo: 'media-private',
                    admin: {
                        description: 'Open Graph image for social sharing (private)',
                        condition: (data) => data?.accessLevel === 'subscribers',
                    },
                },
            ],
        },
    ],
}
