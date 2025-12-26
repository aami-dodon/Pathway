/**
 * Demo Data Seeding Script
 * Seeds a comprehensive dataset for development and testing
 * 
 * Run with: npx tsx src/seed/index.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

// Import seed data modules
import { seedUsers, seedCoachProfiles, seedSubscriberProfiles } from './users.js'
import { seedCategories, seedTags, seedPosts, seedPages } from './content.js'
import { seedCourses, seedModules, seedLessons, seedQuizzes } from './lms.js'
import { seedEnrollments, seedProgress, seedQuizAttempts } from './enrollments.js'
import { seedCoachingSessions } from './bookings.js'

async function seed() {
    console.log('🌱 Starting demo data seeding...\n')

    const payload = await getPayload({ config })

    try {
        // Phase 1: Core Users & Profiles
        console.log('📦 Phase 1: Seeding Users & Profiles...')
        const users = await seedUsers(payload)
        const coachProfiles = await seedCoachProfiles(payload, users)
        const subscriberProfiles = await seedSubscriberProfiles(payload, users)
        console.log('✅ Users & Profiles seeded\n')

        // Phase 2: Content Taxonomy
        console.log('📦 Phase 2: Seeding Categories & Tags...')
        const categories = await seedCategories(payload)
        const tags = await seedTags(payload)
        console.log('✅ Categories & Tags seeded\n')

        // Phase 3: CMS Content
        console.log('📦 Phase 3: Seeding Posts & Pages...')
        await seedPosts(payload, coachProfiles, categories, tags)
        await seedPages(payload, coachProfiles)
        console.log('✅ Posts & Pages seeded\n')

        // Phase 4: LMS Structure
        console.log('📦 Phase 4: Seeding Courses, Modules, Lessons & Quizzes...')
        const quizzes = await seedQuizzes(payload)
        const lessons = await seedLessons(payload, quizzes)
        const modules = await seedModules(payload, lessons, quizzes)
        const courses = await seedCourses(payload, coachProfiles, modules, categories, tags)
        console.log('✅ LMS Structure seeded\n')

        // Phase 5: Enrollments & Progress
        console.log('📦 Phase 5: Seeding Enrollments & Progress...')
        const enrollments = await seedEnrollments(payload, subscriberProfiles, courses)
        await seedProgress(payload, enrollments, lessons)
        await seedQuizAttempts(payload, enrollments, quizzes)
        console.log('✅ Enrollments & Progress seeded\n')

        // Phase 6: Coaching Sessions
        console.log('📦 Phase 6: Seeding Coaching Sessions...')
        await seedCoachingSessions(payload, coachProfiles, users)
        console.log('✅ Coaching Sessions seeded\n')

        console.log('🎉 Demo data seeding complete!')
        console.log('\n📊 Summary:')
        console.log(`   - Users: ${users.length}`)
        console.log(`   - Coach Profiles: ${coachProfiles.length}`)
        console.log(`   - Subscriber Profiles: ${subscriberProfiles.length}`)
        console.log(`   - Categories: ${categories.length}`)
        console.log(`   - Tags: ${tags.length}`)
        console.log(`   - Courses: ${courses.length}`)
        console.log(`   - Modules: ${modules.length}`)
        console.log(`   - Lessons: ${lessons.length}`)
        console.log(`   - Quizzes: ${quizzes.length}`)
        console.log(`   - Enrollments: ${enrollments.length}`)

    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }

    process.exit(0)
}

seed()
