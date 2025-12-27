import type { CollectionConfig, Access } from 'payload'



export const Progress: CollectionConfig = {
    slug: 'progress',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'id',
        description: 'Individual lesson and quiz progress tracking',
        defaultColumns: ['enrollment', 'lesson', 'status', 'completedAt'],
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    fields: [
        // Link to enrollment
        {
            name: 'enrollment',
            type: 'relationship',
            relationTo: 'enrollments',
            required: true,
            hasMany: false,
            admin: {
                description: 'The enrollment this progress belongs to',
            },
        },
        // Lesson being tracked
        {
            name: 'lesson',
            type: 'relationship',
            relationTo: 'lessons',
            required: true,
            hasMany: false,
            admin: {
                description: 'The lesson being tracked',
            },
        },
        // Progress Status
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'not-started',
            options: [
                { label: 'Not Started', value: 'not-started' },
                { label: 'In Progress', value: 'in-progress' },
                { label: 'Completed', value: 'completed' },
                { label: 'Skipped', value: 'skipped' },
            ],
        },
        // Timestamps
        {
            name: 'startedAt',
            type: 'date',
            admin: {
                description: 'When the learner first accessed this lesson',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'completedAt',
            type: 'date',
            admin: {
                description: 'When the learner completed this lesson',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'lastAccessedAt',
            type: 'date',
            admin: {
                description: 'Last time the learner accessed this lesson',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        // Video Progress
        {
            name: 'videoProgress',
            type: 'group',
            admin: {
                description: 'Video-specific progress tracking',
            },
            fields: [
                {
                    name: 'watchedSeconds',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                    admin: {
                        description: 'Seconds of video watched',
                    },
                },
                {
                    name: 'totalSeconds',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Total video duration in seconds',
                    },
                },
                {
                    name: 'percentWatched',
                    type: 'number',
                    min: 0,
                    max: 100,
                    defaultValue: 0,
                },
                {
                    name: 'lastPosition',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                    admin: {
                        description: 'Last playback position to resume from',
                    },
                },
            ],
        },
        // Time Tracking
        {
            name: 'timeSpent',
            type: 'number',
            min: 0,
            defaultValue: 0,
            admin: {
                description: 'Total time spent on this lesson (in seconds)',
            },
        },
        // Notes and Bookmarks
        {
            name: 'notes',
            type: 'richText',
            admin: {
                description: 'Learner notes for this lesson',
            },
        },
        {
            name: 'bookmarks',
            type: 'array',
            admin: {
                description: 'Video/content bookmarks',
            },
            fields: [
                {
                    name: 'timestamp',
                    type: 'number',
                    admin: {
                        description: 'Position in seconds (for video/audio)',
                    },
                },
                {
                    name: 'note',
                    type: 'text',
                },
                {
                    name: 'createdAt',
                    type: 'date',
                },
            ],
        },
    ],
}
