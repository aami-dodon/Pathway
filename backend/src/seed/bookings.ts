/**
 * Coaching Sessions Seed Data
 */
import type { Payload } from 'payload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedCoachingSessions(payload: Payload, coachProfiles: any[], users: any[]) {
    console.log('   Creating coaching sessions...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    const sessionTopics = [
        'Career transition strategy discussion',
        'Leadership development coaching',
        'Startup pitch preparation',
        'Public speaking improvement',
        'Work-life balance consultation',
        'Technical interview preparation',
        'Personal branding session',
        'Business strategy review',
        'Mindfulness introduction',
        'Communication skills coaching',
        'Team management challenges',
        'Fundraising strategy discussion',
        'Executive presence development',
        'Stress management techniques',
        'Product management career path',
    ]

    const sessionTitles = [
        '1:1 Coaching Session',
        'Executive Coaching',
        'Career Strategy Session',
        'Leadership Coaching',
        'Startup Mentoring',
        'Skills Development',
        'Performance Coaching',
        'Goal Setting Session',
    ]

    const subscriberUsers = users.filter(u => u.role === 'subscriber')

    // Create various sessions across different time periods
    for (let i = 0; i < 30; i++) {
        const coach = coachProfiles[i % coachProfiles.length]
        const booker = subscriberUsers[i % subscriberUsers.length]

        // Calculate a date within the next 2 weeks or past 2 weeks
        const daysOffset = Math.floor(Math.random() * 28) - 14
        const hour = 9 + Math.floor(Math.random() * 8) // 9 AM to 5 PM
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + daysOffset)
        scheduledDate.setHours(hour, 0, 0, 0)

        // Determine status based on date
        type SessionStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'rescheduled'
        let status: SessionStatus
        if (daysOffset < -1) {
            status = Math.random() > 0.2 ? 'completed' : 'no-show'
        } else if (daysOffset < 0) {
            status = 'confirmed'
        } else if (daysOffset < 7) {
            status = Math.random() > 0.3 ? 'confirmed' : 'pending'
        } else {
            status = 'pending'
        }

        // Some cancelled sessions
        if (i % 10 === 0) {
            status = 'cancelled'
        }

        try {
            const existing = await payload.find({
                collection: 'coaching-sessions',
                where: {
                    and: [
                        { coach: { equals: coach.id } },
                        { bookedByUser: { equals: booker.id } },
                        { scheduledAt: { equals: scheduledDate.toISOString() } },
                    ],
                },
                limit: 1,
                overrideAccess: true,
            })

            const data = {
                sessionTitle: sessionTitles[i % sessionTitles.length],
                coach: coach.id,
                bookerName: booker.email.split('@')[0].replace('.', ' ').split(' ').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
                bookerEmail: booker.email,
                bookedByUser: booker.id,
                scheduledAt: scheduledDate.toISOString(),
                duration: 30,
                timezone: 'UTC',
                status,
                sessionType: 'video' as const,
                topic: sessionTopics[i % sessionTopics.length],
                bookerNotes: i % 3 === 0 ? 'Looking forward to discussing my career goals.' : undefined,
                coachNotes: status === 'completed' ? 'Great session. Follow-up recommended.' : undefined,
                bookedAt: new Date(scheduledDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                confirmedAt: status !== 'pending' ? new Date(scheduledDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                cancelledAt: status === 'cancelled' ? new Date(scheduledDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                cancellationReason: status === 'cancelled' ? 'Schedule conflict - will rebook' : undefined,
            }

            if (existing.docs.length === 0) {
                const session = await payload.create({
                    collection: 'coaching-sessions',
                    overrideAccess: true,
                    data,
                })
                created.push(session)
            } else {
                const session = await payload.update({
                    collection: 'coaching-sessions',
                    id: existing.docs[0].id,
                    overrideAccess: true,
                    data,
                })
                created.push(session)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding coaching session: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} coaching sessions`)
    return created
}
