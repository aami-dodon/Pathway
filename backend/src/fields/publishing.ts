import type { Field } from 'payload'

/**
 * Status field for publishable content
 * Used for: Posts, Pages, Courses
 */
export const publishStatusField: Field = {
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
        description: 'Content visibility status',
    },
}

/**
 * Published at timestamp field
 */
export const publishedAtField: Field = {
    name: 'publishedAt',
    type: 'date',
    admin: {
        position: 'sidebar',
        description: 'Publication date (auto-set on first publish)',
        date: {
            pickerAppearance: 'dayAndTime',
        },
    },
}

/**
 * Access level field for subscriber gating
 * Used for: Posts, Courses
 */
export const accessLevelField: Field = {
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
        description: 'Who can access this content',
    },
}
