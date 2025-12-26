import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrCoach, courseContentAccess } from '../../access'
import { setPublishedAt } from '../../hooks'

export const Courses: CollectionConfig = {
    slug: 'courses',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'title',
        description: 'Online courses and learning programs',
        defaultColumns: ['title', 'instructor', 'status', 'accessLevel', 'updatedAt'],
    },
    versions: {
        drafts: true,
    },
    access: {
        // Read: Based on accessLevel and status
        read: ({ req: { user } }) => {
            // Admins and coaches see all courses
            if (user && ['admin', 'coach'].includes(user.role as string)) {
                return true
            }

            // Build query for published courses with appropriate access level
            const baseQuery = { status: { equals: 'published' } }

            if (user) {
                // Authenticated users see published public + subscriber courses
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

            // Anonymous see only public published courses
            return {
                and: [
                    baseQuery,
                    { accessLevel: { equals: 'public' } },
                ],
            }
        },
        // Create: Coaches and admins only
        create: isAdminOrCoach,
        // Update: Coaches and admins (could be refined to instructor-only)
        update: isAdminOrCoach,
        // Delete: Admin only
        delete: isAdmin,
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
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'URL-friendly identifier for the course',
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
        // Media
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
        // Access Control
        {
            name: 'accessLevel',
            type: 'select',
            required: true,
            defaultValue: 'subscribers',
            options: [
                { label: 'Free / Public', value: 'public' },
                { label: 'Subscribers Only', value: 'subscribers' },
            ],
            admin: {
                position: 'sidebar',
                description: 'Who can access this course',
            },
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
                },
            ],
        },
    ],
}
