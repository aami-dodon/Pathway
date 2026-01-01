/**
 * User & Profile Seed Data
 */
import type { Payload } from 'payload'

// Type definitions
type UserRole = 'admin' | 'coach' | 'creator' | 'subscriber'
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type PreferredFormat = 'video' | 'text' | 'audio'
type LearningPace = 'self-paced' | 'scheduled' | 'intensive'

// User data with roles
const usersData: { email: string; password: string; role: UserRole }[] = [
    // Coaches
    { email: 'sarah.johnson@pathway.dev', password: 'Demo123!', role: 'coach' },
    // Subscribers
    { email: 'john.doe@example.com', password: 'Demo123!', role: 'subscriber' },
]

// Coach profile data
const coachProfilesData = [
    {
        displayName: 'Sarah Johnson',
        slug: 'sarah-johnson',
        bio: 'Leadership coach with 15+ years experience helping executives and teams reach their full potential. Former Fortune 500 executive turned coach.',
        expertise: ['Leadership Development', 'Executive Coaching', 'Team Building', 'Strategic Planning'],
        experience: { yearsOfExperience: 15, credentials: 'ICF PCC, MBA Harvard Business School', previousWork: 'VP of Operations at TechCorp, Director at GlobalFinance' },
        timezone: 'America/New_York' as any,
        availability: [
            { day: 'mon' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'tue' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'wed' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'thu' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'fri' as DayOfWeek, startTime: '09:00', endTime: '14:00' },
        ],
        socialLinks: { website: 'https://sarahjohnson.coach', linkedin: 'linkedin.com/in/sarahjohnsoncoach', twitter: '@sarahcoaches' },
    },
]

// Subscriber profile data
const subscriberProfilesData: { displayName: string; interests: string[]; learningPreferences: { preferredFormat: PreferredFormat; pace: LearningPace } }[] = [
    { displayName: 'John Doe', interests: ['Leadership', 'Career Growth'], learningPreferences: { preferredFormat: 'video', pace: 'self-paced' } },
]

export async function upsertAdmin(payload: Payload) {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
        console.log('   ⚠️ Skipping admin creation: ADMIN_EMAIL or ADMIN_PASSWORD not set')
        return null
    }

    console.log(`   Upserting admin: ${adminEmail}...`)

    const existingAdmin = await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
    })

    if (existingAdmin.docs.length === 0) {
        const admin = await payload.create({
            collection: 'users',
            data: {
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
            },
        })
        console.log('   ✅ Admin user created')
        return admin
    } else {
        const admin = await payload.update({
            collection: 'users',
            id: existingAdmin.docs[0].id,
            data: {
                role: 'admin',
                // We update password as well to ensure it matches .env
                password: adminPassword,
            },
        })
        console.log('   ✅ Admin user updated (role forced to admin)')
        return admin
    }
}

export async function seedUsers(payload: Payload) {
    console.log('   Creating/Updating users...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const userData of usersData) {
        try {
            const existing = await payload.find({
                collection: 'users',
                where: { email: { equals: userData.email } },
                limit: 1,
            })

            if (existing.docs.length === 0) {
                const user = await payload.create({
                    collection: 'users',
                    data: userData,
                })
                created.push(user)
            } else {
                const user = await payload.update({
                    collection: 'users',
                    id: existing.docs[0].id,
                    data: userData,
                })
                created.push(user)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding user ${userData.email}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} users`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedCoachProfiles(payload: Payload, users: any[]) {
    console.log('   Creating/Updating coach profiles...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []
    const coachUsers = users.filter(u => u.role === 'coach')

    for (let i = 0; i < coachUsers.length && i < coachProfilesData.length; i++) {
        const profileData = coachProfilesData[i]
        const user = coachUsers[i]

        try {
            const existing = await payload.find({
                collection: 'coach-profiles',
                where: { user: { equals: user.id } },
                limit: 1,
            })

            const data = {
                user: user.id,
                displayName: profileData.displayName,
                slug: profileData.slug,
                bio: profileData.bio,
                expertise: profileData.expertise.map(area => ({ area })),
                experience: profileData.experience,
                timezone: profileData.timezone,
                availability: profileData.availability,
                socialLinks: profileData.socialLinks,
                isActive: true,
            }

            if (existing.docs.length === 0) {
                const profile = await payload.create({
                    collection: 'coach-profiles',
                    data,
                })
                created.push(profile)
            } else {
                const profile = await payload.update({
                    collection: 'coach-profiles',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(profile)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding coach profile for ${user.email}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} coach profiles`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedSubscriberProfiles(payload: Payload, users: any[]) {
    console.log('   Creating/Updating subscriber profiles...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []
    const subscriberUsers = users.filter(u => u.role === 'subscriber')

    for (let i = 0; i < subscriberUsers.length && i < subscriberProfilesData.length; i++) {
        const profileData = subscriberProfilesData[i]
        const user = subscriberUsers[i]

        try {
            const existing = await payload.find({
                collection: 'subscriber-profiles',
                where: { user: { equals: user.id } },
                limit: 1,
            })

            const data = {
                user: user.id,
                displayName: profileData.displayName,
                interests: profileData.interests.map(topic => ({ topic })),
                learningPreferences: profileData.learningPreferences,
                metadata: {
                    timezone: 'UTC' as any,
                    language: 'en',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    joinedAt: existing.docs.length > 0 ? (existing.docs[0] as any).metadata?.joinedAt : new Date().toISOString(),
                },
            }

            if (existing.docs.length === 0) {
                const profile = await payload.create({
                    collection: 'subscriber-profiles',
                    data,
                })
                created.push(profile)
            } else {
                const profile = await payload.update({
                    collection: 'subscriber-profiles',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(profile)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding subscriber profile for ${user.email}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} subscriber profiles`)
    return created
}
