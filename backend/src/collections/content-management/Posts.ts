import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrCreator } from '../../access'
import { formatSlug, setPublishedAt } from '../../hooks'

export const Posts: CollectionConfig = {
    slug: 'posts',
    admin: {
        group: 'Content Management',
        useAsTitle: 'title',
        description: 'Blog posts and articles',
        defaultColumns: ['title', 'author', 'status', 'accessLevel', 'updatedAt'],
    },
    versions: {
        drafts: true,
    },
    access: {
        // Read: Based on accessLevel (public vs subscribers) and status
        read: ({ req: { user } }) => {
            // Admins and creators see all
            if (user && ['admin', 'coach', 'creator'].includes(user.role as string)) {
                return true
            }

            // Build query for published content with appropriate access level
            const baseQuery = { status: { equals: 'published' } }

            if (user) {
                // Authenticated users see public + subscriber content
                return {
                    and: [
                        baseQuery,
                        {
                            or: [
                                { accessLevel: { equals: 'public' } },
                                { accessLevel: { equals: 'subscribers' } },
                            ],
                        },
                    ],
                }
            }

            // Anonymous users see all published content (both public and subscribers)
            // BUT: The content field has field-level access that restricts body for subscriber posts
            return baseQuery
        },
        // Create: Admin or creator roles
        create: isAdminOrCreator,
        // Update: Admin or creator roles (could be refined to author-only)
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
            // Field-level access: Subscriber-only content body is hidden from unauthenticated users
            access: {
                read: ({ req: { user }, doc }) => {
                    // Staff can always read
                    if (user && ['admin', 'coach', 'creator'].includes(user.role as string)) {
                        return true
                    }
                    // For subscriber content, require authentication
                    if (doc?.accessLevel === 'subscribers') {
                        return Boolean(user)
                    }
                    // Public content is readable by everyone
                    return true
                },
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
