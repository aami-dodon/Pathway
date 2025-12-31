
import dotenv from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

// 1. Setup Environment
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
dotenv.config({ path: path.resolve(dirname, '../../.env') })

// Dynamic import for config to avoid load order issues
async function verifyCourseEmail() {
    console.log('--- Verifying Course Email Flow ---')
    try {
        const { default: config } = await import('../payload.config')
        const payload = await getPayload({ config })
        const { seedEmails } = await import('../seed/emails')

        // 2. Ensure Templates Exist
        await seedEmails(payload)

        // 3. Setup Test User & Subscriber
        const email = 'verify-course-test@example.com'
        let user
        const existingUsers = await payload.find({
            collection: 'users',
            where: { email: { equals: email } },
            limit: 1
        })

        if (existingUsers.totalDocs > 0) {
            user = existingUsers.docs[0]
        } else {
            console.log('Creating test user...')
            user = await payload.create({
                collection: 'users',
                data: {
                    email,
                    password: 'testpassword123',
                    role: 'subscriber',
                }
            })
        }

        let subscriberProfile
        const existingProfiles = await payload.find({
            collection: 'subscriber-profiles',
            where: { user: { equals: user.id } },
            limit: 1
        })

        if (existingProfiles.totalDocs > 0) {
            subscriberProfile = existingProfiles.docs[0]
        } else {
            console.log('Creating subscriber profile...')
            subscriberProfile = await payload.create({
                collection: 'subscriber-profiles',
                data: {
                    user: user.id,
                    displayName: 'Course Tester',
                    isActive: true
                }
            })
        }

        // 3.5. Setup Test Instructor (Required for Course)
        let instructorProfile
        const existingCoaches = await payload.find({
            collection: 'coach-profiles',
            limit: 1
        })

        if (existingCoaches.totalDocs > 0) {
            instructorProfile = existingCoaches.docs[0]
        } else {
            console.log('Creating instructor profile...')
            // Need a user for the coach
            const instructorUser = await payload.create({
                collection: 'users',
                data: {
                    email: 'instructor-test@example.com',
                    password: 'testpassword123',
                    role: 'coach',
                }
            })

            instructorProfile = await payload.create({
                collection: 'coach-profiles',
                data: {
                    user: instructorUser.id,
                    displayName: 'Test Instructor',
                    availability: [],
                    expertise: [],
                    timezone: 'UTC'
                },
                draft: false
            })
        }

        // 4. Setup Test Course
        let course
        const courses = await payload.find({
            collection: 'courses',
            limit: 1
        })

        if (courses.totalDocs > 0) {
            course = courses.docs[0]
        } else {
            console.log('Creating test course...')
            course = await payload.create({
                collection: 'courses',
                data: {
                    title: 'Test Course 101',
                    slug: 'test-course-101',
                    description: {
                        root: {
                            type: 'root',
                            children: [
                                {
                                    type: 'paragraph',
                                    children: [
                                        {
                                            text: 'A course for testing emails',
                                            version: 1
                                        }
                                    ],
                                    version: 1
                                }
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            version: 1
                        }
                    },
                    instructor: instructorProfile.id,
                    isPublished: true,
                }
            })
        }

        // 5. Create Enrollment (Triggers Enrollment Email)
        console.log('Creating enrollment...')
        // Delete existing enrollment if any
        await payload.delete({
            collection: 'enrollments',
            where: {
                and: [
                    { subscriber: { equals: subscriberProfile.id } },
                    { course: { equals: course.id } }
                ]
            }
        })

        const enrollment = await payload.create({
            collection: 'enrollments',
            data: {
                subscriber: subscriberProfile.id,
                course: course.id,
                status: 'active',
                enrolledAt: new Date().toISOString()
            }
        })
        console.log('Enrollment created. Check for "Welcome to Course" email.')

        // 6. Complete Course (Triggers Completion Email)
        console.log('Completing course...')
        await payload.update({
            collection: 'enrollments',
            id: enrollment.id,
            data: {
                status: 'completed',
                completedAt: new Date().toISOString(),
                progress: {
                    percentComplete: 100
                }
            }
        })
        console.log('Course completed. Check for "Congratulations" email.')

        console.log('--- Verification Complete ---')

    } catch (error) {
        console.error('Verification failed:', error)
    } finally {
        process.exit(0)
    }
}

verifyCourseEmail()
