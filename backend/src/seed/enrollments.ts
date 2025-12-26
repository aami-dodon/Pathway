/**
 * Enrollment & Progress Seed Data
 */
import type { Payload } from 'payload'

export async function seedEnrollments(payload: Payload, subscriberProfiles: any[], courses: any[]) {
    console.log('   Creating enrollments...')
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
                        data: {
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
                        },
                    })
                    created.push(enrollment)
                } else {
                    created.push(existing.docs[0])
                }
            } catch (e) {
                console.log(`   ⚠️ Skipping enrollment: ${(e as Error).message}`)
            }
        }
    }

    console.log(`   Created ${created.length} enrollments`)
    return created
}

export async function seedProgress(payload: Payload, enrollments: any[], lessons: any[]) {
    console.log('   Creating progress records...')
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

                if (existing.docs.length === 0) {
                    const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                    const isComplete = Math.random() > 0.2

                    const progress = await payload.create({
                        collection: 'progress',
                        data: {
                            enrollment: enrollment.id,
                            lesson: lesson.id,
                            status: isComplete ? 'completed' : 'in-progress',
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
                        },
                    })
                    created.push(progress)
                }
            } catch (e) {
                // Skip silently for progress records
            }
        }
    }

    console.log(`   Created ${created.length} progress records`)
    return created
}

export async function seedQuizAttempts(payload: Payload, enrollments: any[], quizzes: any[]) {
    console.log('   Creating quiz attempts...')
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

                if (existing.docs.length === 0) {
                    const passed = Math.random() > 0.3
                    const percentage = passed ? 70 + Math.floor(Math.random() * 30) : 40 + Math.floor(Math.random() * 30)

                    const attempt = await payload.create({
                        collection: 'quiz-attempts',
                        data: {
                            enrollment: enrollment.id,
                            quiz: quiz.id,
                            attemptNumber: 1,
                            status: 'graded',
                            startedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
                            submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                            gradedAt: new Date().toISOString(),
                            timeSpent: Math.floor(Math.random() * 1200) + 300,
                            answers: [
                                { questionIndex: 0, questionType: 'multiple-choice', selectedOptions: [{ optionIndex: 0 }], isCorrect: passed, pointsAwarded: passed ? 2 : 0 },
                                { questionIndex: 1, questionType: 'true-false', selectedOptions: [{ optionIndex: passed ? 1 : 0 }], isCorrect: passed, pointsAwarded: passed ? 1 : 0 },
                            ],
                            score: {
                                pointsEarned: Math.floor((percentage / 100) * 6),
                                pointsPossible: 6,
                                percentage,
                            },
                            passed,
                        },
                    })
                    created.push(attempt)
                }
            } catch (e) {
                // Skip silently
            }
        }
    }

    console.log(`   Created ${created.length} quiz attempts`)
    return created
}
