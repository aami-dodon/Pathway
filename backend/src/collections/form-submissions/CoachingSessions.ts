import { CollectionConfig, APIError } from 'payload'
import { EmailService } from '../../services/emailService'
import { timezoneField } from '../../fields/timezone'




export const CoachingSessions: CollectionConfig = {
    slug: 'coaching-sessions',
    admin: {
        group: 'Form Submissions',
        useAsTitle: 'sessionTitle',
        description: '1:1 coaching session bookings with coaches',
        defaultColumns: ['sessionTitle', 'coach', 'bookerName', 'scheduledAt', 'status'],
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
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
            // Validation: Constraints (Duration & Conflicts)
            async ({ data, req, originalDoc, operation: _operation }) => {
                const sessionData = { ...originalDoc, ...data }
                // Only validate if scheduling details are present
                if (!sessionData.scheduledAt || !sessionData.coach) return data

                const duration = sessionData.duration || 30

                // 1. Duration Check
                if (duration > 30) {
                    throw new APIError('Session duration cannot exceed 30 minutes.', 400)
                }

                // 2. Fetch Coach Profile & Check Availability
                const coachId = typeof sessionData.coach === 'object' ? sessionData.coach.id : sessionData.coach
                const coachProfile = await req.payload.findByID({
                    collection: 'coach-profiles',
                    id: coachId,
                    req,
                })

                if (coachProfile) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const coachProfileAny = coachProfile as any
                    if (coachProfileAny.availability && coachProfileAny.availability.length > 0) {
                        const timezone = coachProfileAny.timezone || 'UTC'
                        const bookingDate = new Date(sessionData.scheduledAt)

                        // Get Day in Coach's Timezone
                        const bookingDay = new Intl.DateTimeFormat('en-US', {
                            weekday: 'long',
                            timeZone: timezone,
                        }).format(bookingDate)

                        // Get Time in Coach's Timezone (HH:mm)
                        const bookingTimeStr = new Intl.DateTimeFormat('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: timezone,
                        }).format(bookingDate)

                        // Normalize "9:30" to "09:30"
                        const [h, m] = bookingTimeStr.split(':')
                        const normalizedTime = `${h.padStart(2, '0')}:${m}`

                        // Map Full Day Name to 'mon', 'tue' etc. from schema
                        const dayMap: Record<string, string> = {
                            Monday: 'mon',
                            Tuesday: 'tue',
                            Wednesday: 'wed',
                            Thursday: 'thu',
                            Friday: 'fri',
                            Saturday: 'sat',
                            Sunday: 'sun',
                        }
                        const dayCode = dayMap[bookingDay]

                        // Strict Check: The Booking Interval [Start, End] must be fully contained in [SlotStart, SlotEnd]
                        const bookingEnd = new Date(bookingDate.getTime() + duration * 60000)
                        const bookingEndTimeStr = new Intl.DateTimeFormat('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: timezone,
                        }).format(bookingEnd)
                        const [he, me] = bookingEndTimeStr.split(':')
                        const normalizedEndTime = `${he.padStart(2, '0')}:${me}`

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const isCovered = (coachProfile as any).availability.some((slot: any) => {
                            if (slot.day !== dayCode) return false
                            return normalizedTime >= slot.startTime && normalizedEndTime <= slot.endTime
                        })

                        if (!isCovered) {
                            // Improved error message
                            throw new APIError(`Coach is not available at this time (${bookingDay} ${normalizedTime} - ${normalizedEndTime} ${timezone}). Please check their available slots.`, 400)
                        }
                    }

                    // 3. Conflict & Gap Check
                    const start = new Date(sessionData.scheduledAt)
                    const end = new Date(start.getTime() + duration * 60000)

                    // Gap is 15 mins
                    const GAP_MS = 15 * 60000
                    // Search range: Check sufficiently wide window (e.g., +/- 2 hours) to catch conflicting sessions
                    // We optimize by finding ANY session roughly around this time for this coach.
                    const searchStart = new Date(start.getTime() - (60 * 60000 * 4))
                    const searchEnd = new Date(end.getTime() + (60 * 60000 * 4))

                    const potentialConflicts = await req.payload.find({
                        collection: 'coaching-sessions',
                        where: {
                            and: [
                                { coach: { equals: coachId } },
                                { status: { not_equals: 'cancelled' } },
                                { id: { not_equals: originalDoc?.id } }, // Exclude self
                                { scheduledAt: { greater_than: searchStart.toISOString() } },
                                { scheduledAt: { less_than: searchEnd.toISOString() } },
                            ]
                        },
                        limit: 50,
                        req,
                    })

                    // Validate Gap: 
                    // A conflict exists if: 
                    // NOT (NewStart >= OldEnd + 15  OR  NewEnd <= OldStart - 15)
                    const hasConflict = potentialConflicts.docs.some(doc => {
                        const docStart = new Date(doc.scheduledAt).getTime()
                        const docEnd = docStart + ((doc.duration || 30) * 60000)
                        const newStart = start.getTime()
                        const newEnd = end.getTime()

                        const validAfter = newStart >= (docEnd + GAP_MS)
                        const validBefore = (newEnd + GAP_MS) <= docStart

                        return !(validAfter || validBefore)
                    })

                    if (hasConflict) {
                        throw new APIError('Scheduling Conflict: Must leave 15 minutes gap between sessions.', 400)
                    }
                }

                return data
            },
            // Zoom Integration: Create meeting when status becomes 'confirmed'
            async ({ data, originalDoc, operation }) => {
                const isConfirming =
                    (operation === 'update' && data.status === 'confirmed' && originalDoc.status !== 'confirmed') ||
                    (operation === 'create' && data.status === 'confirmed')

                const hasMeetingLink = data.zoomMeeting?.joinUrl || (originalDoc?.zoomMeeting?.joinUrl)

                if (isConfirming && !hasMeetingLink) {
                    const sessionData = { ...originalDoc, ...data }

                    // Dynamically import ZoomService to avoid bundling server-side code (Buffer) to the client
                    const { ZoomService } = await import('../../services/zoom')

                    const meetingResult = await ZoomService.createMeeting({
                        topic: `Coaching Session: ${sessionData.sessionTitle}`,
                        description: `Topic: ${sessionData.topic || 'General Coaching'}\nBooked by: ${sessionData.bookerName}`,
                        startTime: sessionData.scheduledAt,
                        durationMinutes: sessionData.duration || 60,
                    })

                    if (meetingResult) {
                        return {
                            ...data,
                            meetingLink: meetingResult.joinUrl,
                            status: 'confirmed',
                            confirmedAt: new Date().toISOString(),
                            zoomMeeting: {
                                joinUrl: meetingResult.joinUrl,
                                meetingId: meetingResult.meetingId,
                                password: meetingResult.password,
                                createdAt: new Date().toISOString(),
                            },
                        }
                    }
                }

                return data
            },
        ],
        afterChange: [
            async ({ doc, operation, req, previousDoc }) => {
                // 1. New Booking Notification
                if (operation === 'create') {
                    // Get coach name
                    let coachName = 'Your Coach'
                    if (doc.coach) {
                        const coachId = typeof doc.coach === 'object' ? doc.coach.id : doc.coach
                        const coachProfile = await req.payload.findByID({
                            collection: 'coach-profiles',
                            id: coachId,
                            req,
                        })
                        if (coachProfile) {
                            coachName = (coachProfile as any).name || coachName
                        }
                    }

                    // To Student
                    await EmailService.send(req.payload, {
                        to: doc.bookerEmail,
                        templateSlug: 'booking-confirmation',
                        data: {
                            bookerName: doc.bookerName,
                            sessionTitle: doc.sessionTitle,
                            scheduledAt: new Date(doc.scheduledAt).toLocaleString(),
                            duration: doc.duration,
                            topic: doc.topic,
                            coachName: coachName,
                        },
                    })

                    // To Coach (if coach has an email in profile or user)
                    if (doc.coach) {
                        try {
                            const coachId = typeof doc.coach === 'object' ? doc.coach.id : doc.coach
                            const coachProfile = await req.payload.findByID({
                                collection: 'coach-profiles',
                                id: coachId,
                                req,
                            })

                            if (coachProfile) {
                                let coachEmail = ''
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const coachUser = (coachProfile as any).user

                                if (coachUser) {
                                    if (typeof coachUser === 'object' && coachUser.email) {
                                        coachEmail = coachUser.email
                                    } else if (typeof coachUser === 'string' || typeof coachUser === 'number') {
                                        const userDoc = await req.payload.findByID({
                                            collection: 'users',
                                            id: coachUser,
                                            req,
                                        })
                                        if (userDoc) coachEmail = userDoc.email
                                    }
                                }

                                if (coachEmail) {
                                    await EmailService.send(req.payload, {
                                        to: coachEmail,
                                        templateSlug: 'booking-coach-notification',
                                        data: {
                                            coachName: (coachProfile as any).displayName || 'Coach',
                                            bookerName: doc.bookerName,
                                            sessionTitle: doc.sessionTitle,
                                            scheduledAt: new Date(doc.scheduledAt).toLocaleString(),
                                            topic: doc.topic || 'No topic provided',
                                        },
                                    })
                                } else {
                                    console.warn(`Could not find email for coach ${coachId}`)
                                }
                            }
                        } catch (err) {
                            console.error('Error sending booking notification to coach:', err)
                        }
                    }
                }

                // 2. Booking Confirmed (Status change to confirmed)
                if (operation === 'update' && doc.status === 'confirmed' && previousDoc.status !== 'confirmed') {
                    // Generate ICS
                    const { generateICS } = await import('../../services/ics')
                    const icsContent = generateICS({
                        title: doc.sessionTitle,
                        description: `Topic: ${doc.topic || 'Coaching Session'}\nZoom: ${doc.meetingLink}`,
                        start: new Date(doc.scheduledAt),
                        duration: doc.duration || 30,
                        url: doc.meetingLink,
                        location: doc.meetingLink,
                        organizer: {
                            name: 'Pathway',
                            email: process.env.EMAIL_FROM || 'no-reply@pathway.com'
                        }
                    })

                    await EmailService.send(req.payload, {
                        to: doc.bookerEmail,
                        templateSlug: 'booking-confirmed',
                        data: {
                            bookerName: doc.bookerName,
                            sessionTitle: doc.sessionTitle,
                            scheduledAt: new Date(doc.scheduledAt).toLocaleString(),
                            meetingLink: doc.meetingLink,
                        },
                        attachments: [
                            {
                                filename: 'invite.ics',
                                content: Buffer.from(icsContent),
                                contentType: 'text/calendar'
                            }
                        ]
                    })
                }

                // 3. Booking Cancelled
                if (operation === 'update' && doc.status === 'cancelled' && previousDoc.status !== 'cancelled') {
                    const cancellationReason = doc.cancellationReason || 'No reason provided'

                    // Notify Student
                    await EmailService.send(req.payload, {
                        to: doc.bookerEmail,
                        templateSlug: 'booking-cancellation',
                        data: {
                            recipientName: doc.bookerName,
                            sessionTitle: doc.sessionTitle,
                            scheduledAt: new Date(doc.scheduledAt).toLocaleString(),
                            reason: cancellationReason
                        }
                    })

                    // Notify Coach
                    if (doc.coach) {
                        try {
                            const coachId = typeof doc.coach === 'object' ? doc.coach.id : doc.coach
                            const coachProfile = await req.payload.findByID({
                                collection: 'coach-profiles',
                                id: coachId,
                                req,
                            })

                            if (coachProfile) {
                                let coachEmail = ''
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const coachUser = (coachProfile as any).user

                                if (coachUser) {
                                    if (typeof coachUser === 'object' && coachUser.email) {
                                        coachEmail = coachUser.email
                                    } else if (typeof coachUser === 'string' || typeof coachUser === 'number') {
                                        const userDoc = await req.payload.findByID({
                                            collection: 'users',
                                            id: coachUser,
                                            req,
                                        })
                                        if (userDoc) coachEmail = userDoc.email
                                    }
                                }

                                if (coachEmail) {
                                    await EmailService.send(req.payload, {
                                        to: coachEmail,
                                        templateSlug: 'booking-cancellation',
                                        data: {
                                            recipientName: (coachProfile as any).displayName || 'Coach',
                                            sessionTitle: doc.sessionTitle,
                                            scheduledAt: new Date(doc.scheduledAt).toLocaleString(),
                                            reason: cancellationReason
                                        },
                                    })
                                }
                            }
                        } catch (err) {
                            console.error('Error sending cancellation to coach:', err)
                        }
                    }
                }
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
            defaultValue: 30,
            min: 15,
            max: 30,
            admin: {
                description: 'Session duration in minutes (Max 30)',
            },
        },
        timezoneField({
            admin: {
                description: 'Timezone of the booker',
            },
            required: false,
        }),
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
            access: {
                update: () => true,
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
                description: 'Video call link - Auto-generated using Zoom API',
            },
            access: {
                update: () => true,
            },
        },
        {
            name: 'zoomMeeting',
            type: 'group',
            admin: {
                description: 'Zoom details (System managed)',
                readOnly: true,
                condition: (data) => !!data.zoomMeeting?.joinUrl,
            },
            fields: [
                {
                    name: 'joinUrl',
                    type: 'text',
                    admin: { description: 'Zoom Join URL' },
                },
                {
                    name: 'meetingId',
                    type: 'text',
                    admin: { description: 'Meeting ID' },
                },
                {
                    name: 'password',
                    type: 'text',
                },
                {
                    name: 'createdAt',
                    type: 'date',
                    admin: { date: { pickerAppearance: 'dayAndTime' } },
                },
            ],
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
            access: {
                read: () => true,
                update: () => true,
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
                update: () => true,
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
