/**
 * Enrollment & Progress Seed Data
 */
import type { Payload } from 'payload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedEnrollments(payload: Payload, subscriberProfiles: any[], courses: any[]) {
    console.log('   Creating/Updating enrollments...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    // Each subscriber enrolls in 1-3 courses
    for (let i = 0; i < subscriberProfiles.length; i++) {
        const subscriber = subscriberProfiles[i]
        const numCourses = 1 + (i % 3) // 1, 2, or 3 courses

        for (let j = 0; j < numCourses && j < courses.length; j++) {
            const course = courses[(i + j) % courses.length]
            const enrolledDaysAgo = Math.floor(Math.random() * 60) + 1
            const enrolledAt = new Date(Date.now() - enrolledDaysAgo * 24 * 60 * 60 * 1000)

            // Different statuses based on enrollment progress
            const statuses: ('active' | 'completed' | 'paused' | 'expired' | 'cancelled')[] = ['active', 'active', 'active', 'completed', 'paused']
            const status = statuses[i % statuses.length]

            // Progress calculations
            const percentComplete = status === 'completed' ? 100 : Math.floor(Math.random() * 80)
            const lessonsCompleted = Math.floor((percentComplete / 100) * 10)

            const data = {
                subscriber: subscriber.id,
                course: course.id,
                status,
                enrolledAt: enrolledAt.toISOString(),
                startedAt: new Date(enrolledAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                progress: {
                    percentComplete,
                    lessonsCompleted,
                    totalLessons: 10,
                    modulesCompleted: Math.floor(lessonsCompleted / 3),
                    totalModules: 3,
                    lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    timeSpent: Math.floor(Math.random() * 600) + 60,
                },
                certificate: status === 'completed' ? {
                    issued: true,
                    issuedAt: new Date().toISOString(),
                    certificateId: `CERT-${Date.now()}-${i}`,
                } : { issued: false },
            }

            try {
                const existing = await payload.find({
                    collection: 'enrollments',
                    where: {
                        and: [
                            { subscriber: { equals: subscriber.id } },
                            { course: { equals: course.id } },
                        ],
                    },
                    limit: 1,
                })

                if (existing.docs.length === 0) {
                    const enrollment = await payload.create({
                        collection: 'enrollments',
                        data,
                    })
                    created.push(enrollment)
                } else {
                    const enrollment = await payload.update({
                        collection: 'enrollments',
                        id: existing.docs[0].id,
                        data,
                    })
                    created.push(enrollment)
                }
            } catch (e) {
                console.log(`   ⚠️ Error seeding enrollment: ${(e as Error).message}`)
            }
        }
    }

    console.log(`   Processed ${created.length} enrollments`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedProgress(payload: Payload, enrollments: any[], lessons: any[]) {
    console.log('   Creating/Updating progress records...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    // Create progress for first few lessons for each enrollment
    for (const enrollment of enrollments) {
        const lessonsToTrack = Math.min(enrollment.progress?.lessonsCompleted || 3, lessons.length)

        for (let i = 0; i < lessonsToTrack; i++) {
            const lesson = lessons[i]

            try {
                const existing = await payload.find({
                    collection: 'progress',
                    where: {
                        and: [
                            { enrollment: { equals: enrollment.id } },
                            { lesson: { equals: lesson.id } },
                        ],
                    },
                    limit: 1,
                })

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const startedAt = existing.docs.length > 0 ? new Date((existing.docs[0] as any).startedAt) : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                const isComplete = Math.random() > 0.2

                const data = {
                    enrollment: enrollment.id,
                    lesson: lesson.id,
                    status: (isComplete ? 'completed' : 'in-progress') as 'completed' | 'in-progress',
                    startedAt: startedAt.toISOString(),
                    completedAt: isComplete ? new Date(startedAt.getTime() + 30 * 60 * 1000).toISOString() : undefined,
                    lastAccessedAt: new Date().toISOString(),
                    videoProgress: {
                        watchedSeconds: isComplete ? 1200 : Math.floor(Math.random() * 1000),
                        totalSeconds: 1200,
                        percentWatched: isComplete ? 100 : Math.floor(Math.random() * 80),
                        lastPosition: isComplete ? 0 : Math.floor(Math.random() * 1000),
                    },
                    timeSpent: Math.floor(Math.random() * 3600) + 300,
                }

                if (existing.docs.length === 0) {
                    const progress = await payload.create({
                        collection: 'progress',
                        data,
                    })
                    created.push(progress)
                } else {
                    const progress = await payload.update({
                        collection: 'progress',
                        id: existing.docs[0].id,
                        data,
                    })
                    created.push(progress)
                }
            } catch (_e) {
                // Skip silently for progress records
            }
        }
    }

    console.log(`   Processed ${created.length} progress records`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedQuizAttempts(payload: Payload, enrollments: any[], quizzes: any[]) {
    console.log('   Creating/Updating quiz attempts...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    // Create quiz attempts for some enrollments
    for (let i = 0; i < enrollments.length; i++) {
        const enrollment = enrollments[i]
        if (i % 2 !== 0) continue // Only half have quiz attempts

        for (let j = 0; j < Math.min(2, quizzes.length); j++) {
            const quiz = quizzes[j]

            try {
                const existing = await payload.find({
                    collection: 'quiz-attempts',
                    where: {
                        and: [
                            { enrollment: { equals: enrollment.id } },
                            { quiz: { equals: quiz.id } },
                        ],
                    },
                    limit: 1,
                })

                const passed = Math.random() > 0.3
                const percentage = passed ? 70 + Math.floor(Math.random() * 30) : 40 + Math.floor(Math.random() * 30)

                const data = {
                    enrollment: enrollment.id,
                    quiz: quiz.id,
                    attemptNumber: 1,
                    status: 'graded' as const,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    startedAt: existing.docs.length > 0 ? (existing.docs[0] as any).startedAt : new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    submittedAt: existing.docs.length > 0 ? (existing.docs[0] as any).submittedAt : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    gradedAt: new Date().toISOString(),
                    timeSpent: Math.floor(Math.random() * 1200) + 300,
                    answers: [
                        { questionIndex: 0, questionType: 'multiple-choice' as const, selectedOptions: [{ optionIndex: 0 }], isCorrect: passed, pointsAwarded: passed ? 2 : 0 },
                        { questionIndex: 1, questionType: 'true-false' as const, selectedOptions: [{ optionIndex: passed ? 1 : 0 }], isCorrect: passed, pointsAwarded: passed ? 1 : 0 },
                    ],
                    score: {
                        pointsEarned: Math.floor((percentage / 100) * 6),
                        pointsPossible: 6,
                        percentage,
                    },
                    passed,
                }

                if (existing.docs.length === 0) {
                    const attempt = await payload.create({
                        collection: 'quiz-attempts',
                        data,
                    })
                    created.push(attempt)
                } else {
                    const attempt = await payload.update({
                        collection: 'quiz-attempts',
                        id: existing.docs[0].id,
                        data,
                    })
                    created.push(attempt)
                }
            } catch (_e) {
                // Skip silently
            }
        }
    }

    console.log(`   Processed ${created.length} quiz attempts`)
    return created
}
