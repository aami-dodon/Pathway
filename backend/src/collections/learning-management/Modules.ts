import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrCoach } from '../../access'
export const Modules: CollectionConfig = {
    slug: 'modules',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'title',
        description: 'Course modules - organized sections within a course',
        defaultColumns: ['title', 'order', 'isPublished', 'updatedAt'],
    },
    access: {
        // Read: Coaches/admins see all, everyone else sees published only
        // This allows anonymous users to view course curriculum structure for discovery
        // Actual lesson content is protected via field-level access on Lessons
        read: ({ req: { user } }) => {
            // Admins and coaches see all modules (including unpublished)
            if (user && ['admin', 'coach'].includes(user.role as string)) {
                return true
            }

            // Everyone else (including anonymous) sees only published modules
            // This enables course curriculum display for discovery/marketing
            return { isPublished: { equals: true } }
        },
        // Create: Coaches and admins
        create: isAdminOrCoach,
        // Update: Coaches and admins
        update: isAdminOrCoach,
        // Delete: Admin only
        delete: isAdmin,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            admin: {
                description: 'Module title',
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
                description: 'Brief description of what this module covers',
            },
        },
        // Module ordering within course
        {
            name: 'order',
            type: 'number',
            required: true,
            defaultValue: 0,
            admin: {
                description: 'Display order within the course (lower = earlier)',
            },
        },
        // Lessons in this module
        {
            name: 'lessons',
            type: 'relationship',
            relationTo: 'lessons',
            hasMany: true,
            admin: {
                description: 'Ordered list of lessons in this module',
            },
        },
        // Module completion requirements
        {
            name: 'completionRequirements',
            type: 'group',
            admin: {
                description: 'Requirements to mark this module as complete',
            },
            fields: [
                {
                    name: 'requireAllLessons',
                    type: 'checkbox',
                    defaultValue: true,
                    admin: {
                        description: 'Must complete all lessons to finish module',
                    },
                },
                {
                    name: 'minimumLessons',
                    type: 'number',
                    min: 0,
                    admin: {
                        description: 'Minimum number of lessons to complete (if not all required)',
                    },
                },
                {
                    name: 'requireQuizPass',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                        description: 'Must pass module quiz to complete',
                    },
                },
            ],
        },
        // Duration estimate
        {
            name: 'estimatedDuration',
            type: 'group',
            admin: {
                description: 'Estimated time to complete this module',
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
        // Learning objectives
        {
            name: 'objectives',
            type: 'array',
            admin: {
                description: 'Learning objectives for this module',
            },
            fields: [
                {
                    name: 'objective',
                    type: 'text',
                    required: true,
                },
            ],
        },
        // Optional module quiz
        {
            name: 'quiz',
            type: 'relationship',
            relationTo: 'quizzes',
            hasMany: false,
            admin: {
                description: 'Optional quiz to assess module understanding',
            },
        },
        // Status
        {
            name: 'isPublished',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Whether this module is visible to learners',
            },
        },
    ],
}
