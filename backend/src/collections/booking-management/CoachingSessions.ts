import type { CollectionConfig, Access, Where } from 'payload'
import { anyone, isAdmin, isAdminOrCoach, isAuthenticated, fieldIsAdmin, fieldIsAdminOrCoach } from '../../access'

/**
 * Custom access: Users can see their own bookings (by email or user)
 * Coaches can see bookings for their sessions
 * Admins can see all
 */
const bookingReadAccess: Access = async ({ req }) => {
    const { user, payload } = req

    // Admins see all
    if (user?.role === 'admin') return true

    // Coaches see bookings for their sessions
    if (user?.role === 'coach') {
        try {
            const coachProfile = await payload.find({
                collection: 'coach-profiles',
                where: { user: { equals: user.id } },
                limit: 1,
            })

            if (coachProfile.docs.length > 0) {
                const where: Where = {
                    coach: { equals: coachProfile.docs[0].id },
                }
                return where
            }
        } catch {
            return false
        }
    }

    // Authenticated users can see their own bookings
    if (user) {
        const where: Where = {
            or: [
                { bookedByUser: { equals: user.id } },
                { bookerEmail: { equals: user.email } },
            ],
        }
        return where
    }

    // Anonymous users cannot see bookings
    return false
}

export const CoachingSessions: CollectionConfig = {
    slug: 'coaching-sessions',
    admin: {
        group: 'Booking Management',
        useAsTitle: 'sessionTitle',
        description: '1:1 coaching session bookings with coaches',
        defaultColumns: ['sessionTitle', 'coach', 'bookerName', 'scheduledAt', 'status'],
    },
    access: {
        // Read: Own bookings, coach's bookings, or admin
        read: bookingReadAccess,
        // Create: Anyone can book a session (public access)
        create: anyone,
        // Update: Admin or coach for their sessions
        update: isAdminOrCoach,
        // Delete: Admin only
        delete: isAdmin,
    },
    hooks: {
        beforeChange: [
            // Set bookedAt timestamp on creation
            async ({ operation, data }) => {
                if (operation === 'create') {
                    return {
                        ...data,
                        bookedAt: new Date().toISOString(),
                    }
                }
                return data
            },
            // If authenticated user is booking, link their user ID
            async ({ req, operation, data }) => {
                if (operation === 'create' && req.user) {
                    return {
                        ...data,
                        bookedByUser: req.user.id,
                        bookerEmail: data.bookerEmail || req.user.email,
                    }
                }
                return data
            },
        ],
    },
    fields: [
        // Session Identification
        {
            name: 'sessionTitle',
            type: 'text',
            required: true,
            admin: {
                description: 'Title for this coaching session / type of session',
            },
        },
        // Coach being booked
        {
            name: 'coach',
            type: 'relationship',
            relationTo: 'coach-profiles',
            required: true,
            hasMany: false,
            admin: {
                description: 'The coach for this 1:1 session',
            },
        },
        // Booker Information (required for anonymous bookings)
        {
            name: 'bookerName',
            type: 'text',
            required: true,
            admin: {
                description: 'Name of the person booking the session',
            },
        },
        {
            name: 'bookerEmail',
            type: 'email',
            required: true,
            admin: {
                description: 'Email for booking confirmations and reminders',
            },
        },
        {
            name: 'bookerPhone',
            type: 'text',
            admin: {
                description: 'Optional phone number for contact',
            },
        },
        // Optional link to authenticated user
        {
            name: 'bookedByUser',
            type: 'relationship',
            relationTo: 'users',
            hasMany: false,
            admin: {
                description: 'If booked by a registered user, linked here',
                readOnly: true,
            },
        },
        // Scheduling
        {
            name: 'scheduledAt',
            type: 'date',
            required: true,
            admin: {
                description: 'Date and time of the scheduled session',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'duration',
            type: 'number',
            required: true,
            defaultValue: 60,
            min: 15,
            max: 240,
            admin: {
                description: 'Session duration in minutes',
            },
        },
        {
            name: 'timezone',
            type: 'text',
            defaultValue: 'UTC',
            admin: {
                description: 'Timezone of the booker',
            },
        },
        // Session Status
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'pending',
            options: [
                { label: 'Pending Confirmation', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Completed', value: 'completed' },
                { label: 'No Show', value: 'no-show' },
                { label: 'Rescheduled', value: 'rescheduled' },
            ],
            admin: {
                position: 'sidebar',
            },
            // Only coach or admin can update status
            access: {
                update: fieldIsAdminOrCoach,
            },
        },
        // Session Details
        {
            name: 'sessionType',
            type: 'select',
            defaultValue: 'video',
            options: [
                { label: 'Video Call', value: 'video' },
                { label: 'Phone Call', value: 'phone' },
                { label: 'In Person', value: 'in-person' },
            ],
            admin: {
                description: 'How the session will be conducted',
            },
        },
        {
            name: 'meetingLink',
            type: 'text',
            admin: {
                description: 'Video call link (Zoom, Google Meet, etc.)',
            },
            // Only coach or admin can set meeting link
            access: {
                update: fieldIsAdminOrCoach,
            },
        },
        {
            name: 'topic',
            type: 'textarea',
            admin: {
                description: 'What the booker wants to discuss',
            },
        },
        // Notes
        {
            name: 'bookerNotes',
            type: 'textarea',
            admin: {
                description: 'Additional notes from the booker',
            },
        },
        {
            name: 'coachNotes',
            type: 'textarea',
            admin: {
                description: 'Private notes from the coach',
                position: 'sidebar',
            },
            // Only coach or admin can view/edit coach notes
            access: {
                read: fieldIsAdminOrCoach,
                update: fieldIsAdminOrCoach,
            },
        },
        // Timestamps
        {
            name: 'bookedAt',
            type: 'date',
            admin: {
                description: 'When the booking was created',
                readOnly: true,
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'confirmedAt',
            type: 'date',
            admin: {
                description: 'When the session was confirmed',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
            access: {
                update: fieldIsAdminOrCoach,
            },
        },
        {
            name: 'cancelledAt',
            type: 'date',
            admin: {
                description: 'When the session was cancelled (if applicable)',
                date: {
                    pickerAppearance: 'dayAndTime',
                },
            },
        },
        {
            name: 'cancellationReason',
            type: 'textarea',
            admin: {
                description: 'Reason for cancellation',
            },
        },
    ],
}
