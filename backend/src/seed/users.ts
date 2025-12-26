/**
 * User & Profile Seed Data
 */
import type { Payload } from 'payload'

// Type definitions
type UserRole = 'admin' | 'coach' | 'creator' | 'subscriber'
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type PreferredFormat = 'video' | 'text' | 'audio' | 'interactive'
type LearningPace = 'self-paced' | 'scheduled' | 'intensive'

// User data with roles
const usersData: { email: string; password: string; role: UserRole }[] = [
    // Coaches
    { email: 'sarah.johnson@pathway.dev', password: 'Demo123!', role: 'coach' },
    { email: 'michael.chen@pathway.dev', password: 'Demo123!', role: 'coach' },
    { email: 'emily.williams@pathway.dev', password: 'Demo123!', role: 'coach' },
    { email: 'david.kumar@pathway.dev', password: 'Demo123!', role: 'coach' },
    { email: 'lisa.martinez@pathway.dev', password: 'Demo123!', role: 'coach' },
    // Creators
    { email: 'alex.writer@pathway.dev', password: 'Demo123!', role: 'creator' },
    { email: 'jamie.blogger@pathway.dev', password: 'Demo123!', role: 'creator' },
    // Subscribers
    { email: 'john.doe@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'jane.smith@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'bob.wilson@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'alice.brown@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'charlie.davis@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'diana.miller@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'ethan.taylor@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'fiona.anderson@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'george.thomas@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'hannah.jackson@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'ivan.white@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'julia.harris@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'kevin.martin@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'laura.garcia@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'mark.robinson@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'nina.clark@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'oscar.lewis@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'paula.walker@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'quinn.hall@example.com', password: 'Demo123!', role: 'subscriber' },
    { email: 'rachel.young@example.com', password: 'Demo123!', role: 'subscriber' },
]

// Coach profile data
const coachProfilesData = [
    {
        displayName: 'Sarah Johnson',
        bio: 'Leadership coach with 15+ years experience helping executives and teams reach their full potential. Former Fortune 500 executive turned coach.',
        expertise: ['Leadership Development', 'Executive Coaching', 'Team Building', 'Strategic Planning'],
        experience: { yearsOfExperience: 15, credentials: 'ICF PCC, MBA Harvard Business School', previousWork: 'VP of Operations at TechCorp, Director at GlobalFinance' },
        timezone: 'America/New_York',
        availability: [
            { day: 'mon' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'tue' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'wed' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'thu' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'fri' as DayOfWeek, startTime: '09:00', endTime: '14:00' },
        ],
        socialLinks: { website: 'https://sarahjohnson.coach', linkedin: 'linkedin.com/in/sarahjohnsoncoach', twitter: '@sarahcoaches' },
    },
    {
        displayName: 'Michael Chen',
        bio: 'Technology and career transition coach specializing in helping tech professionals navigate their career paths. Former Google engineer.',
        expertise: ['Career Transition', 'Tech Leadership', 'Interview Preparation', 'Personal Branding'],
        experience: { yearsOfExperience: 12, credentials: 'ACC ICF, CS Stanford University', previousWork: 'Senior Engineer at Google, Team Lead at Meta' },
        timezone: 'America/Los_Angeles',
        availability: [
            { day: 'mon' as DayOfWeek, startTime: '10:00', endTime: '18:00' },
            { day: 'tue' as DayOfWeek, startTime: '10:00', endTime: '18:00' },
            { day: 'wed' as DayOfWeek, startTime: '10:00', endTime: '18:00' },
            { day: 'thu' as DayOfWeek, startTime: '10:00', endTime: '18:00' },
        ],
        socialLinks: { website: 'https://michaelchen.dev', linkedin: 'linkedin.com/in/michaelchencoach' },
    },
    {
        displayName: 'Emily Williams',
        bio: 'Wellness and mindfulness coach focused on work-life balance, stress management, and holistic well-being for busy professionals.',
        expertise: ['Mindfulness', 'Stress Management', 'Work-Life Balance', 'Wellness Coaching'],
        experience: { yearsOfExperience: 8, credentials: 'Certified Mindfulness Teacher, Health Coach Certification', previousWork: 'Corporate Wellness Director at WellnessCo' },
        timezone: 'Europe/London',
        availability: [
            { day: 'mon' as DayOfWeek, startTime: '08:00', endTime: '16:00' },
            { day: 'wed' as DayOfWeek, startTime: '08:00', endTime: '16:00' },
            { day: 'fri' as DayOfWeek, startTime: '08:00', endTime: '12:00' },
        ],
        socialLinks: { website: 'https://emilywellness.com', linkedin: 'linkedin.com/in/emilywilliamscoach' },
    },
    {
        displayName: 'David Kumar',
        bio: 'Entrepreneurship and business strategy coach. Serial entrepreneur who has built and sold 3 successful startups.',
        expertise: ['Entrepreneurship', 'Business Strategy', 'Fundraising', 'Product Development', 'Startup Growth'],
        experience: { yearsOfExperience: 18, credentials: 'MBA Wharton, YC Alumni', previousWork: 'Founder & CEO of TechStartup (Acquired), Partner at VentureCapital' },
        timezone: 'Asia/Singapore',
        availability: [
            { day: 'tue' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'wed' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'thu' as DayOfWeek, startTime: '09:00', endTime: '17:00' },
            { day: 'sat' as DayOfWeek, startTime: '10:00', endTime: '14:00' },
        ],
        socialLinks: { website: 'https://davidkumar.biz', linkedin: 'linkedin.com/in/davidkumarentrepreneur', twitter: '@davidkstartups' },
    },
    {
        displayName: 'Lisa Martinez',
        bio: 'Communication and public speaking coach helping professionals become confident, impactful speakers and leaders.',
        expertise: ['Public Speaking', 'Communication Skills', 'Presentation Design', 'Executive Presence'],
        experience: { yearsOfExperience: 10, credentials: 'Toastmasters DTM, Communications MA Columbia', previousWork: 'Head of Communications at MediaCorp, TEDx Speaker Coach' },
        timezone: 'America/Chicago',
        availability: [
            { day: 'mon' as DayOfWeek, startTime: '11:00', endTime: '19:00' },
            { day: 'tue' as DayOfWeek, startTime: '11:00', endTime: '19:00' },
            { day: 'wed' as DayOfWeek, startTime: '11:00', endTime: '19:00' },
            { day: 'thu' as DayOfWeek, startTime: '11:00', endTime: '19:00' },
            { day: 'fri' as DayOfWeek, startTime: '11:00', endTime: '15:00' },
        ],
        socialLinks: { website: 'https://lisamartinez.speak', linkedin: 'linkedin.com/in/lisamartinezspeaker' },
    },
]

// Subscriber profile data
const subscriberProfilesData: { displayName: string; interests: string[]; learningPreferences: { preferredFormat: PreferredFormat; pace: LearningPace } }[] = [
    { displayName: 'John Doe', interests: ['Leadership', 'Career Growth'], learningPreferences: { preferredFormat: 'video', pace: 'self-paced' } },
    { displayName: 'Jane Smith', interests: ['Entrepreneurship', 'Marketing'], learningPreferences: { preferredFormat: 'text', pace: 'scheduled' } },
    { displayName: 'Bob Wilson', interests: ['Technology', 'Product Management'], learningPreferences: { preferredFormat: 'video', pace: 'self-paced' } },
    { displayName: 'Alice Brown', interests: ['Wellness', 'Work-Life Balance'], learningPreferences: { preferredFormat: 'audio', pace: 'self-paced' } },
    { displayName: 'Charlie Davis', interests: ['Public Speaking', 'Communication'], learningPreferences: { preferredFormat: 'interactive', pace: 'intensive' } },
    { displayName: 'Diana Miller', interests: ['Leadership', 'Team Building'], learningPreferences: { preferredFormat: 'video', pace: 'scheduled' } },
    { displayName: 'Ethan Taylor', interests: ['Career Transition', 'Tech Skills'], learningPreferences: { preferredFormat: 'video', pace: 'self-paced' } },
    { displayName: 'Fiona Anderson', interests: ['Mindfulness', 'Wellness'], learningPreferences: { preferredFormat: 'audio', pace: 'self-paced' } },
    { displayName: 'George Thomas', interests: ['Business Strategy', 'Finance'], learningPreferences: { preferredFormat: 'text', pace: 'intensive' } },
    { displayName: 'Hannah Jackson', interests: ['Entrepreneurship', 'Startups'], learningPreferences: { preferredFormat: 'video', pace: 'self-paced' } },
    { displayName: 'Ivan White', interests: ['Technology', 'AI'], learningPreferences: { preferredFormat: 'interactive', pace: 'self-paced' } },
    { displayName: 'Julia Harris', interests: ['Communication', 'Leadership'], learningPreferences: { preferredFormat: 'video', pace: 'scheduled' } },
    { displayName: 'Kevin Martin', interests: ['Product Management', 'Agile'], learningPreferences: { preferredFormat: 'text', pace: 'self-paced' } },
    { displayName: 'Laura Garcia', interests: ['Marketing', 'Branding'], learningPreferences: { preferredFormat: 'video', pace: 'intensive' } },
    { displayName: 'Mark Robinson', interests: ['Sales', 'Negotiation'], learningPreferences: { preferredFormat: 'video', pace: 'self-paced' } },
    { displayName: 'Nina Clark', interests: ['Design Thinking', 'Innovation'], learningPreferences: { preferredFormat: 'interactive', pace: 'scheduled' } },
    { displayName: 'Oscar Lewis', interests: ['Data Science', 'Analytics'], learningPreferences: { preferredFormat: 'text', pace: 'self-paced' } },
    { displayName: 'Paula Walker', interests: ['HR', 'People Management'], learningPreferences: { preferredFormat: 'video', pace: 'scheduled' } },
    { displayName: 'Quinn Hall', interests: ['Finance', 'Investment'], learningPreferences: { preferredFormat: 'text', pace: 'intensive' } },
    { displayName: 'Rachel Young', interests: ['Career Growth', 'Personal Development'], learningPreferences: { preferredFormat: 'audio', pace: 'self-paced' } },
]

export async function seedUsers(payload: Payload) {
    console.log('   Creating users...')
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
                created.push(existing.docs[0])
            }
        } catch (e) {
            console.log(`   ⚠️ Skipping user ${userData.email}: ${(e as Error).message}`)
        }
    }

    console.log(`   Created ${created.length} users`)
    return created
}

export async function seedCoachProfiles(payload: Payload, users: any[]) {
    console.log('   Creating coach profiles...')
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

            if (existing.docs.length === 0) {
                const profile = await payload.create({
                    collection: 'coach-profiles',
                    data: {
                        user: user.id,
                        displayName: profileData.displayName,
                        bio: profileData.bio,
                        expertise: profileData.expertise.map(area => ({ area })),
                        experience: profileData.experience,
                        timezone: profileData.timezone,
                        availability: profileData.availability,
                        socialLinks: profileData.socialLinks,
                        isActive: true,
                    },
                })
                created.push(profile)
            } else {
                created.push(existing.docs[0])
            }
        } catch (e) {
            console.log(`   ⚠️ Skipping coach profile for ${user.email}: ${(e as Error).message}`)
        }
    }

    console.log(`   Created ${created.length} coach profiles`)
    return created
}

export async function seedSubscriberProfiles(payload: Payload, users: any[]) {
    console.log('   Creating subscriber profiles...')
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

            if (existing.docs.length === 0) {
                const profile = await payload.create({
                    collection: 'subscriber-profiles',
                    data: {
                        user: user.id,
                        displayName: profileData.displayName,
                        interests: profileData.interests.map(topic => ({ topic })),
                        learningPreferences: profileData.learningPreferences,
                        metadata: {
                            timezone: 'UTC',
                            language: 'en',
                            joinedAt: new Date().toISOString(),
                        },
                    },
                })
                created.push(profile)
            } else {
                created.push(existing.docs[0])
            }
        } catch (e) {
            console.log(`   ⚠️ Skipping subscriber profile for ${user.email}: ${(e as Error).message}`)
        }
    }

    console.log(`   Created ${created.length} subscriber profiles`)
    return created
}
