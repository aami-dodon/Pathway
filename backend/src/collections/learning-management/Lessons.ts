import type { CollectionConfig, Where } from 'payload'
import { isAdmin, isAdminOrCoach } from '../../access'

export const Lessons: CollectionConfig = {
    slug: 'lessons',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'title',
        description: 'Individual lessons with learning content',
        defaultColumns: ['title', 'type', 'order', 'isFree', 'isPublished', 'updatedAt'],
    },
    versions: {
        drafts: true,
    },
    access: {
        // Read: Coaches see all, others see published OR free preview lessons
        read: ({ req: { user } }) => {
            if (user && ['admin', 'coach'].includes(user.role as string)) {
                return true
            }
            // Show published lessons or free preview lessons
            const where: Where = {
                or: [
                    { isPublished: { equals: true } },
                    { isFree: { equals: true } },
                ],
            }
            return where
        },
        // Create: Coaches and admins
        create: isAdminOrCoach,
        // Update: Coaches and admins
        update: isAdminOrCoach,
        // Delete: Admin only
        delete: isAdmin,
    },
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
            required: true,
            index: true,
            admin: {
                description: 'URL-friendly identifier',
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
                { label: 'Interactive', value: 'interactive' },
                { label: 'Assignment', value: 'assignment' },
                { label: 'Quiz', value: 'quiz' },
                { label: 'Live Session', value: 'live' },
                { label: 'Download', value: 'download' },
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
                condition: (data) => data.type === 'text' || data.type === 'interactive',
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
        // Assignment Content
        {
            name: 'assignmentContent',
            type: 'group',
            admin: {
                description: 'Assignment details',
                condition: (data) => data.type === 'assignment',
            },
            fields: [
                {
                    name: 'instructions',
                    type: 'richText',
                    admin: {
                        description: 'Assignment instructions and requirements',
                    },
                },
                {
                    name: 'dueInDays',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Days allowed to complete after starting',
                    },
                },
                {
                    name: 'submissionType',
                    type: 'select',
                    options: [
                        { label: 'File Upload', value: 'file' },
                        { label: 'Text Submission', value: 'text' },
                        { label: 'Link/URL', value: 'link' },
                    ],
                },
                {
                    name: 'maxPoints',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Maximum points for this assignment',
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
        },
        // Live Session Details
        {
            name: 'liveSession',
            type: 'group',
            admin: {
                description: 'Live session details',
                condition: (data) => data.type === 'live',
            },
            fields: [
                {
                    name: 'scheduledAt',
                    type: 'date',
                    admin: {
                        description: 'Scheduled date and time',
                        date: {
                            pickerAppearance: 'dayAndTime',
                        },
                    },
                },
                {
                    name: 'meetingUrl',
                    type: 'text',
                    admin: {
                        description: 'Meeting/webinar URL',
                    },
                },
                {
                    name: 'recordingUrl',
                    type: 'text',
                    admin: {
                        description: 'Recording URL (after session)',
                    },
                },
            ],
        },
        // Downloadable Resources
        {
            name: 'resources',
            type: 'array',
            admin: {
                description: 'Downloadable resources and materials',
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
                { label: 'Submit Assignment', value: 'assignment-submit' },
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
