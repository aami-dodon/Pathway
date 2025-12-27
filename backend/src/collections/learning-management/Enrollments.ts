import type { CollectionConfig, Access } from 'payload'
import { isAdmin, isAdminOrCoach, isAuthenticated, fieldIsAdmin, fieldIsAdminOrCoach } from '../../access'
import { setEnrolledAt } from '../../hooks'

/**
 * Custom access: User can only see their own enrollments (via subscriber profile)
 * Coaches can see enrollments for their courses
 * Admins can see all
 */
const enrollmentReadAccess: Access = async ({ req }) => {
    const { user, payload } = req

    if (!user) return false

    // Admins see all
    if (user.role === 'admin') return true

    // Coaches see all (could be refined to their courses only)
    if (user.role === 'coach') return true

    // For subscribers, find their subscriber profile and show their enrollments
    try {
        const subscriberProfile = await payload.find({
            collection: 'subscriber-profiles',
            where: { user: { equals: user.id } },
            limit: 1,
        })

        if (subscriberProfile.docs.length > 0) {
            return {
                subscriber: { equals: subscriberProfile.docs[0].id },
            }
        }
    } catch (_error) {
        // If lookup fails, deny access
        return false
    }

    return false
}

export const Enrollments: CollectionConfig = {
    slug: 'enrollments',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'id',
        description: 'Student enrollments in courses',
        defaultColumns: ['subscriber', 'course', 'status', 'enrolledAt', 'progress.percentComplete'],
    },
    access: {
        // Read: Users see their own enrollments, coaches/admins see all
        read: enrollmentReadAccess,
        // Create: Authenticated users can enroll themselves
        create: isAuthenticated,
        // Update: Admin or coach (for status changes, etc.)
        update: isAdminOrCoach,
        // Delete: Admin only
        delete: isAdmin,
    },
    hooks: {
        beforeChange: [
            setEnrolledAt,
            // Ensure users can only enroll themselves (not others)
            async ({ req, operation, data }) => {
                if (operation === 'create' && req.user && req.user.role !== 'admin') {
                    // Find the user's subscriber profile
                    const subscriberProfile = await req.payload.find({
                        collection: 'subscriber-profiles',
                        where: { user: { equals: req.user.id } },
                        limit: 1,
                    })

                    if (subscriberProfile.docs.length > 0) {
                        // Force the subscriber to be the current user's profile
                        return {
                            ...data,
                            subscriber: subscriberProfile.docs[0].id,
                        }
                    }
                }
                return data
            },
        ],
    },
    fields: [
        // Subscriber who enrolled - references Subscriber Profile
        {
            name: 'subscriber',
            type: 'relationship',
            relationTo: 'subscriber-profiles',
            required: true,
            hasMany: false,
            admin: {
                description: 'The subscriber enrolled in the course',
            },
        },
        // Course enrolled in
        {
            name: 'course',
            type: 'relationship',
            relationTo: 'courses',
            required: true,
            hasMany: false,
            admin: {
                description: 'The course the subscriber is enrolled in',
            },
        },
        // Enrollment Status
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'active',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Paused', value: 'paused' },
                { label: 'Expired', value: 'expired' },
                { label: 'Cancelled', value: 'cancelled' },
            ],
            admin: {
                position: 'sidebar',
            },
            // Field-level access: Only admin/coach can change status
            access: {
                update: fieldIsAdminOrCoach,
            },
        },
        // Enrollment Dates
        {
            name: 'enrolledAt',
            type: 'date',
            required: true,
            admin: {
                description: 'Date and time of enrollment',
                readOnly: true,
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'startedAt',
            type: 'date',
            admin: {
                description: 'When the learner first accessed the course',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'completedAt',
            type: 'date',
            admin: {
                description: 'When the learner completed the course',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'expiresAt',
            type: 'date',
            admin: {
                description: 'When enrollment access expires (if applicable)',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        // Progress Summary
        {
            name: 'progress',
            type: 'group',
            admin: {
                description: 'Overall course progress',
            },
            fields: [
                {
                    name: 'percentComplete',
                    type: 'number',
                    min: 0,
                    max: 100,
                    defaultValue: 0,
                    admin: {
                        description: 'Overall completion percentage',
                    },
                },
                {
                    name: 'lessonsCompleted',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                },
                {
                    name: 'totalLessons',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                },
                {
                    name: 'modulesCompleted',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                },
                {
                    name: 'totalModules',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                },
                {
                    name: 'lastAccessedAt',
                    type: 'date',
                    admin: {
                        description: 'Last time the learner accessed the course',
                        date: {
                            pickerAppearance: 'dayAndTime',
                        },
                    },
                },
                {
                    name: 'timeSpent',
                    type: 'number',
                    min: 0,
                    defaultValue: 0,
                    admin: {
                        description: 'Total time spent in minutes',
                    },
                },
            ],
        },
        // Certificate
        {
            name: 'certificate',
            type: 'group',
            admin: {
                description: 'Completion certificate details',
            },
            // Certificate fields are managed by system, not user
            access: {
                update: fieldIsAdmin,
            },
            fields: [
                {
                    name: 'issued',
                    type: 'checkbox',
                    defaultValue: false,
                },
                {
                    name: 'issuedAt',
                    type: 'date',
                },
                {
                    name: 'certificateId',
                    type: 'text',
                    admin: {
                        description: 'Unique certificate identifier',
                    },
                },
                {
                    name: 'certificateUrl',
                    type: 'text',
                    admin: {
                        description: 'URL to view/download certificate',
                    },
                },
            ],
        },
        // Notes
        {
            name: 'notes',
            type: 'textarea',
            admin: {
                description: 'Admin notes about this enrollment',
                position: 'sidebar',
            },
            // Only admin/coach can add notes
            access: {
                read: fieldIsAdminOrCoach,
                update: fieldIsAdminOrCoach,
            },
        },
    ],
}
