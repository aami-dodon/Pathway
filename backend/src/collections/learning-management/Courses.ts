import type { CollectionConfig } from 'payload'
import { formatSlug, setPublishedAt } from '../../hooks'

export const Courses: CollectionConfig = {
    slug: 'courses',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'title',
        description: 'Online courses and learning programs',
        defaultColumns: ['title', 'instructor', 'status', 'updatedAt'],
    },
    versions: {
        drafts: true,
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
        // Basic Information
        {
            name: 'title',
            type: 'text',
            required: true,
            admin: {
                description: 'Course title displayed to learners',
            },
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
        {
            name: 'description',
            type: 'richText',
            admin: {
                description: 'Detailed course description and overview',
            },
        },
        {
            name: 'shortDescription',
            type: 'textarea',
            admin: {
                description: 'Brief summary for course listings and cards',
            },
        },
        // Instructor - references Coach Profile
        {
            name: 'instructor',
            type: 'relationship',
            relationTo: 'coach-profiles',
            required: true,
            hasMany: false,
            admin: {
                description: 'Primary instructor for this course',
            },
        },
        {
            name: 'additionalInstructors',
            type: 'relationship',
            relationTo: 'coach-profiles',
            hasMany: true,
            admin: {
                description: 'Co-instructors or guest lecturers',
            },
        },
        // Media - course info is public for discovery/marketing
        {
            name: 'thumbnail',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Course thumbnail image for listings',
            },
        },
        {
            name: 'coverImage',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Large cover image for course landing page',
            },
        },
        {
            name: 'previewVideo',
            type: 'text',
            admin: {
                description: 'URL to preview/intro video (YouTube, Vimeo, etc.)',
            },
        },
        // Course Structure
        {
            name: 'modules',
            type: 'relationship',
            relationTo: 'modules',
            hasMany: true,
            admin: {
                description: 'Ordered list of modules in this course',
            },
        },
        // Course Details
        {
            name: 'difficulty',
            type: 'select',
            options: [
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
                { label: 'All Levels', value: 'all-levels' },
            ],
            defaultValue: 'beginner',
        },
        {
            name: 'duration',
            type: 'group',
            admin: {
                description: 'Estimated course duration',
            },
            fields: [
                {
                    name: 'hours',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                },
                {
                    name: 'minutes',
                    type: 'number',
                    min: 0,
                    max: 59,
                    defaultValue: 0,
                },
            ],
        },
        {
            name: 'topics',
            type: 'array',
            admin: {
                description: 'Key topics covered in this course',
            },
            fields: [
                {
                    name: 'topic',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'learningOutcomes',
            type: 'array',
            admin: {
                description: 'What learners will achieve after completing the course',
            },
            fields: [
                {
                    name: 'outcome',
                    type: 'text',
                    required: true,
                },
            ],
        },
        {
            name: 'prerequisites',
            type: 'array',
            admin: {
                description: 'Required knowledge or courses before starting',
            },
            fields: [
                {
                    name: 'prerequisite',
                    type: 'text',
                    required: true,
                },
            ],
        },

        // Enrollment Settings
        {
            name: 'enrollment',
            type: 'group',
            admin: {
                description: 'Enrollment configuration',
            },
            fields: [
                {
                    name: 'isOpen',
                    type: 'checkbox',
                    defaultValue: true,
                    admin: {
                        description: 'Whether new enrollments are accepted',
                    },
                },
                {
                    name: 'maxEnrollments',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Maximum number of enrollments (0 = unlimited)',
                    },
                },
                {
                    name: 'startDate',
                    type: 'date',
                    admin: {
                        description: 'When the course becomes available',
                    },
                },
                {
                    name: 'endDate',
                    type: 'date',
                    admin: {
                        description: 'When the course closes (optional)',
                    },
                },
            ],
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
        // Categories
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: false,
            admin: {
                description: 'Primary course category',
            },
        },
        {
            name: 'tags',
            type: 'relationship',
            relationTo: 'tags',
            hasMany: true,
        },
        // SEO
        {
            name: 'seo',
            type: 'group',
            admin: {
                description: 'Search engine optimization',
            },
            fields: [
                {
                    name: 'metaTitle',
                    type: 'text',
                },
                {
                    name: 'metaDescription',
                    type: 'textarea',
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
