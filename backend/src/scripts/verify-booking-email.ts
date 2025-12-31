
import { getPayload } from 'payload'

import path from 'path'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const envPath = path.resolve(dirname, '../../.env')
console.log('Loading .env from:', envPath)
dotenv.config({ path: envPath })

async function verifyBookingEmail() {
    const { default: config } = await import('../payload.config')
    const payload = await getPayload({ config })

    console.log('--- Verifying Booking Email Flow ---')

    try {
        // 1. Ensure the email template exists (by running seed logic for emails only if needed, or just creating it directly)
        // For speed, let's just ensure the template exists in DB directly as our code changes rely on it.
        // We can re-use the seed logic or just insert it.
        const { seedEmails } = await import('../seed/emails')
        await seedEmails(payload)

        // 2. Find a user to act as coach
        const users = await payload.find({
            collection: 'users',
            limit: 1,
        })

        if (users.docs.length === 0) {
            console.error('No users found. Please seed users first.')
            process.exit(1)
        }

        const coachUser = users.docs[0]
        console.log(`Using user ${coachUser.email} as coach user`)

        // 3. Create a Coach Profile for this user if one doesn't exist
        let coachProfile = await payload.find({
            collection: 'coach-profiles',
            where: { user: { equals: coachUser.id } },
            limit: 1,
        }).then(res => res.docs[0])

        if (!coachProfile) {
            console.log('Creating coach profile...')
            coachProfile = await payload.create({
                collection: 'coach-profiles',
                data: {
                    user: coachUser.id,
                    displayName: 'Test Coach',
                    availability: [
                        { day: 'mon', startTime: '00:00', endTime: '23:59' },
                        { day: 'tue', startTime: '00:00', endTime: '23:59' },
                        { day: 'wed', startTime: '00:00', endTime: '23:59' },
                        { day: 'thu', startTime: '00:00', endTime: '23:59' },
                        { day: 'fri', startTime: '00:00', endTime: '23:59' },
                        { day: 'sat', startTime: '00:00', endTime: '23:59' },
                        { day: 'sun', startTime: '00:00', endTime: '23:59' },
                    ],
                    expertise: [{ area: 'Testing' }],
                    timezone: 'UTC'
                },
                draft: false,
            })
        } else {
            // Update availability to ensure test passes even if profile existed
            await payload.update({
                collection: 'coach-profiles',
                id: coachProfile.id,
                data: {
                    availability: [
                        { day: 'mon', startTime: '00:00', endTime: '23:59' },
                        { day: 'tue', startTime: '00:00', endTime: '23:59' },
                        { day: 'wed', startTime: '00:00', endTime: '23:59' },
                        { day: 'thu', startTime: '00:00', endTime: '23:59' },
                        { day: 'fri', startTime: '00:00', endTime: '23:59' },
                        { day: 'sat', startTime: '00:00', endTime: '23:59' },
                        { day: 'sun', startTime: '00:00', endTime: '23:59' },
                    ]
                }
            })
        }

        // 3.5 Cleanup existing bookings to avoid conflicts from previous runs
        console.log('Cleaning up previous test bookings...')
        await payload.delete({
            collection: 'coaching-sessions',
            where: {
                coach: { equals: coachProfile.id }
            }
        })

        // 4. Create a Booking
        console.log('Creating a booking...')
        const booking = await payload.create({
            collection: 'coaching-sessions',
            data: {
                sessionTitle: 'Test Session for Email Verification',
                coach: coachProfile.id,
                bookerName: 'Test Student',
                bookerEmail: 'test-student@example.com',
                scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                duration: 30,
                status: 'pending',
                topic: 'Verifying email notifications',
            }
        })

        console.log(`Booking created: ${booking.id}`)

        // 5. Confirm the booking (Triggers Confirmation Email + ICS)
        console.log('Confirming booking...')
        const confirmedBooking = await payload.update({
            collection: 'coaching-sessions',
            id: booking.id,
            data: {
                status: 'confirmed',
                meetingLink: 'https://zoom.us/j/123456789' // Mock link
            }
        })
        console.log('Booking confirmed. Check for Confirmation Email with ICS attachment.')

        // 6. Cancel the booking (Triggers Cancellation Emails)
        console.log('Cancelling booking...')
        await payload.update({
            collection: 'coaching-sessions',
            id: booking.id,
            data: {
                status: 'cancelled',
                cancellationReason: 'Testing cancellation flow'
            }
        })
        console.log('Booking cancelled. Check for Cancellation Emails to Student and Coach.')

        console.log('--- Verification Complete ---')

    } catch (error) {
        console.error('Verification failed:', error)
    } finally {
        process.exit(0)
    }
}

verifyBookingEmail()
