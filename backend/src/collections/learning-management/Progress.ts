import type { CollectionConfig, Access } from 'payload'
import { isAdmin } from '../../access'

/**
 * Custom access: Users can only see/modify their own progress
 * Progress is linked to enrollment, which is linked to subscriber profile
 */
const progressAccess: Access = async ({ req }) => {
    const { user, payload } = req

    if (!user) return false

    // Admins and coaches see all
    if (['admin', 'coach'].includes(user.role as string)) return true

    // For subscribers, find their enrollments and show progress for those
    try {
        const subscriberProfile = await payload.find({
            collection: 'subscriber-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })

        if (subscriberProfile.docs.length > 0) {
            // Find all enrollments for this subscriber
            const enrollments = await payload.find({
                collection: 'enrollments',
                where: { subscriber: { equals: subscriberProfile.docs[0].id } },
                limit: 1000,
            })

            if (enrollments.docs.length > 0) {
                return {
                    enrollment: {
                        in: enrollments.docs.map(e => e.id),
                    },
                }
            }
        }
    } catch (_error) {
        return false
    }

    return false
}

export const Progress: CollectionConfig = {
    slug: 'progress',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'id',
        description: 'Individual lesson and quiz progress tracking',
        defaultColumns: ['enrollment', 'lesson', 'status', 'completedAt'],
    },
    access: {
        // Read: Users see their own progress, staff sees all
        read: progressAccess,
        // Create: Users can create their own progress records
        create: progressAccess,
        // Update: Users can update their own progress
        update: progressAccess,
        // Delete: Admin only (progress should be preserved)
        delete: isAdmin,
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
