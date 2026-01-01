import type { CollectionConfig } from 'payload'
import { formatSlug, setPublishedAt } from '../../hooks'
import { indexPostAfterChange, deletePostAfterDelete } from '../../hooks/meilisearchHooks'
import { isAdmin, isAdminOrCreator, isAdminOrAuthor, isPublishedOrAdmin } from '../../access'

export const Posts: CollectionConfig = {
    slug: 'posts',
    admin: {
        group: 'Content Management',
        useAsTitle: 'title',
        description: 'Blog posts and articles',
        defaultColumns: ['title', 'author', 'isPublished', 'isSubscriberOnly', 'updatedAt'],
    },
    access: {
        read: isPublishedOrAdmin, // Published = public, drafts = admin only
        create: isAdminOrCreator, // Admin or coach/creator role
        update: isAdminOrAuthor,  // Admin or post author
        delete: isAdmin,          // Only admins
    },
    hooks: {
        beforeChange: [setPublishedAt],
        afterChange: [indexPostAfterChange],
        afterDelete: [deletePostAfterDelete],
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
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Featured image for the post',
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
                read: ({ req, data }) => {
                    // If it's not a subscriber-only post, anyone can read it
                    if (!data?.isSubscriberOnly) return true;

                    // If it is subscriber-only, require a logged-in user
                    return !!req.user;
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
            name: 'isSubscriberOnly',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Restrict this post to subscribers only',
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
                        description: 'Open Graph image for social sharing',
                    },
                },
            ],
        },
    ],
}
