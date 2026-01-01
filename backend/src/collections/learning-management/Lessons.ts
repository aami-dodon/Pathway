import type { CollectionConfig, Where } from 'payload'
import { formatSlug } from '../../hooks'
import { lessonContentHandler } from '../../endpoints/lesson-content'
import { isAdmin, isAdminOrCreator } from '../../access'
export const Lessons: CollectionConfig = {
    slug: 'lessons',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'title',
        description: 'Individual lessons with learning content',
        defaultColumns: ['title', 'type', 'order', 'isFree', 'isPublished', 'updatedAt'],
    },
    access: {
        read: () => true,         // Structure visible (content via enrollment)
        create: isAdminOrCreator, // Admin or coach/creator
        update: isAdminOrCreator, // Admin or coach/creator
        delete: isAdmin,          // Only admins
    },
    endpoints: [
        {
            path: '/:id/content',
            method: 'get',
            handler: lessonContentHandler,
        },
    ],
    fields: [
        // Basic Info
        {
            name: 'title',
            type: 'text',
            required: true,
            admin: {
                description: 'Lesson title',
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: false,
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
            type: 'textarea',
            admin: {
                description: 'Brief description of the lesson',
            },
        },
        // Ordering
        {
            name: 'order',
            type: 'number',
            required: true,
            defaultValue: 0,
            admin: {
                description: 'Display order within the module (lower = earlier)',
            },
        },
        // Lesson Type
        {
            name: 'type',
            type: 'select',
            required: true,
            defaultValue: 'video',
            options: [
                { label: 'Video', value: 'video' },
                { label: 'Text/Article', value: 'text' },
                { label: 'Audio', value: 'audio' },
                { label: 'Quiz', value: 'quiz' },
            ],
            admin: {
                description: 'Primary content type for this lesson',
            },
        },
        // Video Content
        {
            name: 'videoContent',
            type: 'group',
            admin: {
                description: 'Video lesson content',
                condition: (data) => data.type === 'video',
            },
            access: {
                read: () => true,
            },
            fields: [
                {
                    name: 'videoUrl',
                    type: 'text',
                    admin: {
                        description: 'External video URL (YouTube, Vimeo, etc.)',
                    },
                },
                {
                    name: 'videoFile',

                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Uploaded video file',
                    },
                },
                {
                    name: 'transcript',
                    type: 'richText',
                    admin: {
                        description: 'Video transcript for accessibility',
                    },
                },
                {
                    name: 'captions',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Captions/subtitles file (VTT format)',
                    },
                },
            ],
        },
        // Text/Article Content
        {
            name: 'textContent',
            type: 'richText',
            admin: {
                description: 'Text-based lesson content',
                condition: (data) => data.type === 'text',
            },
            access: {
                read: () => true,
            },
        },
        // Audio Content
        {
            name: 'audioContent',
            type: 'group',
            admin: {
                description: 'Audio lesson content',
                condition: (data) => data.type === 'audio',
            },
            access: {
                read: () => true,
            },
            fields: [
                {
                    name: 'audioFile',
                    type: 'upload',
                    relationTo: 'media',
                },
                {
                    name: 'transcript',
                    type: 'richText',
                    admin: {
                        description: 'Audio transcript for accessibility',
                    },
                },
            ],
        },

        // Quiz reference
        {
            name: 'quiz',
            type: 'relationship',
            relationTo: 'quizzes',
            hasMany: false,
            admin: {
                description: 'Associated quiz for this lesson',
                condition: (data) => data.type === 'quiz',
            },
            access: {
                read: () => true,
            },
        },

        // Downloadable Resources
        {
            name: 'resources',
            type: 'array',
            admin: {
                description: 'Downloadable resources and materials',
            },
            access: {
                read: () => true,
            },
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'file',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                },
                {
                    name: 'description',
                    type: 'text',
                },
            ],
        },
        // Duration
        {
            name: 'duration',
            type: 'group',
            admin: {
                description: 'Estimated time to complete',
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
        // Access Control
        {
            name: 'isFree',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Make this lesson available as a free preview',
            },
        },
        // Completion
        {
            name: 'completionCriteria',
            type: 'select',
            defaultValue: 'view',
            options: [
                { label: 'View/Access', value: 'view' },
                { label: 'Complete Video', value: 'video-complete' },
                { label: 'Pass Quiz', value: 'quiz-pass' },
                { label: 'Manual Completion', value: 'manual' },
            ],
            admin: {
                description: 'How is this lesson marked as complete',
            },
        },
        // Status
        {
            name: 'isPublished',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Whether this lesson is visible to learners',
            },
        },
    ],
}
