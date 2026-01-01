import type { CollectionConfig, Access } from 'payload'
import { setEnrolledAt } from '../../hooks'
import { isAdmin, isAuthenticated, isAdminOrEnrollee } from '../../access'



export const Enrollments: CollectionConfig = {
    slug: 'enrollments',
    admin: {
        group: 'Learning Management',
        useAsTitle: 'id',
        description: 'Student enrollments in courses',
        defaultColumns: ['subscriber', 'course', 'status', 'enrolledAt', 'progress.percentComplete'],
    },
    access: {
        read: isAdminOrEnrollee,  // Admin or enrollment owner
        create: isAuthenticated,   // Any logged-in user can enroll
        update: isAdminOrEnrollee, // Admin or enrollee (limited fields)
        delete: isAdmin,           // Only admins
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
        afterChange: [
            async ({ doc, operation, req, previousDoc }) => {
                const { EmailService } = await import('../../services/emailService')

                // Helper to get user email from subscriber
                const getUserEmailAndName = async (subscriberId: string | any) => {
                    let email = ''
                    let name = 'Learner'
                    try {
                        const id = typeof subscriberId === 'object' ? subscriberId.id : subscriberId
                        const subProfile = await req.payload.findByID({
                            collection: 'subscriber-profiles',
                            id,
                            req,
                        })

                        if (subProfile) {
                            name = subProfile.displayName || 'Learner'
                            if (subProfile.user) {
                                const userId = typeof subProfile.user === 'object' ? subProfile.user.id : subProfile.user
                                const user = await req.payload.findByID({
                                    collection: 'users',
                                    id: String(userId),
                                    req,
                                })
                                if (user) email = user.email
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching user email', e)
                    }
                    return { email, name }
                }

                // Helper to get course title
                const getCourseTitleAndSlug = async (courseId: string | any) => {
                    try {
                        const id = typeof courseId === 'object' ? courseId.id : courseId
                        const course = await req.payload.findByID({
                            collection: 'courses',
                            id,
                            req,
                        })
                        return { title: course?.title || 'Course', slug: course?.slug || '#' }
                    } catch (e) {
                        return { title: 'Course', slug: '#' }
                    }
                }

                // 1. Course Enrollment (Create)
                if (operation === 'create') {
                    // Existing Resend Logic
                    try {
                        // Find the User associated with the subscriber profile
                        const subProfile = await req.payload.findByID({
                            collection: 'subscriber-profiles',
                            id: typeof doc.subscriber === 'object' ? doc.subscriber.id : doc.subscriber,
                            req,
                        })

                        if (subProfile && subProfile.user) {
                            const userId = typeof subProfile.user === 'object' ? subProfile.user.id : subProfile.user
                            const user = await req.payload.findByID({
                                collection: 'users',
                                id: String(userId),
                                req,
                            })

                            if (user && user.email) {
                                // Sync to Resend
                                const { ResendContactService } = await import('../../services/resendContactService')
                                await ResendContactService.upsertContact({
                                    email: user.email,
                                    data: {
                                        isStudent: true
                                    }
                                })
                                console.log(`🎓 Tagged user ${user.email} as Student in Resend`)
                            }
                        }
                    } catch (error) {
                        console.error('Error syncing enrollment to Resend:', error)
                    }

                    // Email Notification Logic
                    try {
                        const { email, name } = await getUserEmailAndName(doc.subscriber)
                        const { title, slug } = await getCourseTitleAndSlug(doc.course)

                        if (email) {
                            await EmailService.send(req.payload, {
                                to: email,
                                templateSlug: 'course-enrollment',
                                data: {
                                    subscriberName: name,
                                    courseTitle: title,
                                    courseSlug: slug
                                }
                            })
                        }
                    } catch (error) {
                        console.error('Error sending enrollment email:', error)
                    }
                }

                // 2. Course Completion
                if (operation === 'update' && doc.status === 'completed' && previousDoc.status !== 'completed') {
                    try {
                        const { email, name } = await getUserEmailAndName(doc.subscriber)
                        const { title } = await getCourseTitleAndSlug(doc.course)

                        if (email) {
                            await EmailService.send(req.payload, {
                                to: email,
                                templateSlug: 'course-completion',
                                data: {
                                    subscriberName: name,
                                    courseTitle: title
                                }
                            })
                        }
                    } catch (error) {
                        console.error('Error sending completion email:', error)
                    }
                }
            }
        ]
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
            access: {
                update: () => true,
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
            access: {
                update: () => true,
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
            access: {
                read: () => true,
                update: () => true,
            },
        },
    ],
}
